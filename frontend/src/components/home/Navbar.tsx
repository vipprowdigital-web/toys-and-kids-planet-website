"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import clsx from "clsx";
import { navLinks, ageGroups } from "../../data/index";
import { useCustomer } from "@/context/CustomerContext";
import { useCart } from "@/context/CartContext";
import { useCategoryStore } from "@/store/useCategoryStore";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const { customer, isAuthenticated, isLoading, logout } = useCustomer();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleMobileOpen = () => setMobileOpen(false);
    handleMobileOpen();
  }, [pathname]);

  // Close account dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setAccountMenuOpen(false);
    router.push("/");
  };

  const wishlistCount = customer?.wishlist?.length ?? 0;

  const categories = useCategoryStore((s) => s.categories);

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
            : "bg-white border-b border-gray-100",
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* ── Logo ─────────────────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 bg-teal-gradient rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <span className="text-xl">🪀</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-display font-bold text-brand-navy text-lg leading-none">
                  Toys & Kids
                </div>
                <div className="text-coral text-xs font-semibold tracking-widest uppercase leading-none mt-0.5">
                  Planet
                </div>
              </div>
            </Link>

            {/* ── Desktop Nav ───────────────────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <div key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    className={clsx(
                      "nav-link text-sm font-medium",
                      pathname === link.href && "text-coral after:w-full",
                    )}
                  >
                    {link.label}
                    {(link.label === "Categories" ||
                      link.label === "Age Groups") && (
                      <ChevronDown
                        size={14}
                        className="inline ml-0.5 -mt-0.5 group-hover:rotate-180 transition-transform duration-200"
                      />
                    )}
                  </Link>

                  {/* Categories dropdown */}
                  {link.label === "Categories" && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white rounded-2xl shadow-card-hover border border-gray-100 p-4 w-110">
                        <p className="text-xs font-semibold text-brand-light-gray uppercase tracking-wider mb-3 px-1">
                          Shop by Category
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {categories.map((cat) => (
                            <Link
                              key={cat._id}
                              href={`/shop?category=${cat._id}`}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-teal/10 hover:text-coral transition-colors text-brand-gray group/item"
                            >
                              <span className="text-xl leading-none">
                                {cat.icon}
                              </span>
                              <span className="text-sm font-medium leading-tight">
                                {cat.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <Link
                            href="/categories"
                            className="flex items-center justify-center gap-1.5 text-sm font-semibold text-coral hover:text-coral-dark transition-colors"
                          >
                            View All Categories
                            <ChevronDown size={13} className="-rotate-90" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Age Groups dropdown */}
                  {link.label === "Age Groups" && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white rounded-2xl shadow-card-hover border border-gray-100 p-4 w-72">
                        <p className="text-xs font-semibold text-brand-light-gray uppercase tracking-wider mb-3 px-1">
                          Shop by Age
                        </p>
                        <div className="flex flex-col gap-1">
                          {ageGroups.map((age) => (
                            <Link
                              key={age.id}
                              href={`/shop?age=${age.id}`}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-teal/10 hover:text-coral transition-colors text-brand-gray"
                            >
                              {/* <span className="text-xl leading-none">
                                {age.emoji}
                              </span> */}
                              <div>
                                <p className="text-sm font-semibold leading-tight">
                                  {age.label}
                                </p>
                                <p className="text-xs text-brand-light-gray leading-tight mt-0.5">
                                  {age.description}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <Link
                            href="/age-groups"
                            className="flex items-center justify-center gap-1.5 text-sm font-semibold text-coral hover:text-coral-dark transition-colors"
                          >
                            Browse All Ages
                            <ChevronDown size={13} className="-rotate-90" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* ── Right Actions ─────────────────────────────────────────── */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-xl hover:bg-teal/10 transition-colors text-brand-gray hover:text-coral"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Wishlist — goes to /account?tab=wishlist (requires login) */}
              <Link
                href={isAuthenticated ? "/account?tab=wishlist" : "/auth"}
                className="p-2 rounded-xl hover:bg-teal/10 transition-colors text-brand-gray hover:text-coral relative hidden sm:block"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {isAuthenticated && wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-coral text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {Math.min(wishlistCount, 9)}
                  </span>
                )}
              </Link>

              {/* Cart — always accessible, shows live count */}
              <Link
                href="/cart"
                className="p-2 rounded-xl hover:bg-teal/10 transition-colors text-brand-gray hover:text-coral relative"
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-coral text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {Math.min(totalItems, 9)}
                  </span>
                )}
              </Link>

              {/* User — desktop */}
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <div
                      className="relative hidden md:block"
                      ref={accountMenuRef}
                    >
                      <button
                        onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                        className="flex items-center gap-2 bg-teal/10 hover:bg-teal/20 text-brand-navy px-3 py-2 rounded-full transition-all"
                      >
                        <div className="w-7 h-7 rounded-full bg-coral flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                          {customer?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={customer.avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (customer?.name ||
                              customer?.email ||
                              "?")[0].toUpperCase()
                          )}
                        </div>
                        <span className="text-sm font-medium max-w-20 truncate">
                          {customer?.name?.split(" ")[0] || "Account"}
                        </span>
                        <ChevronDown
                          size={14}
                          className={clsx(
                            "transition-transform",
                            accountMenuOpen && "rotate-180",
                          )}
                        />
                      </button>

                      {accountMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-gray-100 py-2 z-50">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-xs text-brand-light-gray">
                              Signed in as
                            </p>
                            <p className="text-sm font-semibold text-brand-navy truncate">
                              {customer?.email}
                            </p>
                          </div>
                          <Link
                            href="/account"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-gray hover:text-brand-navy hover:bg-gray-50 transition-colors"
                          >
                            <Settings size={15} /> My Account
                          </Link>
                          <Link
                            href="/account?tab=orders"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-gray hover:text-brand-navy hover:bg-gray-50 transition-colors"
                          >
                            <ShoppingCart size={15} /> My Orders
                          </Link>
                          <Link
                            href="/account?tab=wishlist"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-gray hover:text-brand-navy hover:bg-gray-50 transition-colors"
                          >
                            <Heart size={15} /> Wishlist
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                          >
                            <LogOut size={15} /> Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href="/auth"
                      className="hidden md:flex items-center gap-1.5 btn-teal px-4! py-2! text-sm!"
                    >
                      <User size={16} />
                      Login
                    </Link>
                  )}
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-teal/10 transition-colors text-brand-gray"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* ── Search Bar ──────────────────────────────────────────────── */}
          <div
            className={clsx(
              "overflow-hidden transition-all duration-300",
              searchOpen ? "max-h-28 pb-3 px-1 pt-1 my-5" : "max-h-0",
            )}
          >
            <form onSubmit={handleSearch} className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-light-gray"
              />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search for toys, brands, categories…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-11 pr-12 h-11"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-brand-light-gray hover:text-coral"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-coral text-white p-1.5 rounded-lg hover:bg-coral-dark transition-colors"
                aria-label="Search"
              >
                <Search size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* ── Mobile Navigation ──────────────────────────────────────────── */}
        <div
          className={clsx(
            "lg:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300",
            mobileOpen ? "max-h-screen" : "max-h-0",
          )}
        >
          <nav className="container-custom py-4 flex flex-col gap-1">
            {navLinks.map((link) => {
              const hasSubmenu =
                link.label === "Categories" || link.label === "Age Groups";
              const isExpanded = mobileExpanded === link.label;

              if (!hasSubmenu) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={clsx(
                      "flex items-center px-4 py-3 rounded-xl text-brand-gray font-medium transition-colors hover:bg-teal/10 hover:text-coral",
                      pathname === link.href && "bg-teal/10 text-coral",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              }

              return (
                <div key={link.href}>
                  <button
                    onClick={() =>
                      setMobileExpanded(isExpanded ? null : link.label)
                    }
                    className={clsx(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-brand-gray font-medium transition-colors hover:bg-teal/10 hover:text-coral",
                      (pathname === link.href || isExpanded) &&
                        "bg-teal/10 text-coral",
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      size={16}
                      className={clsx(
                        "transition-transform duration-200",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </button>

                  <div
                    className={clsx(
                      "overflow-hidden transition-all duration-200",
                      isExpanded ? "max-h-150" : "max-h-0",
                    )}
                  >
                    <div className="ml-4 mt-1 mb-2 flex flex-col gap-0.5 border-l-2 border-teal/30 pl-3">
                      {link.label === "Categories" &&
                        categories.map((cat) => (
                          <Link
                            key={cat._id}
                            href={`/shop?category=${cat._id}`}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-brand-gray hover:text-coral hover:bg-teal/10 transition-colors"
                          >
                            <span className="text-base">{cat.icon}</span>
                            {cat.name}
                          </Link>
                        ))}
                      {link.label === "Age Groups" &&
                        ageGroups.map((age) => (
                          <Link
                            key={age.id}
                            href={`/shop?age=${age.id}`}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-brand-gray hover:text-coral hover:bg-teal/10 transition-colors"
                          >
                            {/* <span className="text-base">{age.emoji}</span> */}
                            {age.label}
                          </Link>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/account"
                    className="flex-1 btn-teal justify-center! text-sm!"
                  >
                    <User size={16} />
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex-1 btn-outline-coral justify-center! text-sm!"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="flex-1 btn-outline-coral justify-center! text-sm!"
                  >
                    <Heart size={16} />
                    Wishlist
                  </Link>
                  <Link
                    href="/auth"
                    className="flex-1 btn-teal justify-center! text-sm!"
                  >
                    <User size={16} />
                    Login
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
