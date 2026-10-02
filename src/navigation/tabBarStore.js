import { useSyncExternalStore } from 'react';

// Plain external store (not React context) so the persistent global tab bar
// and navigationRef-driven navigation state can share data without needing
// every screen in between to be part of the same provider tree.
let activeRoute = null;
let tabBarHeight = 0;
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

export const tabBarStore = {
    setActiveRoute(route) {
        if (route === activeRoute) return;
        activeRoute = route;
        emit();
    },
    setTabBarHeight(height) {
        if (height === tabBarHeight) return;
        tabBarHeight = height;
        emit();
    },
    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};

export const useActiveTabRoute = () =>
    useSyncExternalStore(tabBarStore.subscribe, () => activeRoute);

export const useTabBarHeight = () =>
    useSyncExternalStore(tabBarStore.subscribe, () => tabBarHeight);
