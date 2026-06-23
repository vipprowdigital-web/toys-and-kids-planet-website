// import Link from "next/link";
// import Image from "next/image";
// import { ArrowRight } from "lucide-react";
// import { getProductCategories } from "@/lib/api";
// // import { categories as mockCategories } from "@/data";
// import type { ProductCategory } from "@/types";

// export default async function CategoriesPage() {
//   let displayCats: ProductCategory[] = [];

//   try {
//     const res = await getProductCategories({ limit: 50 });
//     if (res.success && res.data.length > 0) {
//       displayCats = res.data;
//     }
//   } catch {
//     // API unavailable — fallback to fallback logic if needed
//   }

//   return (
//     <div className="min-h-screen bg-cream">
//       <div className="bg-teal-gradient py-16">
//         <div className="container-custom text-center">
//           <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-navy mb-3">
//             Shop by Category
//           </h1>
//           <p className="text-brand-gray text-lg max-w-xl mx-auto">
//             From building blocks to STEM kits — explore toys across every
//             category
//           </p>
//         </div>
//       </div>

//       <div className="container-custom py-16">
//         {displayCats.length === 0 ? (
//           <div className="flex flex-col justify-center items-center">
//             <p>No Categories Found.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {displayCats.map((cat) => (
//               <Link
//                 key={cat._id}
//                 href={`/categories/${cat.slug}`}
//                 className="group relative block aspect-4/3 w-full overflow-hidden rounded-3xl bg-white shadow-card hover:shadow-card-hover transition-all duration-300"
//               >
//                 {/* Image Container - Displays initially */}
//                 <div className="absolute inset-0 w-full h-full">
//                   {cat.image?.url ? (
//                     <Image
//                       src={cat.image.url}
//                       alt={cat.name}
//                       fill
//                       className="object-cover transition-transform duration-700 group-hover:scale-110"
//                       priority
//                       sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
//                     />
//                   ) : (
//                     <div className={`w-full h-full ${cat.color || "bg-teal"}`} />
//                   )}
//                   {/* Default Subtle Bottom Gradient Overlay for visible image text fallback */}
//                   <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300" />

//                   {/* Category Name Overlay visible on top of image before hover */}
//                   <div className="absolute bottom-6 left-6 right-6 transition-all duration-300 transform translate-x-0 group-hover:-translate-x-full group-hover:opacity-0">
//                     <h2 className="font-display font-bold text-2xl text-white drop-shadow-sm">
//                       {cat.name}
//                     </h2>
//                   </div>
//                 </div>

//                 {/* Sliding Content Overlay - Enters from the Left on Hover */}
//                 <div className="absolute inset-0 w-full h-full bg-brand-navy/95 p-8 flex flex-col justify-between transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform -translate-x-full group-hover:translate-x-0 z-10">
//                   <div className="flex-1 flex flex-col justify-center">
//                     <h2 className="font-display font-bold text-2xl text-white mb-3">
//                       {cat.name}
//                     </h2>
//                     <p className="text-brand-light-gray text-sm md:text-base leading-relaxed line-clamp-4">
//                       {cat.description || "Explore our collection of handpicked premium educational items and toys chosen specifically for this class."}
//                     </p>
//                   </div>

//                   <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
//                     <span className="text-coral font-semibold text-sm tracking-wider uppercase">
//                       Explore Category
//                     </span>
//                     <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center text-white shadow-btn transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-100">
//                       <ArrowRight size={18} />
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getProductCategories } from "@/lib/api";
import type { ProductCategory } from "@/types";

export default async function CategoriesPage() {
  let displayCats: ProductCategory[] = [];

  try {
    const res = await getProductCategories({ limit: 50 });
    if (res.success && res.data.length > 0) {
      displayCats = res.data;
    }
  } catch {
    // API unavailable — render empty state below
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* ---------- Hero ---------- */}
      <div className="relative overflow-hidden bg-cream py-16">
        <div className="container-custom text-center">
          <span className="mb-4 inline-block rounded-full bg-brand-navy px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white">
            Toy Shop
          </span>
          <h1 className="font-display text-4xl font-bold text-brand-navy md:text-5xl">
            Shop by{" "}
            <span className="relative inline-block">
              Category
              <span className="absolute inset-x-0 bottom-1 -z-10 h-2 rounded bg-yellow-400/80" />
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-brand-gray">
            From building blocks to STEM kits — explore toys across every
            category
          </p>
        </div>
      </div>

      {/* ---------- Grid ---------- */}
      <div className="container-custom pb-16 pt-4">
        {displayCats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-brand-light-gray">No Categories Found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayCats.map((cat) => (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug}`}
                className="group relative block aspect-4/3 w-full overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
              >
                {/* Image */}
                <div className="absolute inset-0 h-full w-full">
                  {cat.image?.url ? (
                    <Image
                      src={cat.image.url}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div
                      className={`h-full w-full ${cat.color || "bg-teal"}`}
                    />
                  )}
                </div>

                {/* Default name pill (hidden on hover) */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 rounded-full px-4 py-2.5 shadow-lg transition-all duration-300 group-hover:translate-y-2.5 group-hover:opacity-0">
                  {/* <span
                    className={`h-3 w-3 rounded-full ${cat.color || "bg-teal"}`}
                  /> */}
                  <span className="font-display text-base font-semibold text-brand-navy">
                    {cat.name}
                  </span>
                </div>

                {/* Color-flood panel (slides up on hover) */}
                <div
                  className={`absolute inset-0 flex translate-y-full flex-col justify-between p-6 transition-transform duration-500 ease-in-out group-hover:translate-y-0 ${
                    cat.color || "bg-coral"
                  }`}
                >
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white">
                      {cat.name}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/90 line-clamp-4">
                      {cat.description ||
                        "Explore our handpicked collection of toys chosen just for this category."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/25 pt-4">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-navy">
                      Explore Category
                    </span>
                    <div className="flex h-10 w-10 -translate-x-3 items-center justify-center rounded-full bg-white text-brand-navy opacity-0 shadow-btn transition-all delay-100 duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
