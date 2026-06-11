// ============================================================
// MOCK DATA — replace with real API calls in production
// ============================================================

export const categories = [
  {
    id: "educational",
    name: "Educational Toys",
    slug: "educational",
    icon: "🎓",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
    productCount: 142,
    color: "bg-teal",
  },
  {
    id: "building-blocks",
    name: "Building Blocks",
    slug: "building-blocks",
    icon: "🧱",
    image:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=300&fit=crop",
    productCount: 89,
    color: "bg-coral",
  },
  {
    id: "remote-control",
    name: "Remote Control",
    slug: "remote-control",
    icon: "🚗",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    productCount: 56,
    color: "bg-gold",
  },
  {
    id: "soft-toys",
    name: "Soft Toys",
    slug: "soft-toys",
    icon: "🧸",
    image:
      "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=400&h=300&fit=crop",
    productCount: 118,
    color: "bg-teal",
  },
  {
    id: "action-figures",
    name: "Action Figures",
    slug: "action-figures",
    icon: "🦸",
    image:
      "https://images.unsplash.com/photo-1608889175638-9322300c369e?w=400&h=300&fit=crop",
    productCount: 74,
    color: "bg-coral",
  },
  {
    id: "dolls",
    name: "Dolls",
    slug: "dolls",
    icon: "👧",
    image:
      "https://images.unsplash.com/photo-1548105005-4c17e6d7b3c5?w=400&h=300&fit=crop",
    productCount: 93,
    color: "bg-gold",
  },
  {
    id: "puzzle-games",
    name: "Puzzle Games",
    slug: "puzzle-games",
    icon: "🧩",
    image:
      "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=400&h=300&fit=crop",
    productCount: 67,
    color: "bg-teal",
  },
  {
    id: "outdoor-toys",
    name: "Outdoor Toys",
    slug: "outdoor-toys",
    icon: "⚽",
    image:
      "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=400&h=300&fit=crop",
    productCount: 48,
    color: "bg-coral",
  },
  {
    id: "stem-toys",
    name: "STEM Toys",
    slug: "stem-toys",
    icon: "🔬",
    image:
      "https://images.unsplash.com/photo-1561144257-e32e8506b9cc?w=400&h=300&fit=crop",
    productCount: 61,
    color: "bg-gold",
  },
  {
    id: "board-games",
    name: "Board Games",
    slug: "board-games",
    icon: "🎲",
    image:
      "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&h=300&fit=crop",
    productCount: 35,
    color: "bg-teal",
  },
];

export const ageGroups = [
  {
    id: "0-2",
    label: "0 – 2 Years",
    slug: "0-2-years",
    description: "Sensory and developmental toys for babies and toddlers",
    image:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop",
    emoji: "👶",
    color: "from-teal/30 to-teal/10",
    borderColor: "border-teal",
    // productCount: 124,
  },
  {
    id: "3-5",
    label: "3 – 5 Years",
    slug: "3-5-years",
    description: "Creative and imaginative play for preschoolers",
    image:
      "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&h=400&fit=crop",
    emoji: "🧒",
    color: "from-coral/30 to-coral/10",
    borderColor: "border-coral",
    // productCount: 218,
  },
  {
    id: "6-8",
    label: "6 – 8 Years",
    slug: "6-8-years",
    description: "Educational and skill-building toys for school-age kids",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop",
    emoji: "👦",
    color: "from-gold/30 to-gold/10",
    borderColor: "border-gold",
    // productCount: 196,
  },
  {
    id: "9-12",
    label: "9 – 12 Years",
    slug: "9-12-years",
    description: "Challenging and complex toys for older children",
    image:
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=400&fit=crop",
    emoji: "🧑",
    color: "from-teal/30 to-teal/10",
    borderColor: "border-teal",
    // productCount: 153,
  },
  {
    id: "13+",
    label: "13+ Years",
    slug: "13-plus-years",
    description: "Advanced STEM, gaming, and collector items for teens",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop",
    emoji: "🧑‍💻",
    color: "from-coral/30 to-coral/10",
    borderColor: "border-coral",
    // productCount: 89,
  },
];

export const products = [
  {
    id: "p1",
    name: "Rainbow Stacking Rings",
    slug: "rainbow-stacking-rings",
    category: "educational",
    ageGroup: "0-2",
    price: 499,
    originalPrice: 699,
    discount: 29,
    rating: 4.8,
    reviewCount: 248,
    image:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop",
    badge: "Best Seller",
    badgeColor: "badge-coral",
    isWishlisted: false,
    inStock: true,
    soldCount: 1240,
    description:
      "BPA-free silicone stacking rings that develop fine motor skills and color recognition.",
  },
  {
    id: "p2",
    name: "Magnetic Building Tiles Set",
    slug: "magnetic-building-tiles",
    category: "building-blocks",
    ageGroup: "3-5",
    price: 1299,
    originalPrice: 1799,
    discount: 28,
    rating: 4.9,
    reviewCount: 512,
    image:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop",
    badge: "Top Rated",
    badgeColor: "badge-teal",
    isWishlisted: false,
    inStock: true,
    soldCount: 3890,
    description:
      "64-piece magnetic tiles for endless creative building and STEM learning.",
  },
  {
    id: "p3",
    name: "RC Monster Truck Pro",
    slug: "rc-monster-truck-pro",
    category: "remote-control",
    ageGroup: "6-8",
    price: 2499,
    originalPrice: 3299,
    discount: 24,
    rating: 4.7,
    reviewCount: 183,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    badge: "Hot Deal",
    badgeColor: "badge-coral",
    isWishlisted: false,
    inStock: true,
    soldCount: 876,
    description:
      "High-speed 4WD monster truck with 30m control range and LED lights.",
  },
  {
    id: "p4",
    name: "Giant Teddy Bear",
    slug: "giant-teddy-bear",
    category: "soft-toys",
    ageGroup: "0-2",
    price: 899,
    originalPrice: null,
    discount: 0,
    rating: 4.9,
    reviewCount: 731,
    image:
      "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=400&h=400&fit=crop",
    badge: "New Arrival",
    badgeColor: "badge-teal",
    isWishlisted: true,
    inStock: true,
    soldCount: 2140,
    description:
      "Ultra-soft premium plush teddy bear, hypoallergenic and machine washable.",
  },
  {
    id: "p5",
    name: "Science Explorer Kit",
    slug: "science-explorer-kit",
    category: "stem-toys",
    ageGroup: "9-12",
    price: 1899,
    originalPrice: 2499,
    discount: 24,
    rating: 4.8,
    reviewCount: 294,
    image:
      "https://images.unsplash.com/photo-1561144257-e32e8506b9cc?w=400&h=400&fit=crop",
    badge: "STEM Pick",
    badgeColor: "badge-gold",
    isWishlisted: false,
    inStock: true,
    soldCount: 1560,
    description:
      "50+ science experiments for curious minds. Includes lab equipment and guide.",
  },
  {
    id: "p6",
    name: "Wooden Puzzle World Map",
    slug: "wooden-puzzle-world-map",
    category: "puzzle-games",
    ageGroup: "6-8",
    price: 749,
    originalPrice: 999,
    discount: 25,
    rating: 4.6,
    reviewCount: 167,
    image:
      "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=400&h=400&fit=crop",
    badge: null,
    badgeColor: null,
    isWishlisted: false,
    inStock: true,
    soldCount: 890,
    description:
      "100-piece wooden world map puzzle. Learn geography while having fun.",
  },
  {
    id: "p7",
    name: "Art & Craft Studio Kit",
    slug: "art-craft-studio-kit",
    category: "educational",
    ageGroup: "3-5",
    price: 599,
    originalPrice: 799,
    discount: 25,
    rating: 4.7,
    reviewCount: 423,
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop",
    badge: "Popular",
    badgeColor: "badge-teal",
    isWishlisted: false,
    inStock: true,
    soldCount: 2780,
    description:
      "Complete art kit with non-toxic paints, brushes, and stencils for creative kids.",
  },
  {
    id: "p8",
    name: "Drone Explorer X200",
    slug: "drone-explorer-x200",
    category: "remote-control",
    ageGroup: "13-plus",
    price: 4999,
    originalPrice: 6499,
    discount: 23,
    rating: 4.5,
    reviewCount: 98,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    badge: "Premium",
    badgeColor: "badge-gold",
    isWishlisted: false,
    inStock: true,
    soldCount: 340,
    description:
      "HD camera drone with 20-minute flight time and altitude hold feature.",
  },
];

export const bestSellers = products.filter((p) => p.soldCount > 1000);

export const featuredProducts = products.slice(0, 8);

export const reviews = [
  {
    id: "r1",
    name: "Priya Sharma",
    location: "Mumbai",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    review:
      "Amazing quality toys! My son loves the magnetic building tiles. Delivery was super fast and packaging was excellent. Will definitely order again!",
    product: "Magnetic Building Tiles Set",
    date: "2 days ago",
  },
  {
    id: "r2",
    name: "Rahul Verma",
    location: "Delhi",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    review:
      "Bought the Science Explorer Kit for my daughter. She has been doing experiments every day! Great educational value and safe materials.",
    product: "Science Explorer Kit",
    date: "1 week ago",
  },
  {
    id: "r3",
    name: "Anita Patel",
    location: "Ahmedabad",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    review:
      "The Giant Teddy Bear is so soft and adorable! My baby absolutely loves it. The quality is premium and worth every penny.",
    product: "Giant Teddy Bear",
    date: "3 days ago",
  },
  {
    id: "r4",
    name: "Sanjay Kumar",
    location: "Bangalore",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    rating: 4,
    review:
      "Great selection of toys at competitive prices. The RC Monster Truck is fantastic. Customer support was very helpful when I had questions.",
    product: "RC Monster Truck Pro",
    date: "5 days ago",
  },
  {
    id: "r5",
    name: "Deepa Nair",
    location: "Chennai",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    review:
      "Excellent platform for discovering age-appropriate toys. The age filter made it so easy to find the right toys for my 4-year-old.",
    product: "Art & Craft Studio Kit",
    date: "1 day ago",
  },
];



export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "Age Groups", href: "/age-groups" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export const announcementMessages = [
  "🎉 Free shipping on orders above ₹999",
  "⭐ Use code FIRST10 for 10% off your first order",
  "🚀 Same-day dispatch on orders before 2PM",
  "🎁 Gift wrapping available at checkout",
];
