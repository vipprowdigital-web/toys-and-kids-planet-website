import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Star,
  HeartHandshake,
  Leaf,
  PartyPopper,
  Panda,
  Users,
  Sparkles,
  Heart,
  Lightbulb,
  CalendarDays,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Toys and Kids Planet",
  description:
    "Learn about our mission to bring joy to every childhood through premium, safe, and educational toys.",
};

const stats = [
  {
    value: "15+",
    label: "Years of Joy",
    icon: <PartyPopper size={30} className="text-coral" />,
  },
  {
    value: "1000+",
    label: "Toy Varieties",
    icon: <Panda size={30} className="text-coral" />,
  },
  {
    value: "50,000+",
    label: "Happy Families",
    icon: <Users size={30} className="text-coral" />,
  },
  {
    value: "98%",
    label: "Satisfaction Rate",
    icon: <Star size={30} className="text-coral" />,
  },
];

const values = [
  {
    icon: <Shield size={28} className="text-teal-dark" />,
    bg: "bg-teal/10",
    title: "Safety First",
    desc: "Every toy we sell passes rigorous safety testing and meets BIS, CE, and ASTM certifications. Your child's safety is non-negotiable.",
  },
  {
    icon: <Star size={28} className="text-gold" />,
    bg: "bg-gold/20",
    title: "Premium Quality",
    desc: "We partner only with trusted, ethical manufacturers. Each product is quality-checked by our team before it reaches your home.",
  },
  {
    icon: <Leaf size={28} className="text-teal-dark" />,
    bg: "bg-teal/10",
    title: "Eco-Conscious",
    desc: "We prefer toys made from sustainable, non-toxic materials and are actively reducing our packaging footprint year on year.",
  },
  {
    icon: <HeartHandshake size={28} className="text-coral" />,
    bg: "bg-coral/10",
    title: "Family-Centred",
    desc: "We think like parents first. Every curation decision is made with the wellbeing of children and the peace of mind of parents in mind.",
  },
];

// const team = [
//   {
//     name: "Asha Kapoor",
//     role: "Founder & CEO",
//     emoji: "👩‍💼",
//     bio: "A mother of two and former child psychologist who founded Toys & Kids Planet in 2009 with a vision to make quality play accessible to every Indian family.",
//   },
//   {
//     name: "Rohan Mehta",
//     role: "Head of Curation",
//     emoji: "🧑‍🔬",
//     bio: "A STEM educator and toy enthusiast who personally tests over 200 new products every quarter to ensure they meet our development standards.",
//   },
//   {
//     name: "Deepa Nair",
//     role: "Customer Happiness Lead",
//     emoji: "👩‍💻",
//     bio: "With 8 years in customer care, Deepa ensures that every interaction with Toys & Kids Planet leaves a smile — for kids and parents alike.",
//   },
// ];

const milestones = [
  {
    year: "2009",
    text: "Founded with 50 handpicked toys from a small Mumbai warehouse.",
  },
  { year: "2013", text: "Reached 5,000 happy families across Maharashtra." },
  {
    year: "2016",
    text: "Launched our educational toy curation programme with child psychologists.",
  },
  {
    year: "2019",
    text: "Expanded pan-India with same-day dispatch capability.",
  },
  {
    year: "2022",
    text: "Crossed 1,000 toy varieties and 30,000 families served.",
  },
  {
    year: "2024",
    text: "Launched our online platform — bringing our curated selection to every corner of India.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-cream">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy relative overflow-hidden py-24">
        <div className="absolute inset-0 dot-pattern opacity-[0.04]" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-coral/10 rounded-full blur-3xl" />
        <div className="container-custom relative text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 border border-white/20 rounded-full px-5 py-2 text-sm font-semibold mb-6">
            <Sparkles size={18} className="text-coral" /> Our Story
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Bringing Joy to
            <br />
            <span className="text-coral">Every Childhood</span>
          </h1>
          <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed">
            Since 2009, we&apos;ve been India&apos;s most trusted destination
            for premium, safe, and educational toys — because every child
            deserves the very best.
          </p>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <section className="pt-16 sm:py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="text-center p-6 rounded-2xl bg-cream border border-gray-100"
              >
                <div className="text-4xl mb-1 inline-flex">{s.icon}</div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-brand-navy">
                  {s.value}
                </div>
                <div className="text-brand-light-gray text-sm mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ────────────────────────────────────────────────────── */}
      <section className="pt-10 sm:py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Visual */}
            <div className="relative lg:m-0 m-4">
              <div className="rounded-3xl overflow-hidden bg-teal/10 p-10">
                <div className="grid grid-cols-3 gap-4">
                  {["🚀", "🧩", "🦁", "🔬", "🎨", "🪀", "🧸", "⭐", "🎲"].map(
                    (e, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-white rounded-2xl flex items-center justify-center text-3xl shadow-card hover:scale-110 transition-transform cursor-default"
                      >
                        {e}
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="absolute -bottom-5 -right-5 bg-coral text-white rounded-2xl shadow-btn p-3 sm:p-5">
                <div className="font-display font-bold text-xl sm:text-2xl">
                  15+
                </div>
                <div className="text-white/80 text-xs sm:text-sm">
                  Years of Joy
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-gold/20 text-coral border border-gold/40 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
                <Heart size={18} className="text-coral fill-coral" /> Who We Are
              </div>
              <h2 className="section-title mb-5">
                More than a toy store —<br />
                <span className="text-coral">a childhood companion</span>
              </h2>
              <p className="text-brand-gray sm:text-lg leading-relaxed mb-5">
                At{" "}
                <strong className="text-brand-navy">
                  Toys and Kids Planet
                </strong>
                , we believe play is the foundation of every great childhood.
                It&apos;s how children learn to think, create, communicate, and
                grow.
              </p>
              <p className="text-brand-gray sm:text-lg leading-relaxed mb-8">
                That&apos;s why everything we do — every toy we choose, every
                package we ship, every message we send — is guided by one simple
                question: <em>&quot;Is this truly good for children?&quot;</em>
              </p>
              <ul className="space-y-3">
                {[
                  "Curated by child development experts",
                  "BIS certified, non-toxic materials only",
                  "Age-appropriate for every developmental stage",
                  "Pan-India delivery in 2–5 days",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="text-teal-dark shrink-0 mt-0.5"
                    />
                    <span className="text-brand-gray">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────────────── */}
      <section className="pb-10 pt-20 sm:py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-7 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-teal/15 text-teal-dark border border-teal/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Lightbulb size={18} /> Our Values
            </div>
            <h2 className="section-title">What we stand for</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              These aren&apos;t just words on a wall — they&apos;re the
              principles behind every decision we make.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="p-6 rounded-2xl border border-gray-100 hover:shadow-card-hover transition-shadow"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${v.bg} flex items-center justify-center mb-4`}
                >
                  {v.icon}
                </div>
                <h3 className="font-display font-bold text-brand-navy text-lg mb-2">
                  {v.title}
                </h3>
                <p className="text-brand-gray text-sm leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ────────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-20">
        <div className="container-custom">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-coral/15 text-coral border border-coral/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <CalendarDays size={18} /> Our Journey
            </div>
            <h2 className="section-title">15 years of milestones</h2>
          </div>
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div
                  key={m.year}
                  className={`relative flex items-start gap-6 md:gap-0 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-coral rounded-full border-4 border-cream -translate-x-1/2 mt-1 shrink-0" />

                  {/* Content */}
                  <div
                    className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}
                  >
                    <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                      <span className="text-coral font-display font-bold text-lg">
                        {m.year}
                      </span>
                      <p className="text-brand-gray text-sm mt-1 leading-relaxed">
                        {m.text}
                      </p>
                    </div>
                  </div>
                  {/* Spacer for opposite side */}
                  <div className="hidden md:block md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ────────────────────────────────────────────────────────── */}
      {/* <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-gold/20 text-brand-navy border border-gold/40 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              👥 The Team
            </div>
            <h2 className="section-title">People behind the planet</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <div
                key={member.name}
                className="text-center p-8 rounded-3xl border border-gray-100 hover:shadow-card-hover transition-shadow"
              >
                <div className="w-20 h-20 bg-teal/10 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
                  {member.emoji}
                </div>
                <h3 className="font-display font-bold text-brand-navy text-lg">
                  {member.name}
                </h3>
                <p className="text-coral text-sm font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-brand-gray text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── Why us summary ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-[0.04]" />
        <div className="container-custom relative text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            Ready to explore our collection?
          </h2>
          <p className="text-navy/60 text-lg mb-8 max-w-xl mx-auto">
            Join 50,000+ families who trust Toys & Kids Planet for every
            milestone, birthday, and just-because moment.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/shop" className="btn-primary px-8!">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="btn-teal px-8!">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
