import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { navigationRef } from '../../App';
import { tabBarStore, useActiveTabRoute } from './tabBarStore';

const TABS = [
  { route: 'HomeScreen', label: 'Home', icon: 'home' },
  { route: 'HomeSongsScreen', label: 'Discover', icon: 'explore' },
  { route: 'SongCreationScreen', label: 'Create', icon: 'add', isCreate: true },
  { route: 'LibraryHomeScreen', label: 'Library', icon: 'library-music' },
];

const ICON_SIZE = 22;

// Rendered once at the app root (see AppNavigator) so it stays visible across
// every stack screen, not just the 4 screens inside MainTabNavigator.
const GlobalTabBar = () => {
  const activeRoute = useActiveTabRoute();

  const handlePress = (route) => {
    if (navigationRef.isReady()) {
      // These 4 tabs live inside MainApp's own Tab.Navigator, not as top-level
      // AppStack screens — from a sibling screen (e.g. LeaderBoardScreen),
      // navigate(route) alone fails with "screen does not exist" because
      // AppStack's Stack.Navigator has no route by that name. Targeting
      // MainApp explicitly drills into its nested tab correctly from anywhere.
      navigationRef.navigate('MainApp', { screen: route });
    }
  };

  return (
    <View
      style={styles.wrapper}
      onLayout={(e) => tabBarStore.setTabBarHeight(e.nativeEvent.layout.height)}
    >
      {/* Thin accent line on top */}
      <LinearGradient
        colors={['#66cc33', '#047ec9', '#66cc33']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topAccent}
      />

      <View style={styles.bar}>
        {TABS.map((tab) => {
          const active = activeRoute === tab.route;

          return (
            <TouchableOpacity
              key={tab.route}
              style={styles.tab}
              onPress={() => handlePress(tab.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <MaterialIcons
                  name={tab.icon}
                  size={ICON_SIZE}
                  color={active ? '#66cc33' : 'rgba(255,255,255,0.35)'}
                />
              </View>

              <Text
                style={[
                  styles.label,
                  active && styles.labelActive,
                  tab.isCreate && !active && styles.labelCreate,
                ]}
              >
                {tab.label}
              </Text>

              {active && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#0a0e19',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },

  topAccent: {
    height: 1.5,
  },

  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingHorizontal: 8,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
    paddingBottom: 4,
  },

  iconWrap: {
    width: 42,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(102,204,51,0.14)',
  },

  label: {
    fontSize: 10,
    fontFamily: 'Oswald-Regular',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.4,
  },
  labelActive: {
    color: '#66cc33',
    fontFamily: 'Oswald-Bold',
  },
  labelCreate: {
    color: 'rgba(255,255,255,0.55)',
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#66cc33',
    marginTop: 3,
  },
});

export default GlobalTabBar;
