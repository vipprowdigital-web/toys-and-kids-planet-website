/**
 * bulkUpload.controller.js
 *
 * Key fix in this version:
 *   insertMany() bypasses Mongoose pre-save hooks, so the slug pre-save hook
 *   never runs → every document gets slug=undefined → MongoDB stores null for
 *   all of them → E11000 duplicate key on the unique slug index.
 *
 *   Fix: generate slugs in the controller with a collision-safe helper that
 *   appends "-2", "-3" etc. when the base slug already exists in the DB or
 *   appears more than once in the current batch.
 */

import XLSX from "xlsx";
import Product from "../models/product.model.js";
import ProductCategory from "../models/productCategory.model.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryService.js";
import multer from "multer";

const CLOUDINARY_FOLDER = "ambikaTraders/products";
const BATCH_SIZE = 500;

// ─── Multer ───────────────────────────────────────────────────────────────────

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isExcel =
      file.mimetype.includes("spreadsheet") ||
      file.mimetype.includes("excel") ||
      file.originalname.endsWith(".xlsx") ||
      file.originalname.endsWith(".xls");
    const isImage = file.mimetype.startsWith("image/");
    cb(
      isExcel || isImage
        ? null
        : new Error(`Unsupported file: ${file.mimetype}`),
      isExcel || isImage,
    );
  },
}).fields([
  { name: "excel", maxCount: 1 },
  { name: "images", maxCount: 5000 },
]);

// ─── Slug helpers ─────────────────────────────────────────────────────────────

/** Convert a product name to a base slug — mirrors the pre-save hook exactly. */
function toBaseSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Given an array of product docs (each with a `name`), assign a unique `slug`
 * to every doc.
 *
 * Strategy:
 *   1. Build the base slug for every doc.
 *   2. Query the DB once for any existing slugs that share those bases.
 *   3. Walk through the docs in order; if a slug is already taken (in DB or
 *      by an earlier doc in this batch) append -2, -3, … until it's free.
 */
async function assignSlugs(productDocs) {
  const baseSlugs = productDocs.map((d) => toBaseSlug(d.name));

  // Fetch all slugs from the DB that start with any of our base slugs so we
  // can detect collisions without N round trips.
  const existingDocs = await Product.find(
    { slug: { $in: baseSlugs } },
    { slug: 1, _id: 0 },
  ).lean();
  // Also fetch slugs like "my-product-2", "my-product-3" etc.
  const existingDocs2 = await Product.find(
    {
      slug: {
        $regex: `^(${baseSlugs.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(|-\\d+)$`,
      },
    },
    { slug: 1, _id: 0 },
  ).lean();

  // All slugs currently in the DB (for our base set)
  const takenSlugs = new Set([
    ...existingDocs.map((d) => d.slug),
    ...existingDocs2.map((d) => d.slug),
  ]);

  // Slugs claimed by earlier docs in THIS batch
  const batchSlugs = new Set();

  for (let i = 0; i < productDocs.length; i++) {
    let candidate = baseSlugs[i];
    let counter = 2;

    // Increment until we find a slug that's free in both the DB and this batch
    while (takenSlugs.has(candidate) || batchSlugs.has(candidate)) {
      candidate = `${baseSlugs[i]}-${counter}`;
      counter++;
    }

    productDocs[i].slug = candidate;
    batchSlugs.add(candidate);
  }

  return productDocs;
}

// ─── Strip asterisks from SheetJS keys ───────────────────────────────────────

function normaliseKeys(row) {
  const clean = {};
  for (const [key, value] of Object.entries(row)) {
    clean[key.replace(/\s*\*+\s*$/, "").trim()] = value;
  }
  return clean;
}

// ─── Row validation ───────────────────────────────────────────────────────────

function validateRow(row, excelRowNum, imageFileMap, categoryMap) {
  const errors = [];

  if (!row.name?.toString().trim())
    errors.push(`Row ${excelRowNum}: 'name' is required.`);
  if (!row.description?.toString().trim())
    errors.push(`Row ${excelRowNum}: 'description' is required.`);
  if (!row.category?.toString().trim())
    errors.push(`Row ${excelRowNum}: 'category' is required.`);
  else if (!categoryMap[row.category.toString().trim().toLowerCase()])
    errors.push(
      `Row ${excelRowNum}: Category "${row.category}" does not exist in the database.`,
    );

  if (!row.spec_material?.toString().trim())
    errors.push(`Row ${excelRowNum}: 'spec_material' is required.`);
  if (!row.variant_finish?.toString().trim())
    errors.push(`Row ${excelRowNum}: 'variant_finish' is required.`);
  if (
    row.variant_size_value === undefined ||
    row.variant_size_value === "" ||
    isNaN(Number(row.variant_size_value))
  )
    errors.push(
      `Row ${excelRowNum}: 'variant_size_value' must be a valid number.`,
    );
  if (!["mm", "inch", "cm"].includes(row.variant_size_unit?.toString().trim()))
    errors.push(
      `Row ${excelRowNum}: 'variant_size_unit' must be mm, inch, or cm.`,
    );

  if (row.variant_price !== undefined && row.variant_price !== "") {
    if (isNaN(Number(row.variant_price)) || Number(row.variant_price) < 0)
      errors.push(
        `Row ${excelRowNum}: 'variant_price' must be a non-negative number.`,
      );
  }
  if (
    row.variant_discountPrice !== undefined &&
    row.variant_discountPrice !== ""
  ) {
    if (
      isNaN(Number(row.variant_discountPrice)) ||
      Number(row.variant_discountPrice) < 0
    )
      errors.push(
        `Row ${excelRowNum}: 'variant_discountPrice' must be a non-negative number.`,
      );
    if (
      row.variant_price &&
      Number(row.variant_discountPrice) >= Number(row.variant_price)
    )
      errors.push(
        `Row ${excelRowNum}: 'variant_discountPrice' must be less than 'variant_price'.`,
      );
  }

  const imgFields = [
    "variant_img1",
    "variant_img2",
    "variant_img3",
    "variant_img4",
    "product_img1",
    "product_img2",
    "product_img3",
  ];
  for (const field of imgFields) {
    const fname = row[field]?.toString().trim();
    if (fname && !imageFileMap[fname])
      errors.push(
        `Row ${excelRowNum}: Image "${fname}" (column '${field}') was not found in the uploaded images folder.`,
      );
  }

  return errors;
}

// ─── Row → Variant sub-document ───────────────────────────────────────────────

function rowToVariant(row, cloudinaryMap) {
  const img = (fname) => {
    const f = fname?.toString().trim();
    return f && cloudinaryMap[f]
      ? { url: cloudinaryMap[f].url, publicId: cloudinaryMap[f].publicId }
      : null;
  };
  return {
    sku: row.variant_sku?.toString().trim() || undefined,
    finish: row.variant_finish.toString().trim(),
    size: {
      value: Number(row.variant_size_value),
      unit: row.variant_size_unit.toString().trim(),
    },
    price: row.variant_price ? Number(row.variant_price) : undefined,
    discountPrice: row.variant_discountPrice
      ? Number(row.variant_discountPrice)
      : undefined,
    isAvailable: true,
    images: [
      img(row.variant_img1),
      img(row.variant_img2),
      img(row.variant_img3),
      img(row.variant_img4),
    ].filter(Boolean),
  };
}

// ─── Group flat rows → product documents ──────────────────────────────────────

function groupRowsIntoProducts(rows, cloudinaryMap, categoryMap) {
  const productMap = new Map();

  for (const row of rows) {
    const key = `${row.name.toString().trim().toLowerCase()}|||${row.category.toString().trim().toLowerCase()}`;

    if (!productMap.has(key)) {
      const img = (fname) => {
        const f = fname?.toString().trim();
        return f && cloudinaryMap[f]
          ? { url: cloudinaryMap[f].url, publicId: cloudinaryMap[f].publicId }
          : null;
      };
      productMap.set(key, {
        name: row.name.toString().trim(),
        // slug is assigned later by assignSlugs() — do NOT set it here
        description: row.description.toString().trim(),
        category: categoryMap[row.category.toString().trim().toLowerCase()],
        images: [
          img(row.product_img1),
          img(row.product_img2),
          img(row.product_img3),
        ].filter(Boolean),
        specifications: {
          material: row.spec_material.toString().trim(),
          mechanism: row.spec_mechanism?.toString().trim() || undefined,
          weightCapacity:
            row.spec_weightCapacity?.toString().trim() || undefined,
          packagingUnit: row.spec_packagingUnit?.toString().trim() || "Piece",
        },
        variants: [],
        isFeatured: false,
        isActive: true,
      });
    }
    productMap.get(key).variants.push(rowToVariant(row, cloudinaryMap));
  }

  return Array.from(productMap.values());
}

// ─── Batch insert ─────────────────────────────────────────────────────────────

async function insertBatch(batch, batchNum) {
  const insertedIds = [];
  const insertErrors = [];

  try {
    const result = await Product.insertMany(batch, { ordered: false });
    insertedIds.push(...result.map((p) => p._id));
  } catch (bulkErr) {
    if (bulkErr.name === "MongoBulkWriteError" || bulkErr.result) {
      const insertedMap = bulkErr.result?.insertedIds || {};
      for (const id of Object.values(insertedMap)) {
        if (id) insertedIds.push(id);
      }
      const writeErrors =
        bulkErr.writeErrors || bulkErr.result?.writeErrors || [];
      for (const we of writeErrors) {
        const idx = we.index ?? we.err?.index ?? "?";
        const doc = batch[idx];
        const productName = doc?.name || `index ${idx}`;
        const errmsg =
          we.errmsg || we.err?.errmsg || we.message || "Unknown error";
        if (errmsg.includes("E11000") || errmsg.includes("duplicate key")) {
          insertErrors.push(
            `Batch ${batchNum}: "${productName}" — duplicate entry (a product with this slug already exists).`,
          );
        } else {
          insertErrors.push(`Batch ${batchNum}: "${productName}" — ${errmsg}`);
        }
      }
    } else {
      insertErrors.push(`Batch ${batchNum}: ${bulkErr.message}`);
    }
  }

  return { insertedIds, insertErrors };
}

// ─── Main SSE controller ──────────────────────────────────────────────────────

export const bulkUploadProducts = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (type, payload) => {
    res.write(`data: ${JSON.stringify({ type, ...payload })}\n\n`);
    if (typeof res.flush === "function") res.flush();
  };

  try {
    if (!req.files?.excel?.[0]) {
      send("error", {
        message: "No Excel file received. Please attach the template.",
      });
      return res.end();
    }

    send("progress", { message: "Files received. Parsing Excel…", percent: 5 });

    const workbook = XLSX.read(req.files.excel[0].buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "", range: 1 });
    const normalisedRows = rawRows.map(normaliseKeys);

    const rows = normalisedRows.filter((r) => {
      const name = r.name?.toString().trim();
      return name && !name.startsWith("[");
    });

    if (rows.length === 0) {
      send("error", {
        message:
          "The Excel file appears to be empty or contains only example/hint rows.",
      });
      return res.end();
    }

    send("progress", {
      message: `Parsed ${rows.length} data row${rows.length !== 1 ? "s" : ""}. Loading categories…`,
      percent: 10,
    });

    const allCategories = await ProductCategory.find({ isActive: true }).select(
      "_id name",
    );
    const categoryMap = {};
    for (const cat of allCategories)
      categoryMap[cat.name.toLowerCase()] = cat._id;

    const imageFileMap = {};
    for (const file of req.files?.images || [])
      imageFileMap[file.originalname] = file;

    send("progress", { message: "Validating all rows…", percent: 15 });

    const allErrors = [];
    rows.forEach((row, index) => {
      allErrors.push(...validateRow(row, index + 4, imageFileMap, categoryMap));
    });

    if (allErrors.length > 0) {
      send("validation_errors", {
        message: `Found ${allErrors.length} validation error${allErrors.length !== 1 ? "s" : ""}. Nothing was uploaded.`,
        errors: allErrors,
        percent: 15,
      });
      return res.end();
    }

    send("progress", {
      message: `All ${rows.length} rows valid. Uploading images to Cloudinary…`,
      percent: 20,
    });

    const cloudinaryMap = {};
    const imageFiles = req.files?.images || [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      try {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: CLOUDINARY_FOLDER,
          public_id: file.originalname.replace(/\.[^/.]+$/, ""),
        });
        cloudinaryMap[file.originalname] = {
          url: result.secure_url || result.url,
          publicId: result.public_id,
        };
      } catch (err) {
        send("error", {
          message: `Failed to upload image "${file.originalname}": ${err.message}`,
        });
        return res.end();
      }

      if ((i + 1) % 5 === 0 || i + 1 === imageFiles.length) {
        send("progress", {
          message: `Uploaded ${i + 1} / ${imageFiles.length} image${imageFiles.length !== 1 ? "s" : ""}…`,
          percent: Math.round(20 + ((i + 1) / imageFiles.length) * 40),
        });
      }
    }

    send("progress", { message: "Building product documents…", percent: 62 });

    const productDocs = groupRowsIntoProducts(rows, cloudinaryMap, categoryMap);

    // ── KEY FIX: generate slugs here since insertMany skips pre-save hooks ──
    send("progress", {
      message: `Generating unique slugs for ${productDocs.length} product${productDocs.length !== 1 ? "s" : ""}…`,
      percent: 63,
    });
    await assignSlugs(productDocs);

    send("progress", {
      message: `Built ${productDocs.length} product${productDocs.length !== 1 ? "s" : ""}. Saving to database in batches…`,
      percent: 65,
    });

    const allInsertedIds = [];
    const allInsertErrors = [];
    const totalBatches = Math.ceil(productDocs.length / BATCH_SIZE);

    for (let b = 0; b < totalBatches; b++) {
      const batch = productDocs.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
      const { insertedIds, insertErrors } = await insertBatch(batch, b + 1);

      allInsertedIds.push(...insertedIds);
      allInsertErrors.push(...insertErrors);

      send("progress", {
        message: `Saved batch ${b + 1} / ${totalBatches} (${insertedIds.length} saved${insertErrors.length ? `, ${insertErrors.length} failed` : ""})…`,
        percent: Math.round(65 + ((b + 1) / totalBatches) * 33),
      });
    }

    send("done", {
      message: "Bulk upload complete!",
      inserted: allInsertedIds.length,
      failed: allInsertErrors.length,
      errors: allInsertErrors,
      percent: 100,
    });
  } catch (err) {
    console.error("Bulk upload fatal error:", err);
    send("error", { message: `Unexpected server error: ${err.message}` });
  } finally {
    res.end();
  }
};

// /**
//  * bulkUpload.controller.js
//  *
//  * Handles Excel + image folder bulk product upload.
//  *
//  * Flow:
//  *   1. multer receives the Excel file and all images in memory
//  *   2. Parse Excel rows with SheetJS
//  *   3. Validate every row — collect ALL errors before rejecting
//  *   4. Upload images to Cloudinary, build a filename→URL map
//  *   5. Group rows by (name + category) to reconstruct variants
//  *   6. Batch-insert into MongoDB using insertMany (500 per batch)
//  *   7. Stream progress back to client via Server-Sent Events (SSE)
//  *
//  * Dependencies:
//  *   npm install xlsx multer mongoose
//  *   (cloudinaryService and Product model are already in your project)
//  */

// import XLSX from "xlsx";
// import mongoose from "mongoose";
// import Product from "../models/product.model.js";
// import ProductCategory from "../models/productCategory.model.js";
// import { uploadToCloudinary } from "../utils/cloudinaryService.js";

// const CLOUDINARY_FOLDER = "ambikaTraders/products";
// const BATCH_SIZE = 500;

// // ─── Multer Configuration ─────────────────────────────────────────────────────
// // We store everything in memory (no disk writes) because:
// //   - Images go straight to Cloudinary buffer upload
// //   - Excel file is parsed from buffer directly
// // Memory limit: multer default is no limit; set fileSize to protect your server.

// import multer from "multer";

// const storage = multer.memoryStorage();

// export const uploadMiddleware = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
//   fileFilter: (req, file, cb) => {
//     // Accept Excel files AND image files
//     const isExcel =
//       file.mimetype ===
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
//       file.mimetype === "application/vnd.ms-excel" ||
//       file.originalname.endsWith(".xlsx") ||
//       file.originalname.endsWith(".xls");

//     const isImage = file.mimetype.startsWith("image/");

//     if (isExcel || isImage) {
//       cb(null, true);
//     } else {
//       cb(new Error(`Unsupported file type: ${file.mimetype}`));
//     }
//   },
// }).fields([
//   { name: "excel", maxCount: 1 }, // The Excel template
//   { name: "images", maxCount: 5000 }, // All product/variant images
// ]);

// // ─── Row Validation ───────────────────────────────────────────────────────────
// /**
//  * Validates a single Excel row. Returns an array of error strings.
//  * We pass `rowNum` (the actual Excel row number, 1-indexed) so the admin
//  * can find exactly which row to fix.
//  */
// function validateRow(row, rowNum, imageMap, categoryMap) {
//   const errors = [];
//   const r = (field) => `Row ${rowNum}: `;

//   // Required product-level fields
//   if (!row.name?.toString().trim())
//     errors.push(`Row ${rowNum}: 'name' is required.`);
//   if (!row.description?.toString().trim())
//     errors.push(`Row ${rowNum}: 'description' is required.`);
//   if (!row.category?.toString().trim())
//     errors.push(`Row ${rowNum}: 'category' is required.`);
//   else if (!categoryMap[row.category.toString().trim().toLowerCase()])
//     errors.push(
//       `Row ${rowNum}: Category "${row.category}" does not exist in the database.`,
//     );

//   // Required specification fields
//   if (!row.spec_material?.toString().trim())
//     errors.push(`Row ${rowNum}: 'spec_material' is required.`);

//   // Required variant fields
//   if (!row.variant_finish?.toString().trim())
//     errors.push(`Row ${rowNum}: 'variant_finish' is required.`);
//   if (
//     row.variant_size_value === undefined ||
//     row.variant_size_value === "" ||
//     isNaN(Number(row.variant_size_value))
//   )
//     errors.push(
//       `Row ${rowNum}: 'variant_size_value' must be a valid number (e.g. 96).`,
//     );
//   if (!["mm", "inch", "cm"].includes(row.variant_size_unit?.toString().trim()))
//     errors.push(
//       `Row ${rowNum}: 'variant_size_unit' must be one of: mm, inch, cm.`,
//     );

//   // Optional price validation
//   if (row.variant_price !== undefined && row.variant_price !== "") {
//     if (isNaN(Number(row.variant_price)) || Number(row.variant_price) < 0)
//       errors.push(
//         `Row ${rowNum}: 'variant_price' must be a non-negative number.`,
//       );
//   }
//   if (
//     row.variant_discountPrice !== undefined &&
//     row.variant_discountPrice !== ""
//   ) {
//     if (
//       isNaN(Number(row.variant_discountPrice)) ||
//       Number(row.variant_discountPrice) < 0
//     )
//       errors.push(
//         `Row ${rowNum}: 'variant_discountPrice' must be a non-negative number.`,
//       );
//     if (
//       row.variant_price &&
//       Number(row.variant_discountPrice) >= Number(row.variant_price)
//     )
//       errors.push(
//         `Row ${rowNum}: 'variant_discountPrice' (${row.variant_discountPrice}) must be less than 'variant_price' (${row.variant_price}).`,
//       );
//   }

//   // Image filename validation — check every referenced image filename exists
//   const imgFields = [
//     "variant_img1",
//     "variant_img2",
//     "variant_img3",
//     "variant_img4",
//     "product_img1",
//     "product_img2",
//     "product_img3",
//   ];
//   for (const field of imgFields) {
//     const fname = row[field]?.toString().trim();
//     if (fname && !imageMap[fname]) {
//       errors.push(
//         `Row ${rowNum}: Image file "${fname}" (column '${field}') was not found in the uploaded images folder.`,
//       );
//     }
//   }

//   return errors;
// }

// // ─── Row → MongoDB Document Transformer ──────────────────────────────────────
// /**
//  * Converts a flat Excel row into a variant sub-document.
//  * The caller is responsible for grouping rows into products.
//  */
// function rowToVariant(row, cloudinaryMap) {
//   const getImageObj = (fname) => {
//     const f = fname?.toString().trim();
//     if (!f || !cloudinaryMap[f]) return null;
//     return { url: cloudinaryMap[f].url, publicId: cloudinaryMap[f].publicId };
//   };

//   const variantImages = [
//     getImageObj(row.variant_img1),
//     getImageObj(row.variant_img2),
//     getImageObj(row.variant_img3),
//     getImageObj(row.variant_img4),
//   ].filter(Boolean);

//   return {
//     sku: row.variant_sku?.toString().trim() || undefined,
//     finish: row.variant_finish.toString().trim(),
//     size: {
//       value: Number(row.variant_size_value),
//       unit: row.variant_size_unit.toString().trim(),
//     },
//     price: row.variant_price ? Number(row.variant_price) : undefined,
//     discountPrice: row.variant_discountPrice
//       ? Number(row.variant_discountPrice)
//       : undefined,
//     isAvailable: true,
//     images: variantImages,
//   };
// }

// /**
//  * Groups flat rows (each row = one variant) into product documents.
//  * Two rows belong to the same product when they share identical `name` + `category`.
//  * The first row of a group provides the product-level fields.
//  */
// function groupRowsIntoProducts(rows, cloudinaryMap, categoryMap) {
//   // Use "name|||category" as the grouping key
//   const productMap = new Map();

//   for (const row of rows) {
//     const key = `${row.name.toString().trim().toLowerCase()}|||${row.category.toString().trim().toLowerCase()}`;

//     if (!productMap.has(key)) {
//       // First time we see this product — initialise the product doc
//       const getImageObj = (fname) => {
//         const f = fname?.toString().trim();
//         if (!f || !cloudinaryMap[f]) return null;
//         return {
//           url: cloudinaryMap[f].url,
//           publicId: cloudinaryMap[f].publicId,
//         };
//       };

//       const productImages = [
//         getImageObj(row.product_img1),
//         getImageObj(row.product_img2),
//         getImageObj(row.product_img3),
//       ].filter(Boolean);

//       const includedComponents = row.spec_includedComponents
//         ? row.spec_includedComponents
//             .toString()
//             .split(",")
//             .map((s) => s.trim())
//             .filter(Boolean)
//         : [];

//       productMap.set(key, {
//         name: row.name.toString().trim(),
//         description: row.description.toString().trim(),
//         category: categoryMap[row.category.toString().trim().toLowerCase()],
//         images: productImages,
//         specifications: {
//           material: row.spec_material.toString().trim(),
//           mechanism: row.spec_mechanism?.toString().trim() || undefined,
//           weightCapacity:
//             row.spec_weightCapacity?.toString().trim() || undefined,
//           packagingUnit: row.spec_packagingUnit?.toString().trim() || "Piece",
//           includedComponents,
//         },
//         variants: [],
//         isFeatured: false,
//         isActive: true,
//       });
//     }

//     // Add this row's variant to the product
//     productMap.get(key).variants.push(rowToVariant(row, cloudinaryMap));
//   }

//   return Array.from(productMap.values());
// }

// // ─── Main Controller ──────────────────────────────────────────────────────────
// /**
//  * POST /admin/products/bulk-upload
//  *
//  * This endpoint uses Server-Sent Events (SSE) so the React frontend can
//  * display real-time progress without polling. The response never "ends" until
//  * we explicitly close it with sendEvent("done", ...).
//  *
//  * SSE format:  data: {"type":"progress","message":"...","percent":42}\n\n
//  */
// export const bulkUploadProducts = async (req, res) => {
//   // ── SSE Setup ───────────────────────────────────────────────────────────────
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.flushHeaders(); // Push headers immediately so the browser opens the stream

//   const sendEvent = (type, payload) => {
//     // SSE requires "data: ...\n\n"
//     res.write(`data: ${JSON.stringify({ type, ...payload })}\n\n`);
//   };

//   try {
//     // ── 1. Validate incoming files ───────────────────────────────────────────
//     if (!req.files?.excel?.[0]) {
//       sendEvent("error", {
//         message: "No Excel file received. Please attach the template.",
//       });
//       return res.end();
//     }

//     sendEvent("progress", {
//       message: "Files received. Parsing Excel…",
//       percent: 5,
//     });

//     // ── 2. Parse Excel ───────────────────────────────────────────────────────
//     const excelBuffer = req.files.excel[0].buffer;
//     const workbook = XLSX.read(excelBuffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0]; // Always use the first sheet (PRODUCTS)
//     const sheet = workbook.Sheets[sheetName];

//     // sheet_to_json skips rows 1-3 (headers/hints) using the `range` option.
//     // Row 1 = section banners, Row 2 = column headers, Row 3 = type hints.
//     // Row 4 = example data (admin may or may not have deleted it).
//     // We use row 2 as header row (0-indexed = row index 1).
//     const rawRows = XLSX.utils.sheet_to_json(sheet, {
//       defval: "", // Empty cells become "" not undefined
//       range: 1, // Start reading from row 2 (0-indexed row 1) = our headers
//     });

//     // Filter out the example row (row 4 in Excel = index 0 in rawRows if admin didn't delete it)
//     // We detect it by checking if the name matches the example text
//     const rows = rawRows.filter(
//       (r) =>
//         r.name?.toString().trim() &&
//         r.name?.toString().trim().toLowerCase() !== "cabinet handle premium", // example row
//     );

//     if (rows.length === 0) {
//       sendEvent("error", {
//         message:
//           "The Excel file appears to be empty. Please fill in at least one product row.",
//       });
//       return res.end();
//     }

//     sendEvent("progress", {
//       message: `Parsed ${rows.length} rows. Loading categories from database…`,
//       percent: 10,
//     });

//     // ── 3. Load all categories into a lookup map ─────────────────────────────
//     // We do a single DB query to get all categories, then look them up by name.
//     // This avoids N queries inside the validation loop.
//     const allCategories = await ProductCategory.find({ isActive: true }).select(
//       "_id name",
//     );
//     const categoryMap = {}; // { "cabinet handles": ObjectId("...") }
//     for (const cat of allCategories) {
//       categoryMap[cat.name.toLowerCase()] = cat._id;
//     }

//     // ── 4. Build image filename set from uploaded files ──────────────────────
//     // imageMap: { "filename.jpg": fileBuffer } — used during validation
//     const imageFileMap = {}; // for validation (just presence check)
//     for (const file of req.files?.images || []) {
//       imageFileMap[file.originalname] = file; // key by original filename
//     }

//     sendEvent("progress", {
//       message: "Validating all rows…",
//       percent: 15,
//     });

//     // ── 5. Validate ALL rows before doing anything destructive ───────────────
//     // We offset by 3 because Excel row 1 = section banner, row 2 = headers,
//     // row 3 = type hints, so data starts at row 4 (rowNum = index + 4).
//     const allErrors = [];
//     rows.forEach((row, index) => {
//       const excelRowNum = index + 4; // +1 for 0-index, +3 for header rows
//       const rowErrors = validateRow(
//         row,
//         excelRowNum,
//         imageFileMap,
//         categoryMap,
//       );
//       allErrors.push(...rowErrors);
//     });

//     if (allErrors.length > 0) {
//       sendEvent("validation_errors", {
//         message: `Found ${allErrors.length} validation error(s). Nothing was uploaded. Please fix these and re-upload.`,
//         errors: allErrors,
//       });
//       return res.end();
//     }

//     sendEvent("progress", {
//       message: `All ${rows.length} rows passed validation. Uploading images to Cloudinary…`,
//       percent: 20,
//     });

//     // ── 6. Upload all images to Cloudinary ───────────────────────────────────
//     // Build cloudinaryMap: { "filename.jpg": { url, publicId } }
//     const cloudinaryMap = {};
//     const imageFiles = req.files?.images || [];
//     const totalImages = imageFiles.length;

//     for (let i = 0; i < imageFiles.length; i++) {
//       const file = imageFiles[i];
//       try {
//         const result = await uploadToCloudinary(file.buffer, {
//           folder: CLOUDINARY_FOLDER,
//           // Use the original filename (without extension) as the public_id
//           // so re-uploads overwrite instead of creating duplicates
//           public_id: file.originalname.replace(/\.[^/.]+$/, ""),
//         });
//         cloudinaryMap[file.originalname] = {
//           url: result.secure_url || result.url,
//           publicId: result.public_id,
//         };
//       } catch (uploadErr) {
//         sendEvent("error", {
//           message: `Failed to upload image "${file.originalname}": ${uploadErr.message}`,
//         });
//         return res.end();
//       }

//       // Send progress every 10 images (avoid flooding the SSE stream)
//       if ((i + 1) % 10 === 0 || i + 1 === totalImages) {
//         const percent = Math.round(20 + ((i + 1) / totalImages) * 40); // 20%→60%
//         sendEvent("progress", {
//           message: `Uploaded ${i + 1} / ${totalImages} images…`,
//           percent,
//         });
//       }
//     }

//     sendEvent("progress", {
//       message: "All images uploaded. Building product documents…",
//       percent: 62,
//     });

//     // ── 7. Group rows into product documents ─────────────────────────────────
//     const productDocs = groupRowsIntoProducts(rows, cloudinaryMap, categoryMap);

//     sendEvent("progress", {
//       message: `Built ${productDocs.length} product(s) from ${rows.length} rows. Saving to database…`,
//       percent: 65,
//     });

//     // ── 8. Batch insert into MongoDB ─────────────────────────────────────────
//     // We split into batches of BATCH_SIZE to avoid overwhelming MongoDB
//     // with a single massive insertMany on 20k products.
//     // `ordered: false` means MongoDB continues inserting even if one document fails
//     // (e.g., duplicate slug), and reports all failures at the end.
//     const insertedIds = [];
//     const insertErrors = [];
//     const totalBatches = Math.ceil(productDocs.length / BATCH_SIZE);

//     for (let b = 0; b < totalBatches; b++) {
//       const batch = productDocs.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
//       try {
//         const result = await Product.insertMany(batch, { ordered: false });
//         insertedIds.push(...result.map((p) => p._id));
//       } catch (bulkErr) {
//         // insertMany with ordered:false throws a BulkWriteError even for partial success.
//         // result.insertedDocs contains successfully inserted ones.
//         if (bulkErr.insertedDocs) {
//           insertedIds.push(...bulkErr.insertedDocs.map((p) => p._id));
//         }
//         // Collect write errors (e.g., duplicate key on slug)
//         if (bulkErr.writeErrors) {
//           for (const we of bulkErr.writeErrors) {
//             insertErrors.push(
//               `Batch ${b + 1}, document ${we.index}: ${we.errmsg}`,
//             );
//           }
//         }
//       }

//       const percent = Math.round(65 + ((b + 1) / totalBatches) * 33); // 65%→98%
//       sendEvent("progress", {
//         message: `Saved batch ${b + 1} / ${totalBatches}…`,
//         percent,
//       });
//     }

//     // ── 9. Done ───────────────────────────────────────────────────────────────
//     sendEvent("done", {
//       message: `Bulk upload complete!`,
//       inserted: insertedIds.length,
//       failed: insertErrors.length,
//       errors: insertErrors, // partial failures reported to admin
//     });
//   } catch (err) {
//     console.error("Bulk upload error:", err);
//     sendEvent("error", { message: `Unexpected server error: ${err.message}` });
//   } finally {
//     res.end();
//   }
// };
