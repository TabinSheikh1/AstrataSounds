import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
    ImageBackground,
    Image,
    Platform,
    Animated,
    Easing,
    Modal,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
    Share2, MessageSquare, Mail, HelpCircle,
    FileText, ShieldCheck, RefreshCw, Trophy,
    Mic, Facebook, Twitter, Youtube, Instagram,
    CreditCard, Zap,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const BASE_URL = 'http://localhost:3000';
const DRAWER_WIDTH = Dimensions.get('window').width * 0.85;

const buildAvatarUri = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith('http')) return profilePicture;
    return `${BASE_URL}${profilePicture.startsWith('/') ? '' : '/uploads/users/avatars/'}${profilePicture}`;
};

const MenuItem = ({ icon: Icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.menuItemLeft}>
            <View style={styles.menuIconWrap}>
                <Icon color="#fff" size={18} />
            </View>
            <Text style={styles.menuItemText}>{label}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color="rgba(255,255,255,0.45)" />
    </TouchableOpacity>
);

const Separator = () => <View style={styles.separator} />;

const MenuScreen = ({ visible, onClose }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const user = useSelector((state) => state.auth.user);

    // Drawer slide + backdrop animations
    const slideX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    // Content entrance animations
    const headerAnim = useRef(new Animated.Value(0)).current;
    const profileAnim = useRef(new Animated.Value(0)).current;
    const card1Anim = useRef(new Animated.Value(0)).current;
    const card2Anim = useRef(new Animated.Value(0)).current;
    const card3Anim = useRef(new Animated.Value(0)).current;
    const footerAnim = useRef(new Animated.Value(0)).current;
    const slideAnims = useRef([
        new Animated.Value(20),
        new Animated.Value(20),
        new Animated.Value(20),
        new Animated.Value(20),
        new Animated.Value(20),
        new Animated.Value(20),
    ]).current;

    useEffect(() => {
        const contentAnims = [headerAnim, profileAnim, card1Anim, card2Anim, card3Anim, footerAnim];

        if (visible) {
            // Reset content animations so they replay on each open
            contentAnims.forEach(a => a.setValue(0));
            slideAnims.forEach(s => s.setValue(20));

            Animated.parallel([
                Animated.spring(slideX, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
                Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            ]).start();

            Animated.stagger(80,
                contentAnims.map((anim, i) =>
                    Animated.parallel([
                        Animated.timing(anim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                        Animated.timing(slideAnims[i], { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                    ])
                )
            ).start();
        } else {
            Animated.parallel([
                Animated.timing(slideX, { toValue: -DRAWER_WIDTH, duration: 280, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
                Animated.timing(backdropOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    const navigateTo = (screen) => {
        onClose();
        navigation.navigate(screen);
    };

    const handleLogout = () => {
        onClose();
        dispatch(logout());
    };

    const animStyle = (opacityAnim, slideAnim) => ({
        opacity: opacityAnim,
        transform: [{ translateY: slideAnim }],
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            {/* Backdrop — tapping it closes the drawer */}
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
            </TouchableWithoutFeedback>

            {/* Drawer panel slides in from the left */}
            <Animated.View style={[styles.drawerPanel, { transform: [{ translateX: slideX }] }]}>
                <ImageBackground
                    source={require('../assets/images/image-1.jpg')}
                    style={styles.background}
                    resizeMode="cover"
                >
                    {/* ── Header ── */}
                    <Animated.View style={[styles.headerContainer, animStyle(headerAnim, slideAnims[0])]}>
                        <View style={styles.headerRow}>
                            <TouchableOpacity style={styles.backButton} onPress={onClose}>
                                <MaterialIcons name="close" size={26} color="#fff" />
                            </TouchableOpacity>

                            <View style={styles.logoWrap} pointerEvents="none">
                                <Image
                                    source={require('../assets/images/logo.jpg')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>

                            <View style={styles.backButton} />
                        </View>
                        <View style={styles.headerDivider} />
                    </Animated.View>

                    {/* ── Scrollable content ── */}
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Profile */}
                        <Animated.View style={[styles.profileSection, animStyle(profileAnim, slideAnims[1])]}>
                            {buildAvatarUri(user?.profilePicture) ? (
                                <Image
                                    source={{ uri: buildAvatarUri(user?.profilePicture) }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <LinearGradient
                                    colors={['#66cc33', '#047ec9']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={styles.avatarGradient}
                                >
                                    <MaterialIcons name="person" size={36} color="#fff" />
                                </LinearGradient>
                            )}
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>
                                    {user?.firstName || user?.lastName
                                        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                                        : user?.email ?? 'My Profile'}
                                </Text>
                                <Text style={styles.profileSub} numberOfLines={1}>
                                    {user?.bio || 'No information available yet'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.editProfileBtn}
                                onPress={() => navigateTo('ProfileScreen')}
                            >
                                <MaterialIcons name="edit" size={16} color="rgba(255,255,255,0.7)" />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Subscription card */}
                        <Animated.View style={animStyle(card1Anim, slideAnims[2])}>
                            <View style={styles.card}>
                                <View style={styles.creditRow}>
                                    <View style={styles.creditLeft}>
                                        <LinearGradient
                                            colors={['#66cc33', '#047ec9']}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                            style={styles.subIconWrap}
                                        >
                                            <Zap color="#fff" size={18} />
                                        </LinearGradient>
                                        <View>
                                            <Text style={styles.creditLabel}>Subscription</Text>
                                            <Text style={styles.creditAmount}>Manage Plan</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => navigateTo('BillingScreen')}
                                    >
                                        <LinearGradient
                                            colors={['#66cc33', '#047ec9']}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={styles.getMoreBtn}
                                        >
                                            <CreditCard color="#fff" size={14} />
                                            <Text style={styles.getMoreText}>Billing</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>

                        {/* Group 1 — Sharing & Navigation */}
                        <Animated.View style={animStyle(card2Anim, slideAnims[3])}>
                            <View style={styles.card}>
                                <MenuItem icon={Zap} label="Upgrade Plan" onPress={() => navigateTo('PricingScreen')} />
                                <Separator />
                                <MenuItem icon={Share2} label="Share Musicful" onPress={() => navigateTo('ShareScreen')} />
                                <Separator />
                                <MenuItem icon={MessageSquare} label="Help Us Improve" onPress={() => navigateTo('FeedbackScreen')} />
                                <Separator />
                                <MenuItem icon={Trophy} label="Leaderboard" onPress={() => navigateTo('LeaderBoardScreen')} />
                                <Separator />
                                <MenuItem icon={Mic} label="Singers" onPress={() => navigateTo('SingersScreen')} />
                            </View>
                        </Animated.View>

                        {/* Group 2 — Legal & Support */}
                        <Animated.View style={animStyle(card3Anim, slideAnims[4])}>
                            <View style={styles.card}>
                                <MenuItem icon={Mail} label="Contact Us" onPress={() => navigateTo('ContactScreen')} />
                                <Separator />
                                <MenuItem icon={HelpCircle} label="FAQs" onPress={() => navigateTo('FAQsScreen')} />
                                <Separator />
                                <MenuItem icon={FileText} label="Terms of Services" onPress={() => navigateTo('TermsScreen')} />
                                <Separator />
                                <MenuItem icon={ShieldCheck} label="Privacy Policy" onPress={() => navigateTo('PrivacyScreen')} />
                                <Separator />
                                <MenuItem icon={RefreshCw} label="Check for Updates" onPress={() => navigateTo('UpdatesScreen')} />
                            </View>
                        </Animated.View>

                        {/* Follow Us */}
                        <Animated.View style={animStyle(footerAnim, slideAnims[5])}>
                            <View style={styles.card}>
                                <Text style={styles.sectionTitle}>Follow Us</Text>
                                <View style={styles.socialRow}>
                                    {[
                                        { C: Facebook },
                                        { C: Instagram },
                                        { C: Twitter },
                                        { C: Youtube },
                                    ].map(({ C }, i) => (
                                        <TouchableOpacity key={i} style={styles.socialCircle} activeOpacity={0.7}>
                                            <C color="#fff" size={18} />
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity style={styles.socialCircle} activeOpacity={0.7}>
                                        <Text style={styles.discordEmoji}>👾</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85} onPress={handleLogout}>
                                <MaterialIcons name="logout" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.actionBtnText}>LOG OUT</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.85}>
                                <MaterialIcons name="delete-forever" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.actionBtnText}>DELETE ACCOUNT</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </ImageBackground>
            </Animated.View>
        </Modal>
    );
};

export default MenuScreen;

const styles = StyleSheet.create({
    // ── Drawer shell ──────────────────────────────────────────
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    drawerPanel: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        overflow: 'hidden',
    },
    background: {
        flex: 1,
    },

    // ── Header ────────────────────────────────────────────────
    headerContainer: {
        paddingTop: Platform.OS === 'ios' ? 64 : 32,
        backgroundColor: 'transparent',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 52,
    },
    backButton: {
        width: 40,
        justifyContent: 'center',
    },
    logoWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    logo: {
        width: 180,
        height: 60,
    },
    headerDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginTop: 14,
    },

    // ── Scroll ────────────────────────────────────────────────
    scrollContent: {
        padding: 16,
        paddingTop: 14,
        paddingBottom: 128,
    },

    // ── Profile ───────────────────────────────────────────────
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        padding: 14,
    },
    avatarImage: {
        width: 58,
        height: 58,
        borderRadius: 29,
        borderWidth: 2,
        borderColor: 'rgba(102,204,51,0.5)',
    },
    avatarGradient: {
        width: 58,
        height: 58,
        borderRadius: 29,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#66cc33',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 14,
    },
    profileName: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.3,
    },
    profileSub: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: 'Oswald-Regular',
        marginTop: 2,
    },
    editProfileBtn: {
        padding: 8,
    },

    // ── Cards ─────────────────────────────────────────────────
    card: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        marginBottom: 14,
        overflow: 'hidden',
    },

    // ── Subscription ──────────────────────────────────────────
    creditRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
    },
    creditLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    subIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    creditLabel: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 11,
        fontFamily: 'Oswald-Regular',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    creditAmount: {
        color: '#fff',
        fontSize: 22,
        fontFamily: 'Oswald-Bold',
        lineHeight: 26,
    },
    getMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        borderRadius: 20,
        gap: 2,
    },
    getMoreText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.5,
        padding: 8,
    },

    // ── Menu items ────────────────────────────────────────────
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuItemText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.3,
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.07)',
        marginHorizontal: 14,
    },

    // ── Social ────────────────────────────────────────────────
    sectionTitle: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 13,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 4,
    },
    socialRow: {
        flexDirection: 'row',
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 12,
    },
    socialCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    discordEmoji: {
        fontSize: 16,
    },

    // ── Action buttons ────────────────────────────────────────
    logoutBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#047ec9',
        padding: 15,
        borderRadius: 14,
        marginBottom: 12,
        shadowColor: '#047ec9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    deleteBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(220, 53, 69, 0.85)',
        padding: 15,
        borderRadius: 14,
        shadowColor: '#dc3545',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 1.5,
    },
});
