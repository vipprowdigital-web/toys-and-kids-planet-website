import cloudinary from "../config/cloudinary.js";
import fs from "node:fs";

/*
    Upload file to cloudinary
*/

export const uploadToCloudinary = async (
  filePath,
  folder = process.env.CLOUDINARY_FOLDER,
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto", // auto-detect image/video/pdf
      transformation: [
        {
          width: 1200, // ✅ Resize large images down to 1200px wide (maintain aspect ratio)
          crop: "limit", // ✅ Prevent upscaling (only shrink if larger)
          quality: "auto", // ✅ Auto-optimize compression
          fetch_format: "auto", // ✅ Serve WebP/AVIF automatically
        },
      ], // optimize
    });

    // Auto Delete temp file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.warn("Failed to delete temp file:", err.message);
      });
    }

    return result;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);

    // Ensure even failed uploads clean temp files
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.warn("Failed to delete temp file:", err.message);
      });
    }
    throw new Error("Image upload failed.");
  } finally {
    // ✅ ALWAYS delete temp file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.warn("Temp file cleanup failed:", err.message);
        }
      });
    }
  }
};

const IMAGE_TRANSFORMATION = [
  {
    width: 1200, // Resize down to 1200px wide max (preserves aspect ratio)
    crop: "limit", // "limit" means: only shrink if larger, never upscale
    quality: "auto", // Let Cloudinary pick the optimal compression level
    fetch_format: "auto", // Serve WebP or AVIF automatically based on browser support
  },
];

export const uploadBufferToCloudinary = (
  buffer, // Node.js Buffer from file.buffer
  options = {}, // e.g. { folder, public_id }
) => {
  // Merge caller options with defaults so folder + transformations always apply
  const uploadOptions = {
    folder: options.folder || process.env.CLOUDINARY_FOLDER,
    resource_type: "auto",
    transformation: IMAGE_TRANSFORMATION,
    // public_id is optional — if provided, Cloudinary uses it as the filename.
    // The bulk controller passes the original filename (without extension) so
    // re-uploading the same image overwrites rather than creating duplicates.
    ...(options.public_id ? { public_id: options.public_id } : {}),
  };

  // We return a Promise so the caller can await it, just like uploadToCloudinary
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        // This callback fires once Cloudinary finishes (success or failure).
        // result contains secure_url, public_id, width, height etc.
        if (error) {
          console.error("Cloudinary buffer upload failed:", error.message);
          reject(new Error(`Image upload failed: ${error.message}`));
        } else {
          resolve(result);
        }
      },
    );

    // stream.end() both writes the data AND signals "no more data coming",
    // which tells Cloudinary's stream it can start processing.
    // This is equivalent to piping a file read stream: fs.createReadStream(path).pipe(stream)
    stream.end(buffer);
  });
};

// Delete file from Cloudinary using public_id
export const destroyFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete failed:", error.message);
    throw new Error("Image delete failed.");
  }
};
