import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ageGroups } from "@/data/index";
import clsx from "clsx";

export default function AgeGroupsPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-linear-to-br from-gold/30 to-gold/10 py-16">
        <div className="container-custom text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-navy mb-3">
            Shop by Age Group
          </h1>
          <p className="text-brand-gray text-lg max-w-xl mx-auto">
            Every toy is carefully selected for the right developmental stage.
            Find the perfect toy for your child.
          </p>
        </div>
      </div>

      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ageGroups.map((age) => (
            <Link
              key={age.id}
              href={`/age-groups/${age.slug}`}
              className={clsx(
                "group relative rounded-3xl overflow-hidden border-2 age-card bg-white shadow-card",
                age.borderColor,
              )}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={age.image}
                  alt={age.label}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div
                  className={clsx(
                    "absolute inset-0 bg-linear-to-b",
                    age.color,
                    "opacity-80",
                  )}
                />

                {/* Emoji overlay */}
                {/* <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {age.emoji}
                  </span>
                </div> */}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="font-display font-bold text-2xl text-brand-navy group-hover:text-coral transition-colors">
                    {age.label}
                  </h2>
                  {/* <span className="badge-teal badge text-xs">
                    {age.productCount} toys
                  </span> */}
                </div>
                <p className="text-brand-gray text-sm leading-relaxed mb-4">
                  {age.description}
                </p>
                <div className="flex items-center text-coral font-semibold text-sm group-hover:gap-3 gap-2 transition-all">
                  Browse Toys <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
