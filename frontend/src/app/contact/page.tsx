"use client";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  MessageSquare,
  ShoppingBag,
  HelpCircle,
  MessageCircle,
  MessageSquareMore,
  CircleQuestionMark,
} from "lucide-react";
import { useAppConfigStore } from "@/store/useAppConfigStore";

const inquiryTypes = [
  {
    value: "General",
    label: "General Enquiry",
    icon: <HelpCircle size={16} />,
  },
  {
    value: "order",
    label: "Order / Delivery",
    icon: <ShoppingBag size={16} />,
  },
  { value: "feedback", label: "Feedback", icon: <MessageSquare size={16} /> },
  { value: "other", label: "Other", icon: <Mail size={16} /> },
];

const faqs = [
  {
    q: "How long does delivery take?",
    a: "We dispatch same day for orders placed before 2 PM. Pan-India delivery takes 2–5 working days.",
  },
  {
    q: "Are your toys safe for babies?",
    a: "Absolutely. All our toys meet BIS, CE, and ASTM safety standards. Age recommendations are displayed on every product page.",
  },
  {
    q: "What is your return policy?",
    a: "We offer hassle-free 7-day returns for damaged or incorrect items. Contact us within 7 days of delivery.",
  },
  {
    q: "Do you offer gift wrapping?",
    a: "Yes! Select the gift wrap option at checkout and add a personalised message for ₹49.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "General",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const { config } = useAppConfigStore();

  const handle = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.message.trim()) {
      setError("Name and message are required.");
      return;
    }
    if (!form.email && !form.phone) {
      setError("Please provide at least an email or phone number.");
      return;
    }

    setLoading(true);
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${apiBase}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          message: form.message.trim(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { message?: string }).message || "Failed to send.",
        );
      }
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", type: "General", message: "" });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Phone size={22} className="text-coral" />,
      bg: "bg-coral/10",
      label: "Call Us",
      value: config?.phoneNumber
        ? "+91" +
          " " +
          config?.phoneNumber.slice(0, 5) +
          " " +
          config?.phoneNumber.slice(5)
        : null,
      sub: "Mon–Sat, 9am–7pm",
      href: `tel:+91${config?.phoneNumber}`,
    },
    {
      icon: <Mail size={22} className="text-teal-dark" />,
      bg: "bg-teal/10",
      label: "Email Us",
      value: config?.email ? config?.email : null,
      sub: "Reply within 24 hours",
      href: `mailto:${config?.email}}`,
    },
    {
      icon: <MapPin size={22} className="text-gold" />,
      bg: "bg-gold/20",
      label: "Visit Us",
      value: config?.companyAddress ? config?.companyAddress[0].address : null,
      sub: "",
      href: "https://maps.google.com",
    },
    // {
    //   icon: <Clock size={22} className="text-coral" />,
    //   bg: "bg-coral/10",
    //   label: "Support Hours",
    //   value: "Mon – Sat",
    //   sub: "9:00 AM – 7:00 PM IST",
    //   href: null,
    // },
  ];

  return (
    <div className="bg-cream">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy relative overflow-hidden py-20">
        <div className="absolute inset-0 dot-pattern opacity-[0.04]" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-teal/10 rounded-full blur-3xl" />
        <div className="container-custom relative text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 border border-white/20 rounded-full px-5 py-2 text-sm font-semibold mb-5">
            <MessageCircle size={18} /> Get in Touch
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            We&apos;d love to <span className="text-coral">hear from you</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Questions about an order, a product, or just want to say hi — our
            team is here to help.
          </p>
        </div>
      </section>

      {/* ── Contact Info Cards ─────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactInfo.map((info) => (
              <div
                key={info.label}
                className="p-6 rounded-2xl border border-gray-100 hover:shadow-card-hover transition-shadow"
              >
                <div
                  className={`w-12 h-12 ${info.bg} rounded-2xl flex items-center justify-center mb-4`}
                >
                  {info.icon}
                </div>
                <p className="text-xs font-semibold text-brand-light-gray uppercase tracking-wider mb-1">
                  {info.label}
                </p>
                {info.href ? (
                  <a
                    href={info.href}
                    target={info.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-navy hover:text-coral transition-colors text-sm"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="font-semibold text-brand-navy text-sm">
                    {info.value}
                  </p>
                )}
                <p className="text-brand-light-gray text-xs mt-0.5">
                  {info.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form + FAQ ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* ── Contact Form ─────────────────────────────────────────── */}
            <div>
              <div className="inline-flex items-center gap-2 bg-teal/15 text-teal-dark border border-teal/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
                <MessageSquareMore size={18} /> Send a Message
              </div>
              <h2 className="section-title mb-2">Drop us a line</h2>
              <p className="text-brand-gray mb-8">
                Fill out the form and our team will get back to you within 24
                hours.
              </p>

              {success ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <CheckCircle2
                    size={48}
                    className="text-green-500 mx-auto mb-4"
                  />
                  <h3 className="font-display font-bold text-xl text-brand-navy mb-2">
                    Message received! 🎉
                  </h3>
                  <p className="text-brand-gray">
                    Thanks for reaching out. We&apos;ll reply to you within 24
                    hours.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="btn-teal mt-6"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 bg-white rounded-3xl px-4 py-6 sm:p-8 shadow-card"
                >
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                      {error}
                    </div>
                  )}

                  {/* Inquiry type */}
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      What&apos;s this about?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {inquiryTypes.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => handle("type", t.value)}
                          className={`flex items-center justify-start gap-2 sm:px-4 px-2.5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                            form.type === t.value
                              ? "border-coral bg-coral/10 text-coral"
                              : "border-gray-200 text-brand-gray hover:border-teal"
                          }`}
                        >
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1.5">
                      Your Name <span className="text-coral">*</span>
                    </label>
                    <input
                      className="input-field"
                      value={form.name}
                      onChange={(e) => handle("name", e.target.value)}
                      placeholder="Priya Sharma"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-brand-navy mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        value={form.email}
                        onChange={(e) => handle("email", e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-brand-navy mb-1.5">
                        Phone
                      </label>
                      <input
                        className="input-field"
                        value={form.phone}
                        onChange={(e) => handle("phone", e.target.value)}
                        placeholder="10-digit mobile"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1.5">
                      Message <span className="text-coral">*</span>
                    </label>
                    <textarea
                      rows={5}
                      className="input-field resize-none"
                      value={form.message}
                      onChange={(e) => handle("message", e.target.value)}
                      placeholder="Tell us how we can help…"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                    {loading ? "Sending…" : "Send Message"}
                  </button>
                </form>
              )}
            </div>

            {/* ── FAQ ─────────────────────────────────────────────────── */}
            <div>
              <div className="inline-flex items-center gap-2 bg-coral/15 text-coral border border-coral/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
                <CircleQuestionMark size={18} /> FAQs
              </div>
              <h2 className="section-title mb-2">Quick answers</h2>
              <p className="text-brand-gray mb-8">
                Find answers to the most common questions below.
              </p>

              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                      className="w-full text-left flex items-center justify-between px-6 py-4 font-medium text-brand-navy hover:text-coral transition-all duration-1000"
                    >
                      {faq.q}
                      <span className="text-xl font-light shrink-0 ml-4">
                        {openFAQ === i ? "−" : "+"}
                      </span>
                    </button>
                    {openFAQ === i && (
                      <div className="px-6 pb-5 text-brand-gray text-sm leading-relaxed border-t border-gray-50 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <div className="mt-8 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-brand-navy">
                    Chat on WhatsApp
                  </p>
                  <p className="text-brand-gray text-sm mt-0.5">
                    Get instant support on WhatsApp — usually reply within
                    minutes.
                  </p>
                  <a
                    href={`https://wa.me/91${config?.phoneNumber}?text=Hi%2C%20I%20have%20a%20question%20about%20Toys%20%26%20Kids%20Planet.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 bg-green-500 text-white text-sm font-semibold px-5 py-2 sm:py-2.5 rounded-full hover:bg-green-600 transition-colors"
                  >
                    Start Chat
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
