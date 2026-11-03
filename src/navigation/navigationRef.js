// Shared navigation ref so code outside the component tree (IAP purchase listeners,
// deep-link handling) can navigate without a `navigation` prop. Lives in its own module
// (rather than being exported from App.tsx) so modules like src/iap/iapService.js can
// import it without creating an App.tsx <-> iapService.js circular import.
// https://reactnavigation.org/docs/navigating-without-navigation-prop/
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
