import { MessageCircle, Star } from "lucide-react";
import { getTestimonials } from "@/lib/api";
import ReviewsCarousel from "./ReviewsCarousel";

export default async function ReviewsSection() {
  let testimonials: Awaited<ReturnType<typeof getTestimonials>>["data"] = [];

  try {
    const res = await getTestimonials();
    testimonials = res.data ?? [];
  } catch {
    // silently fall back to empty
  }

  if (testimonials.length === 0) return null;

  const avgRating =
    testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-coral border border-gold/40 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <MessageCircle className="text-coral" size={18} /> Customer Stories
          </div>
          <h2 className="section-title">
            What Parents <span className="text-coral">Are Saying</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Thousands of happy families share their joy every day
          </p>

          {/* Aggregate rating */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className="text-gold fill-gold" />
              ))}
            </div>
            <span className="font-display font-bold text-brand-navy text-2xl">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-brand-light-gray text-sm">
              from {testimonials.length.toLocaleString()}+ reviews
            </span>
          </div>
        </div>

        <ReviewsCarousel testimonials={testimonials} />
      </div>
    </section>
  );
}
