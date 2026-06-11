import AboutSection from "../components/home/AboutSection";
import AgeGroupSection from "../components/home/AgeGroupSection";
import BestSellers from "../components/home/BestSellers";
import BlogSection from "../components/home/BlogSection";
import CategorySection from "../components/home/CategorySection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import HeroSection from "../components/home/HeroSection";
import ReviewsSection from "../components/home/ReviewSection";
import WhyChooseUs from "../components/home/WhyChooseUs";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <CategorySection />
      <FeaturedProducts />
      <AgeGroupSection />
      <BestSellers />
      <WhyChooseUs />
      <BlogSection />
      <ReviewsSection />
    </>
  );
}
