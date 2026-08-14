import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { authAPI, subscriptionAPI } from "@/lib/api/client";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — DearMemory" },
      {
        name: "description",
        content:
          "Simple, studio-friendly pricing. Start free, grow as your studio grows.",
      },
      {
        property: "og:title",
        content: "DearMemory Pricing",
      },
      {
        property: "og:description",
        content: "Simple, studio-friendly pricing. Start free.",
      },
    ],
  }),
  component: Pricing,
});

const TIERS = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    per: "forever",
    description: "Try DearMemory with your next event.",
    cta: "Start free",
    featured: false,
    features: [
      "1 active event",
      "Up to 250 photos",
      "DearMemory subdomain",
      "Guestbook & QR sharing",
      "Basic analytics",
      "Watermarked downloads",
    ],
  },
  {
    id: "creative",
    name: "Creative",
    price: "$29",
    per: "/ month",
    description:
      "For independent photographers and small studios.",
    cta: "Start 14-day trial",
    featured: true,
    features: [
      "Unlimited events",
      "10,000 photos / event",
      "Custom domain",
      "Studio portfolio site",
      "AI face find",
      "Lead capture & quotes",
      "Priority support",
      "Original downloads",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: "$89",
    per: "/ month",
    description:
      "For high-volume studios and production teams.",
    cta: "Start Agency",
    featured: false,
    features: [
      "Everything in Creative",
      "Unlimited photos",
      "Team seats (10)",
      "White-label client portals",
      "Print store integration",
      "Advanced analytics & exports",
      "Dedicated success manager",
      "Original downloads",
    ],
  },
];

function Pricing() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setLoading(true);

        await authAPI.getCurrentUser();

        const subscription =
          await subscriptionAPI.getMe();

        setCurrentPlan(subscription.plan);
      } catch {
        // User may simply be browsing while logged out.
        setCurrentPlan(null);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, []);

  const changePlan = async (planId: string) => {
    setMessage(null);
    setError(null);

    try {
      setChangingPlan(planId);

      await subscriptionAPI.update(planId);

      const subscription =
        await subscriptionAPI.getMe();

      setCurrentPlan(subscription.plan);

      setMessage(
        `Your plan is now ${subscription.name}.`,
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not change your plan.",
      );
    } finally {
      setChangingPlan(null);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <SiteNav />

      <header className="container mx-auto px-6 pt-20 pb-12 text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-emerald mb-3">
          Pricing
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 max-w-3xl mx-auto">
          Simple plans, made for studios
        </h1>

        <p className="text-warm-gray max-w-xl mx-auto">
          No setup fees. No per-photo charges. Cancel anytime.
        </p>

        {message && (
          <div className="mt-6 inline-block rounded-full bg-emerald/10 text-emerald px-5 py-3 text-sm font-medium">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 inline-block rounded-full bg-red-50 text-red-600 px-5 py-3 text-sm font-medium">
            {error}
          </div>
        )}
      </header>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TIERS.map((tier) => {
            const isCurrent =
              currentPlan === tier.id;

            const isChanging =
              changingPlan === tier.id;

            return (
              <div
                key={tier.id}
                className={`rounded-[2.5rem] p-10 ${
                  tier.featured
                    ? "bg-emerald text-white shadow-2xl shadow-emerald/20 md:-translate-y-4"
                    : "bg-white ring-1 ring-border"
                }`}
              >
                <div
                  className={`text-xs font-bold uppercase tracking-widest mb-3 ${
                    tier.featured
                      ? "text-white/70"
                      : "text-warm-gray"
                  }`}
                >
                  {tier.name}
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-5xl font-bold">
                    {tier.price}
                  </span>

                  <span
                    className={`text-sm ${
                      tier.featured
                        ? "text-white/60"
                        : "text-warm-gray"
                    }`}
                  >
                    {tier.per}
                  </span>
                </div>

                <p
                  className={`text-sm mb-8 ${
                    tier.featured
                      ? "text-white/80"
                      : "text-warm-gray"
                  }`}
                >
                  {tier.description}
                </p>

                {isCurrent ? (
                  <div
                    className={`block text-center py-4 rounded-full font-bold mb-8 ${
                      tier.featured
                        ? "bg-white/20 text-white"
                        : "bg-emerald/10 text-emerald"
                    }`}
                  >
                    ✓ Current plan
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={
                      loading || changingPlan !== null
                    }
                    onClick={() =>
                      changePlan(tier.id)
                    }
                    className={`w-full py-4 rounded-full font-bold mb-8 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      tier.featured
                        ? "bg-white text-emerald hover:bg-cream"
                        : "border-2 border-emerald text-emerald hover:bg-emerald/5"
                    }`}
                  >
                    {isChanging
                      ? "Updating..."
                      : tier.cta}
                  </button>
                )}

                <ul className="space-y-3 text-sm">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3"
                    >
                      <span
                        className={`w-5 h-5 rounded-full grid place-items-center text-xs shrink-0 ${
                          tier.featured
                            ? "bg-white/20"
                            : "bg-emerald/10 text-emerald"
                        }`}
                      >
                        ✓
                      </span>

                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-6 pb-32">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Common questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Can I use my own domain?",
                a: "Yes — every paid plan supports custom domains, both for the studio portfolio and each event site.",
              },
              {
                q: "What happens to photos if I cancel?",
                a: "Your galleries stay live for 30 days, with one-click export of every photo and guestbook entry.",
              },
              {
                q: "Do you take a cut of print sales?",
                a: "No. You keep 100% of print revenue. We charge a flat platform fee, that's it.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes — Creative and Agency both include a 14-day free trial. No credit card required.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="bg-white rounded-3xl p-6 ring-1 ring-border group"
              >
                <summary className="font-bold cursor-pointer flex items-center justify-between">
                  {faq.q}

                  <span className="text-emerald text-xl group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>

                <p className="mt-4 text-sm text-warm-gray">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}