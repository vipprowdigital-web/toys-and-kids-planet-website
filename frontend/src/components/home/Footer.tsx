"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Heart, ArrowRight } from "lucide-react";
import { ageGroups } from "../../data/index";
import { useAppConfigStore } from "@/store/useAppConfigStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import Image from "next/image";

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Shop", href: "/shop" },
  { label: "Contact Us", href: "/contact" },
  { label: "Blog", href: "/blog" },
];

const helpLinks = [
  { label: "FAQs", href: "/contact" },
  { label: "Order Tracking", href: "/account?tab=orders#orders" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

const SOCIAL_META = [
  {
    key: "facebookLink" as const,
    icon: "/socials/facebook-logo.svg",
    label: "Facebook",
    color: "#1877F2",
    invert: true,
  },
  {
    key: "instagramLink" as const,
    icon: "/socials/instagram-logo.svg",
    label: "Instagram",
    color: "#E4405F",
    invert: true,
  },
  {
    key: "twitterLink" as const,
    icon: "/socials/logo-white.png",
    label: "Twitter",
    color: "#000000",
    invert: false,
  },
  {
    key: "youtubeLink" as const,
    icon: "/socials/youtube-logo.svg",
    label: "YouTube",
    color: "#FF0000",
    invert: true,
  },
  {
    key: "linkedinLink" as const,
    icon: "/socials/linkedin-logo.svg",
    label: "LinkedIn",
    color: "#0A66C2",
    invert: true,
  },
  {
    key: "whatsAppLink" as const,
    icon: "/socials/whatsapp-logo.svg",
    label: "WhatsApp",
    color: "#25D366",
    invert: true,
  },
];

export default function Footer() {
  const { config } = useAppConfigStore();
  const allCategories = useCategoryStore((s) => s.categories);
  const categories = allCategories.slice(0, 8);

  const activeSocialLinks = SOCIAL_META.filter((s) => config?.[s.key]);

  return (
    <footer className="bg-brand-navy text-white">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-teal-gradient rounded-xl flex items-center justify-center">
                <span className="text-2xl">🪀</span>
              </div>
              <div>
                <div className="font-display font-bold text-white text-xl leading-none">
                  Toys & Kids
                </div>
                <div className="text-coral text-xs font-semibold tracking-widest uppercase">
                  Planet
                </div>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Bringing joy to childhood with premium, safe, and educational toys
              curated for every age. Trusted by 50,000+ happy families across
              India.
            </p>
            {/* Social Links */}
            {activeSocialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {activeSocialLinks.map(
                  ({ key, icon, label, color, invert }) => (
                    <a
                      key={label}
                      href={config![key]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="group w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--hover-color) hover:rotate-15"
                      style={{ "--hover-color": color } as React.CSSProperties}
                    >
                      <Image
                        src={icon}
                        alt={label}
                        width={label === "Twitter" ? 18 : 22}
                        height={label === "Twitter" ? 18 : 22}
                        className={`transition-all duration-200 ${invert ? "invert" : ""}`}
                      />
                    </a>
                  ),
                )}
              </div>
            )}

            {/* Contact */}
            <div className="mt-6 space-y-2.5">
              {config?.email && (
                <a
                  href={`mailto:${config?.email}`}
                  className="flex items-center gap-2 text-white/60 hover:text-teal text-sm transition-colors"
                >
                  <Mail size={14} className="text-teal shrink-0" />
                  {config?.email}
                </a>
              )}
              {config?.phoneNumber && (
                <a
                  href={`tel:+91${config?.phoneNumber}`}
                  className="flex items-center gap-2 text-white/60 hover:text-teal text-sm transition-colors"
                >
                  <Phone size={14} className="text-teal shrink-0" />
                  +91 {config?.phoneNumber?.slice(0, 5)}{" "}
                  {config?.phoneNumber?.slice(5)}
                </a>
              )}
              {config?.companyAddress && (
                <span className="flex items-center gap-2 text-white/60 text-sm">
                  <MapPin size={14} className="text-teal shrink-0" />
                  {config?.companyAddress[0].address}
                </span>
              )}
              {config?.companyAddress && (
                <span className="flex items-center gap-2 text-white/60 text-sm">
                  <MapPin size={14} className="text-teal shrink-0" />
                  {config?.companyAddress[1].address}
                </span>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5 text-lg">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-teal text-sm transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <h5 className="font-medium text-white/80 text-sm mt-4 mb-2">
                  Help & Support
                </h5>
              </li>
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-teal text-sm transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5 text-lg">
              Categories
            </h4>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat._id}>
                  <div className="flex items-center gap-2">
                    {/* <span>{cat.icon}</span> */}
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="text-white/60 hover:text-teal text-sm transition-colors flex-1"
                    >
                      {cat.name}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Age Groups + Newsletter mini */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5 text-lg">
              Shop by Age
            </h4>
            <ul className="space-y-2.5 mb-8">
              {ageGroups.map((age) => (
                <li key={age.id}>
                  <div className="flex items-center gap-2">
                    {/* <span>{age.emoji}</span> */}
                    <Link
                      href={`/age-groups/${age.slug}`}
                      className="text-white/60 hover:text-teal text-sm transition-colors flex-1 flex items-center gap-2"
                    >
                      {age.label}
                      {/* <span className="ml-auto text-xs text-white/30">
                        {age.productCount} toys
                      </span> */}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>

            {/* Payment methods */}
            <div>
              <p className="text-white/50 text-xs mb-2 uppercase tracking-wider">
                Secure Payments
              </p>
              <div className="flex flex-wrap gap-2">
                {["UPI", "Card", "Net Banking", "COD"].map((p, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-md font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} Toys and Kids Planet. All rights
            reserved.
          </p>
          <p className="text-white/40 text-sm flex items-center gap-1">
            Made with <Heart size={12} className="text-coral fill-coral" /> for
            little ones across India
          </p>
          <Link
            className="text-white/40 text-sm flex items-center gap-1"
            href="https://vipprow.com"
            target="_blank"
          >
            Developed by{" "}
            <span className="text-coral font-semibold">Vipprow</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
