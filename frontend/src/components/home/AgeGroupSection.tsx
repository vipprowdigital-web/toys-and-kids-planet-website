import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { ageGroups } from "@/data/index";

export default function AgeGroupSection() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-coral border border-gold/40 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            Discover by Age
          </div>
          <h2 className="section-title">
            Shop by <span className="text-coral">Age Group</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Every toy is age-appropriate. Find the perfect match for your
            child&apos;s developmental stage.
          </p>
        </div>

        {/* Age Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          {ageGroups.map((age, i) => (
            <Link
              key={age.id}
              href={`/age-groups/${age.slug}`}
              className={clsx(
                "age-card relative rounded-3xl border-2 group cursor-pointer hover:rotate-10 transform-gpu will-change-transform overflow-hidden",
                age.borderColor,
                i === 1 || i === 3 ? "sm:mt-6" : "",
              )}
            >
              {/* Background */}
              <div
                className={clsx("absolute inset-0 bg-linear-to-b", age.color)}
              />

              {/* Image */}
              <div className="relative aspect-3/4 rounded-3xl overflow-hidden">
                <Image
                  src={age.image}
                  alt={age.label}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end sm:p-3">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2.5 border border-white shadow-sm">
                  <h3 className="font-display font-bold text-brand-navy text-sm sm:text-lg leading-tight mb-1">
                    {age.label}
                  </h3>
                  <p className="text-brand-gray text-[10px] sm:text-xs leading-tight sm:leading-relaxed mb-1 sm:mb-2">
                    {age.description}
                  </p>
                  <div className="flex items-center justify-between">
                    {/* <span className="text-xs text-brand-light-gray font-medium">
                      {age.productCount} toys
                    </span> */}
                    <span className="flex items-center gap-1 text-coral text-xs font-semibold group-hover:gap-2 transition-all">
                      Shop <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA strip */}
        {/* <div className="mt-16 bg-linear-to-r from-teal/20 via-teal/10 to-gold/20 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-bold text-2xl text-brand-navy mb-2">
              Not sure which toy to pick?
            </h3>
            <p className="text-brand-gray">
              Use our smart toy finder to discover the perfect toy based on your
              child&apos;s age, interests, and developmental goals.
            </p>
          </div>
          <Link href="/shop" className="btn-primary shrink-0 px-8!">
            Try Toy Finder
            <ArrowRight size={18} />
          </Link>
        </div> */}
      </div>
    </section>
  );
}
