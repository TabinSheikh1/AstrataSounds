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

const TABS = [
  { route: 'HomeScreen', label: 'Home', icon: 'home' },
  { route: 'HomeSongsScreen', label: 'Discover', icon: 'explore' },
  { route: 'SongCreationScreen', label: 'Create', icon: 'add', isCreate: true },
  { route: 'LibraryHomeScreen', label: 'Library', icon: 'library-music' },
];

const ICON_SIZE = 22;

const CustomBottomTabBar = ({ state, navigation }) => {
  const currentRoute = state.routes[state.index].name;

  return (
    <View style={styles.wrapper}>
      {/* Thin accent line on top */}
      <LinearGradient
        colors={['#66cc33', '#047ec9', '#66cc33']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topAccent}
      />

      <View style={styles.bar}>
        {TABS.map((tab) => {
          const active = currentRoute === tab.route;

          return (
            <TouchableOpacity
              key={tab.route}
              style={styles.tab}
              onPress={() => navigation.navigate(tab.route)}
              activeOpacity={0.7}
            >
              {/* Icon area */}

              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <MaterialIcons
                  name={tab.icon}
                  size={ICON_SIZE}
                  color={active ? '#66cc33' : 'rgba(255,255,255,0.35)'}
                />
              </View>


              {/* Label */}
              <Text
                style={[
                  styles.label,
                  active && styles.labelActive,
                  tab.isCreate && !active && styles.labelCreate,
                ]}
              >
                {tab.label}
              </Text>

              {/* Active indicator dot */}
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
    // React Navigation positions this at the bottom — no absolute needed
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

  // Shared icon container — same dimensions for all tabs
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

export default CustomBottomTabBar;
