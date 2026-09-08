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

// planName: the Plan.name from the backend ("Basic" | "Pro" | "Creator" | "Commercial")
// billingInterval: "monthly" | "yearly"
export function getSubscriptionSku(planName, billingInterval) {
  const key = `${planName.toLowerCase()}${billingInterval === 'yearly' ? 'Yearly' : 'Monthly'}`;
  return SUBSCRIPTION_SKUS[key] ?? null;
}
