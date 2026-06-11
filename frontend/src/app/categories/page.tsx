// import Link from "next/link";
// import Image from "next/image";
// import { ArrowRight } from "lucide-react";
// import { getProductCategories } from "@/lib/api";
// import { categories as mockCategories } from "@/data";
// import type { ProductCategory } from "@/types";

// export default async function CategoriesPage() {
//   let displayCats: ProductCategory[] = [];

//   try {
//     const res = await getProductCategories({ limit: 50 });
//     if (res.success && res.data.length > 0) {
//       displayCats = res.data;
//     }
//   } catch {
//     // API unavailable — use mock data below
//   }

//   // Fallback placeholder when API is empty
//   // const useMock = displayCats.length === 0;
//   // const fallbackCats = mockCategories.map((cat) => ({
//   //   _id: cat.id,
//   //   name: cat.name,
//   //   slug: cat.slug,
//   //   icon: cat.icon,
//   //   color: cat.color,
//   //   image: { url: cat.image, publicId: "" },
//   //   isActive: true,
//   //   createdAt: "",
//   //   updatedAt: "",
//   // })) satisfies ProductCategory[];

//   // const cats = useMock ? fallbackCats : displayCats;
//   // const cats = displayCats;

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

//         {(displayCats.length === 0) ? (
//           <div className="flex flex-col justify-center items-center">
//             <p>
//               No Categories Found.
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {displayCats.map((cat) => (
//               <Link
//                 key={cat._id}
//                 href={`/categories/${cat.slug}`}
//                 className="group bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
//               >
//                 {/* Image */}
//                 <div className="relative h-50 overflow-hidden">
//                   {cat.image?.url ? (
//                     <Image
//                       src={cat.image.url}
//                       alt={cat.name}
//                       fill
//                       className="object-cover group-hover:scale-110 transition-transform duration-500"
//                     />
//                   ) : (
//                     <div className={`w-full h-full ${cat.color || "bg-teal"} opacity-20`} />
//                   )}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
//                 </div>

//                 {/* Content */}
//                 <div className="p-6 flex items-center justify-between">
//                   <div className="flex-1">
//                     <h2 className="font-display font-bold text-xl text-brand-navy group-hover:text-coral transition-colors">
//                       {cat.name}
//                     </h2>
//                     {cat.description && (
//                       <p className="text-brand-light-gray text-sm mt-0.5 line-clamp-1">
//                         {cat.description}
//                       </p>
//                     )}
//                   </div>
//                   <div className="w-10 h-10 rounded-full border-2 border-gray-100 flex items-center justify-center text-brand-light-gray group-hover:border-coral group-hover:text-coral group-hover:bg-coral/5 transition-all">
//                     <ArrowRight size={18} />
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
// import { categories as mockCategories } from "@/data";
import type { ProductCategory } from "@/types";

export default async function CategoriesPage() {
  let displayCats: ProductCategory[] = [];

  try {
    const res = await getProductCategories({ limit: 50 });
    if (res.success && res.data.length > 0) {
      displayCats = res.data;
    }
  } catch {
    // API unavailable — fallback to fallback logic if needed
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-teal-gradient py-16">
        <div className="container-custom text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-navy mb-3">
            Shop by Category
          </h1>
          <p className="text-brand-gray text-lg max-w-xl mx-auto">
            From building blocks to STEM kits — explore toys across every
            category
          </p>
        </div>
      </div>

      <div className="container-custom py-16">
        {displayCats.length === 0 ? (
          <div className="flex flex-col justify-center items-center">
            <p>No Categories Found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCats.map((cat) => (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug}`}
                className="group relative block aspect-4/3 w-full overflow-hidden rounded-3xl bg-white shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                {/* Image Container - Displays initially */}
                <div className="absolute inset-0 w-full h-full">
                  {cat.image?.url ? (
                    <Image
                      src={cat.image.url}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      priority
                    />
                  ) : (
                    <div className={`w-full h-full ${cat.color || "bg-teal"}`} />
                  )}
                  {/* Default Subtle Bottom Gradient Overlay for visible image text fallback */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                  
                  {/* Category Name Overlay visible on top of image before hover */}
                  <div className="absolute bottom-6 left-6 right-6 transition-all duration-300 transform translate-x-0 group-hover:-translate-x-full group-hover:opacity-0">
                    <h2 className="font-display font-bold text-2xl text-white drop-shadow-sm">
                      {cat.name}
                    </h2>
                  </div>
                </div>

                {/* Sliding Content Overlay - Enters from the Left on Hover */}
                <div className="absolute inset-0 w-full h-full bg-brand-navy/95 p-8 flex flex-col justify-between transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform -translate-x-full group-hover:translate-x-0 z-10">
                  <div className="flex-1 flex flex-col justify-center">
                    <h2 className="font-display font-bold text-2xl text-white mb-3">
                      {cat.name}
                    </h2>
                    <p className="text-brand-light-gray text-sm md:text-base leading-relaxed line-clamp-4">
                      {cat.description || "Explore our collection of handpicked premium educational items and toys chosen specifically for this class."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                    <span className="text-coral font-semibold text-sm tracking-wider uppercase">
                      Explore Category
                    </span>
                    <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center text-white shadow-btn transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-100">
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