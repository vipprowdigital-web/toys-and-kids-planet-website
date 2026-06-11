import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const features = [
  { text: "Curated premium quality toys from trusted brands" },
  { text: "Educational & STEM toys that make learning fun" },
  { text: "BIS certified safe materials for all age groups" },
  { text: "Toys carefully selected for every developmental stage" },
  { text: "50,000+ happy families trust us across India" },
];

export default function AboutSection() {
  return (
    <section className="py-20 bg-cream overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Visual */}
          <div className="sm:m-0 m-4 relative order-2 lg:order-1">
            {/* Main card */}
            <div className="relative rounded-3xl overflow-hidden shadow-card-hover">
              <div className="aspect-4/3 bg-linear-to-br from-teal/20 to-teal/5 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 p-8">
                  {["🚀", "🧩", "🦁", "🔬", "🎨", "🪀", "🧸", "⭐", "🎲"].map(
                    (emoji, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-white rounded-2xl flex items-center justify-center text-3xl shadow-card hover:scale-110 transition-transform cursor-pointer"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        {emoji}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Floating stats cards */}
            <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-card-hover p-3 sm:p-5 border border-gray-100">
              <div className="text-lg sm:text-3xl font-display font-bold text-brand-navy">
                15+
              </div>
              <div className="text-brand-light-gray text-xs sm:text-sm">
                Years of Joy
              </div>
            </div>

            <div className="absolute -top-5 -left-5 bg-coral text-white rounded-2xl shadow-btn p-3 sm:p-5">
              <div className="text-lg sm:text-3xl font-display font-bold">
                1000+
              </div>
              <div className="text-white/80 text-xs sm:text-sm">
                Toy Varieties
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute top-1/2 -right-10 w-20 h-20 bg-gold/20 rounded-full blur-xl" />
            <div className="absolute bottom-1/4 -left-8 w-16 h-16 bg-teal/20 rounded-full blur-xl" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-gold/20 text-coral border border-gold/40 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
              <Sparkles className="text-gold" size={18} /> About Us
            </div>

            <h2 className="section-title mb-5">
              Bringing Joy to
              <br />
              <span className="text-coral">Every Childhood</span>
            </h2>

            <p className="text-brand-gray sm:text-lg leading-relaxed mb-6">
              At{" "}
              <strong className="text-brand-navy">Toys and Kids Planet</strong>,
              we believe every child deserves toys that inspire curiosity,
              creativity, and confidence. Since 2009, we&apos;ve been
              India&apos;s trusted destination for premium, safe, and
              educational toys.
            </p>

            {/* Features list */}
            <ul className="space-y-1 sm:space-y-3 mb-8">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-teal-dark shrink-0 mt-0.5"
                  />
                  <span className="text-brand-gray">{feature.text}</span>
                </li>
              ))}
            </ul>

            <Link href="/about" className="btn-primary">
              Learn More About Us
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
