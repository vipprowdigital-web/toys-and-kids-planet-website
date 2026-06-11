"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Rocket,
  Microscope,
  Baby,
} from "lucide-react";
import clsx from "clsx";

const slides = [
  {
    headline: "Where Childhood\nMagic Begins",
    subheadline:
      "Discover premium, safe, and educational toys for every little explorer — from newborns to teenagers.",
    accent: "Premium Toys",
    emoji: <Rocket />,
    bg: "from-teal/20 via-cream to-cream",
    floatEmojis: ["🧩", "🚗", "🦁", "⭐", "🎨"],
    stat: { value: "50,000+", label: "Happy Families" },
  },
  {
    headline: "Learn, Play,\nGrow Together",
    subheadline:
      "STEM kits, educational toys, and creative tools that make learning an adventure every single day.",
    accent: "STEM & Learning",
    emoji: <Microscope />,
    bg: "from-gold/20 via-cream to-cream",
    floatEmojis: ["📚", "🔬", "🧪", "💡", "🎯"],
    stat: { value: "500+", label: "STEM Products" },
  },
  {
    headline: "Toys for Every\nAge & Stage",
    subheadline:
      "Carefully curated by age — from sensory play for babies to advanced robotics kits for teens.",
    accent: "All Age Groups",
    emoji: <Baby />,
    bg: "from-coral/10 via-cream to-cream",
    floatEmojis: ["👶", "🧒", "👦", "🧑", "🎮"],
    stat: { value: "5", label: "Age Categories" },
  },
];

const trustBadges = [
  { icon: ShieldCheck, label: "BIS Certified Safe" },
  { icon: Star, label: "4.9★ Rating" },
  { icon: Truck, label: "Free Delivery ₹999+" },
  { icon: RotateCcw, label: "7-Day Returns" },
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % slides.length);
        setAnimating(false);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[activeSlide];

  return (
    <section
      className={clsx(
        "relative min-h-[88vh] flex flex-col overflow-hidden bg-linear-to-br",
        slide.bg,
        "transition-all duration-700",
      )}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-coral/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-gold/5 rounded-full blur-3xl" />

        {/* Floating Emojis */}
        {slide.floatEmojis.map((emoji, i) => (
          <div
            key={`${activeSlide}-${i}`}
            className="absolute text-3xl md:text-4xl opacity-20 animate-float"
            style={{
              left: `${[8, 85, 15, 90, 50][i]}%`,
              top: `${[15, 20, 75, 70, 40][i]}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          >
            {emoji}
          </div>
        ))}

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 dot-pattern opacity-[0.03]" />
      </div>

      <div className="container-custom flex-1 flex items-center py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          {/* Content */}
          <div
            className={clsx(
              "transition-all duration-400",
              animating
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0",
            )}
          >
            {/* Accent badge */}
            <div className="inline-flex items-center gap-2 bg-teal/20 text-teal-dark border border-teal/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              <span className="text-base">{slide.emoji}</span>
              {slide.accent}
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-brand-navy leading-[1.1] mb-6 whitespace-pre-line">
              {slide.headline}
            </h1>

            {/* Description */}
            <p className="text-brand-gray text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
              {slide.subheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-10">
              <Link href="/shop" className="btn-primary text-base shadow-btn">
                Shop Now
                <ArrowRight size={18} />
              </Link>
              <Link href="/categories" className="btn-secondary text-base">
                Explore Categories
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 sm:gap-6">
              <div>
                <div className="font-display font-bold text-2xl sm:text-3xl text-brand-navy">
                  {slide.stat.value}
                </div>
                <div className="text-brand-light-gray text-sm">
                  {slide.stat.label}
                </div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <div className="font-display font-bold text-2xl sm:text-3xl text-brand-navy">
                  1000+
                </div>
                <div className="text-brand-light-gray text-sm">
                  Premium Products
                </div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <div className="font-display font-bold text-2xl sm:text-3xl text-brand-navy">
                  4.9★
                </div>
                <div className="text-brand-light-gray text-sm">Avg Rating</div>
              </div>
            </div>
          </div>

          {/* Visual Area */}
          <div
            className={clsx(
              "relative transition-all duration-400 hidden lg:block",
              animating ? "opacity-0 scale-95" : "opacity-100 scale-100",
            )}
          >
            {/* Central big card */}
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Main circle */}
              <div className="absolute inset-8 rounded-full bg-linear-to-br from-teal/30 to-teal/10 border-2 border-teal/30" />

              {/* Emoji display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[140px] animate-float drop-shadow-xl">
                  {slide.emoji}
                </span>
              </div>

              {/* Orbiting badges */}
              <div className="float-badge absolute top-4 right-8 bg-white rounded-2xl shadow-card px-4 py-3 flex items-center gap-2 border border-gray-100">
                <Star size={16} className="text-gold fill-gold" />
                <span className="font-bold text-brand-navy text-sm">4.9/5</span>
                <span className="text-brand-light-gray text-xs">Rating</span>
              </div>

              <div
                className="float-badge absolute bottom-8 left-4 bg-white rounded-2xl shadow-card px-4 py-3 flex items-center gap-2 border border-gray-100"
                style={{ animationDelay: "1s" }}
              >
                <ShieldCheck size={16} className="text-teal-dark" />
                <span className="font-semibold text-brand-navy text-sm">
                  BIS Certified
                </span>
              </div>

              <div
                className="float-badge absolute top-1/2 right-0 -translate-y-1/2 bg-coral text-white rounded-2xl shadow-btn px-4 py-3 text-center"
                style={{ animationDelay: "1.5s" }}
              >
                <div className="font-bold text-lg leading-none">30%</div>
                <div className="text-xs opacity-90 mt-0.5">OFF Sale</div>
              </div>

              {/* Decorative rings */}
              <div className="absolute inset-0 rounded-full border border-dashed border-teal/20 animate-spin-slow" />
              <div
                className="absolute inset-4 rounded-full border border-dashed border-coral/10 animate-spin-slow"
                style={{ animationDirection: "reverse" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="flex items-center justify-center gap-2 pb-8 relative z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={clsx(
              "rounded-full transition-all duration-300",
              i === activeSlide
                ? "w-8 h-2.5 bg-coral"
                : "w-2.5 h-2.5 bg-gray-300 hover:bg-teal",
            )}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Trust badges strip */}
      <div className="relative z-10 bg-white/70 backdrop-blur-sm border-t border-gray-100">
        <div className="container-custom py-3">
          <div className="flex items-center justify-center flex-wrap gap-6 md:gap-10">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-brand-gray"
              >
                <Icon size={16} className="text-coral" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
