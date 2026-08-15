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
  const [currentPlan, setCurrentPlan] =
    useState<string | null>(null);

  const [loggedIn, setLoggedIn] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [changingPlan, setChangingPlan] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const planLevels = {
    starter: 0,
    creative: 1,
    agency: 2,
  } as const;

  type PlanId = keyof typeof planLevels;

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setLoading(true);

        // Check whether the user is authenticated.
        await authAPI.getCurrentUser();

        // Get the user's actual current plan
        // from the backend.
        const subscription =
          await subscriptionAPI.getMe();

        setLoggedIn(true);
        setCurrentPlan(subscription.plan);
      } catch {
        // User is not logged in.
        setLoggedIn(false);
        setCurrentPlan(null);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, []);

  const getPlanName = (planId: string) => {
    const tier = TIERS.find(
      (item) => item.id === planId,
    );

    return tier?.name || planId;
  };

  const showCurrentPlanMessage = () => {
    if (!currentPlan) return;

    const planName =
      getPlanName(currentPlan);

    setError(null);

    setMessage(
      `You're already on the ${planName} plan.`,
    );
  };

  const startCheckout = async (
    planId: string,
  ) => {
    setMessage(null);
    setError(null);

    try {
      setChangingPlan(planId);

      /*
       * Always get the latest subscription from
       * the backend before starting payment.
       *
       * This prevents stale frontend state from
       * starting an invalid checkout.
       */
      const subscription =
        await subscriptionAPI.getMe();

      const actualCurrentPlan =
        subscription.plan;

      setCurrentPlan(actualCurrentPlan);

      /*
       * User is already on this plan.
       */
      if (actualCurrentPlan === planId) {
        setMessage(
          `You're already on the ${getPlanName(
            planId,
          )} plan.`,
        );

        return;
      }

      /*
       * Plan levels:
       *
       * Starter  = 0
       * Creative = 1
       * Agency   = 2
       */
      const planLevels: Record<
        string,
        number
      > = {
        starter: 0,
        creative: 1,
        agency: 2,
      };

      const currentLevel =
        planLevels[actualCurrentPlan] ?? 0;

      const requestedLevel =
        planLevels[planId] ?? 0;

      /*
       * Never start payment for a downgrade.
       */
      if (
        requestedLevel <= currentLevel
      ) {
        setError(
          `You can't downgrade from ${getPlanName(
            actualCurrentPlan,
          )} to ${getPlanName(planId)}.`,
        );

        return;
      }

      /*
       * Ask the backend to create the eSewa
       * checkout.
       */
      const checkout =
        await subscriptionAPI.checkout(
          planId,
        );

      /*
       * eSewa expects a POST form.
       */
      const form =
        document.createElement("form");

      form.method = "POST";
      form.action =
        checkout.payment_url;

      form.style.display = "none";

      Object.entries(
        checkout.fields,
      ).forEach(([key, value]) => {
        const input =
          document.createElement(
            "input",
          );

        input.type = "hidden";
        input.name = key;
        input.value = String(value);

        form.appendChild(input);
      });

      document.body.appendChild(form);

      form.submit();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not start payment.",
      );
    } finally {
      setChangingPlan(null);
    }
  };

  const handlePlanClick = async (
    planId: string,
  ) => {
    setMessage(null);
    setError(null);

    /*
     * User isn't logged in.
     *
     * They need an account before starting
     * a subscription.
     */
    if (!loggedIn) {
      window.location.href =
        "/register";

      return;
    }

    /*
     * Already on this plan.
     */
    if (currentPlan === planId) {
      showCurrentPlanMessage();

      return;
    }

    /*
     * Starter is free, but we don't allow
     * downgrading from a paid plan directly.
     */
    if (planId === "starter") {
      setError(
        `You're currently on the ${getPlanName(
          currentPlan || "starter",
        )} plan. Downgrading to Starter isn't available.`,
      );

      return;
    }

    /*
     * Frontend safety check against downgrades.
     *
     * The backend still performs its own
     * validation, so this is only for UX.
     */

    if (
      currentPlan &&
      planLevels[planId as PlanId] <=
        planLevels[currentPlan as PlanId]
    ) {
      setError(
        `You can't downgrade from ${getPlanName(
          currentPlan,
        )} to ${getPlanName(planId)}.`,
      );

      return;
    }

    await startCheckout(planId);
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
          No setup fees. No per-photo charges.
          Upgrade whenever you need.
        </p>

        {/* Success / information message */}
        {message && (
          <div className="mt-6 inline-block rounded-full bg-emerald/10 text-emerald px-5 py-3 text-sm font-medium">
            {message}
          </div>
        )}

        {/* Error message */}
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

            const isDowngrade =
              loggedIn &&
              currentPlan !== null &&
              planLevels[tier.id as PlanId] <
                planLevels[currentPlan as PlanId];

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
                  /*
                   * Current plan
                   */
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);

                      setMessage(
                        `You're already on the ${tier.name} plan.`,
                      );
                    }}
                    className={`w-full block text-center py-4 rounded-full font-bold mb-8 ${
                      tier.featured
                        ? "bg-white/20 text-white hover:bg-white/30"
                        : "bg-emerald/10 text-emerald hover:bg-emerald/20"
                    }`}
                  >
                    ✓ Current plan
                  </button>
                ) : (
                  /*
                   * Other plans
                   */
                  <button
                    type="button"
                    disabled={
                      loading ||
                      changingPlan !== null ||
                      isDowngrade
                    }
                    onClick={() =>
                      handlePlanClick(
                        tier.id,
                      )
                    }
                    className={`w-full py-4 rounded-full font-bold mb-8 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      tier.featured
                        ? "bg-white text-emerald hover:bg-cream"
                        : "border-2 border-emerald text-emerald hover:bg-emerald/5"
                    }`}
                  >
                    {isChanging
                      ? "Redirecting to eSewa..."
                      : isDowngrade
                        ? "Downgrade unavailable"
                        : tier.cta}
                  </button>
                )}

                <ul className="space-y-3 text-sm">
                  {tier.features.map(
                    (feature) => (
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
                    ),
                  )}
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
                a: "Creative is available as a one-month trial for now. Agency is available as a lifetime plan during this early stage.",
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