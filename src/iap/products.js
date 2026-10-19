// Product IDs must exactly match what's created in App Store Connect and Google
// Play Console. These are placeholders until the real products exist there —
// update the values here once created; nothing else in the app should hardcode
// a raw product ID string.

export const SUBSCRIPTION_SKUS = {
  basicMonthly: 'com.stratasounds.basic.monthly',
  basicYearly: 'com.stratasounds.basic.yearly',
  proMonthly: 'com.stratasounds.pro.monthly',
  proYearly: 'com.stratasounds.pro.yearly',
  creatorMonthly: 'com.stratasounds.creator.monthly',
  creatorYearly: 'com.stratasounds.creator.yearly',
  commercialMonthly: 'com.stratasounds.commercial.monthly',
  commercialYearly: 'com.stratasounds.commercial.yearly',
};

export const CONSUMABLE_SKUS = {
  credits5: 'com.stratasounds.credits.5',
  credits15: 'com.stratasounds.credits.15',
  credits50: 'com.stratasounds.credits.50',
  coverArtStandard: 'com.stratasounds.coverart.standard',
  coverArtPremium: 'com.stratasounds.coverart.premium',
};

export const ALL_SUBSCRIPTION_SKUS = Object.values(SUBSCRIPTION_SKUS);
export const ALL_CONSUMABLE_SKUS = Object.values(CONSUMABLE_SKUS);

// The three credits.* SKUs are live (backend's credit-packs.ts grants them). coverArt* are
// defined above for future use but have no backend handling yet — deliberately excluded
// here so the Billing screen only ever offers packs that actually work end to end.
// tokenAmount must match CREDIT_PACKS in the backend's credit-packs.ts exactly — the
// backend never trusts the client's claim about what it bought, only the store-verified
// product ID, but the amount shown here still needs to match what's actually granted.
// Pricing is configured in App Store Connect / Google Play Console, not here —
// displayPrice is only a fallback shown before the live store price has loaded.
export const CREDIT_PACKS = [
  { sku: CONSUMABLE_SKUS.credits5, tokenAmount: 500, songs: 5, name: 'Starter Pack', displayPrice: '$9.99' },
  { sku: CONSUMABLE_SKUS.credits15, tokenAmount: 1500, songs: 15, name: 'Power Pack', displayPrice: '$26.99' },
  { sku: CONSUMABLE_SKUS.credits50, tokenAmount: 5000, songs: 50, name: 'Studio Pack', displayPrice: '$84.99' },
];

export const CREDIT_PACK_SKUS = CREDIT_PACKS.map((p) => p.sku);

// planName: the Plan.name from the backend ("Basic" | "Pro" | "Creator" | "Commercial")
// billingInterval: "monthly" | "yearly"
export function getSubscriptionSku(planName, billingInterval) {
  const key = `${planName.toLowerCase()}${billingInterval === 'yearly' ? 'Yearly' : 'Monthly'}`;
  return SUBSCRIPTION_SKUS[key] ?? null;
}
