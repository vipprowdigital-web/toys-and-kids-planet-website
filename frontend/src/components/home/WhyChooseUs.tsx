import clsx from "clsx";
import {
  CircleCheck,
  CornerDownLeft,
  Gem,
  HeartHandshake,
  Lock,
  MessageCircle,
  Rocket,
  Shield,
  Sprout,
  Star,
  Trophy,
} from "lucide-react";

export const whyChooseUs = [
  {
    icon: <Shield className="text-teal" />,
    title: "Safe & Certified",
    description:
      "All toys meet BIS and international safety standards. Child-safe materials only.",
    color: "text-teal-dark",
    bg: "bg-teal/10",
  },
  {
    icon: <Star className="text-coral" />,
    title: "Premium Quality",
    description:
      "Curated selection from trusted brands. Each product quality-tested by our team.",
    color: "text-gold-dark",
    bg: "bg-gold/20",
  },
  {
    icon: <Rocket className="text-coral" />,
    title: "Fast Delivery",
    description:
      "Same-day dispatch on orders before 2PM. Pan-India delivery in 2-5 days.",
    color: "text-coral-dark",
    bg: "bg-coral/10",
  },
  {
    icon: <Lock className="text-teal" />,
    title: "Secure Payments",
    description:
      "UPI, cards, net banking, and COD available. 100% secure transactions.",
    color: "text-teal-dark",
    bg: "bg-teal/10",
  },
  {
    icon: <CornerDownLeft className="text-coral" />,
    title: "Easy Returns",
    description:
      "7-day hassle-free returns. No questions asked policy for damaged products.",
    color: "text-gold-dark",
    bg: "bg-gold/20",
  },
  {
    icon: <MessageCircle className="text-coral" />,
    title: "24/7 Support",
    description:
      "Dedicated customer care team ready to help via chat, email, or phone.",
    color: "text-coral-dark",
    bg: "bg-coral/10",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-10 sm:py-20 bg-cream">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-teal/15 text-teal-dark border border-teal/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <Gem size={18} /> Why Us
          </div>
          <h2 className="section-title">
            Why Choose <span className="text-coral">Toys & Kids Planet</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            We go beyond just selling toys. We&apos;re committed to your
            child&apos;s joy, safety, and growth.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChooseUs.map((item, i) => (
            <div
              key={i}
              className="group bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div
                className={clsx(
                  "sm:w-14 sm:h-14 w-11 h-11 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300",
                  item.bg,
                )}
              >
                {item.icon}
              </div>

              {/* Content */}
              <h3
                className={clsx(
                  "font-display font-bold text-xl sm:mb-2",
                  item.color,
                )}
              >
                {item.title}
              </h3>
              <p className="text-brand-gray text-base leading-tight sm:leading-relaxed">
                {item.description}
              </p>

              {/* Decorative corner dot */}
              <div
                className={clsx(
                  "absolute top-4 right-4 w-2 h-2 rounded-full opacity-30",
                  item.bg,
                )}
              />
            </div>
          ))}
        </div>

        {/* Bottom trust strip */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 py-8 border-t border-gray-200">
          {[
            {
              logo: <Trophy className="text-navy" size={22} />,
              name: "Award-Winning Quality",
            },
            { logo: "🇮🇳", name: "Made in India" },
            {
              logo: <Sprout className="text-navy" size={22} />,
              name: "Eco-Friendly Packaging",
            },
            {
              logo: <CircleCheck className="text-navy" size={22} />,
              name: "BIS Certified",
            },
            {
              logo: <HeartHandshake className="text-navy" size={22} />,
              name: "100% Secure",
            },
          ].map((badge) => (
            <div
              key={badge.name}
              className="flex items-center gap-2 text-brand-gray"
            >
              <span className="text-2xl">{badge.logo}</span>
              <span className="font-medium text-sm">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
