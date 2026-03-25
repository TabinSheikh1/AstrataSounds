import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    Image,
    StatusBar,
    Platform,
    Animated,
    Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
    Share2, MessageSquare, Mail, HelpCircle,
    FileText, ShieldCheck, RefreshCw, Trophy,
    Mic, Facebook, Twitter, Youtube, Instagram,
} from 'lucide-react-native';

// ─────────────────────────────────────────────
// MenuItem — defined outside to avoid recreation
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
const MenuScreen = () => {
    const navigation = useNavigation();

    // Staggered entrance animations
    const headerAnim = useRef(new Animated.Value(0)).current;
    const profileAnim = useRef(new Animated.Value(0)).current;
    const card1Anim = useRef(new Animated.Value(0)).current;
    const card2Anim = useRef(new Animated.Value(0)).current;
    const card3Anim = useRef(new Animated.Value(0)).current;
    const footerAnim = useRef(new Animated.Value(0)).current;

    const slideAnims = [headerAnim, profileAnim, card1Anim, card2Anim, card3Anim, footerAnim]
        .map(() => useRef(new Animated.Value(20)).current);

    useEffect(() => {
        const anims = [headerAnim, profileAnim, card1Anim, card2Anim, card3Anim, footerAnim];
        const slides = slideAnims;

        Animated.stagger(80,
            anims.map((anim, i) =>
                Animated.parallel([
                    Animated.timing(anim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                    Animated.timing(slides[i], { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                ])
            )
        ).start();
    }, []);

    const animStyle = (opacityAnim, slideAnim) => ({
        opacity: opacityAnim,
        transform: [{ translateY: slideAnim }],
    });

    return (
        <ImageBackground
            source={require('../assets/images/image-1.jpg')}
            style={styles.background}
            resizeMode="cover"
        >
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* ── Header ── */}
            <Animated.View style={[styles.headerContainer, animStyle(headerAnim, slideAnims[0])]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={26} color="#fff" />
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
                    <LinearGradient
                        colors={['#66cc33', '#047ec9']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.avatarGradient}
                    >
                        <MaterialIcons name="person" size={36} color="#fff" />
                    </LinearGradient>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>John Michael</Text>
                        <Text style={styles.profileSub}>No information available yet</Text>
                    </View>
                    <TouchableOpacity style={styles.editProfileBtn}>
                        <MaterialIcons name="edit" size={16} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Credits card */}
                <Animated.View style={animStyle(card1Anim, slideAnims[2])}>
                    <View style={styles.card}>
                        <View style={styles.creditRow}>
                            <View style={styles.creditLeft}>
                                <Image source={require('../assets/images/gem-1.png')} style={styles.gemIcon} />
                                <View>
                                    <Text style={styles.creditLabel}>Credits</Text>
                                    <Text style={styles.creditAmount}>20</Text>
                                </View>
                            </View>
                            <TouchableOpacity activeOpacity={0.85}>
                                <LinearGradient
                                    colors={['#66cc33', '#047ec9']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.getMoreBtn}
                                >
                                    <MaterialIcons name="add" size={14} color="#fff" />
                                    <Text style={styles.getMoreText}>Get More</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>

                {/* Group 1 — Sharing & Navigation */}
                <Animated.View style={animStyle(card2Anim, slideAnims[3])}>
                    <View style={styles.card}>
                        <MenuItem icon={Share2} label="Share Musicful" />
                        <Separator />
                        <MenuItem icon={MessageSquare} label="Help Us Improve" />
                        <Separator />
                        <MenuItem icon={Trophy} label="Leaderboard" onPress={() => navigation.navigate('LeaderBoardScreen')} />
                        <Separator />
                        <MenuItem icon={Mic} label="Singers" onPress={() => navigation.navigate('SingersScreen')} />
                    </View>
                </Animated.View>

                {/* Group 2 — Legal & Support */}
                <Animated.View style={animStyle(card3Anim, slideAnims[4])}>
                    <View style={styles.card}>
                        <MenuItem icon={Mail} label="Contact Us" />
                        <Separator />
                        <MenuItem icon={HelpCircle} label="FAQs" />
                        <Separator />
                        <MenuItem icon={FileText} label="Terms of Services" />
                        <Separator />
                        <MenuItem icon={ShieldCheck} label="Privacy Policy" />
                        <Separator />
                        <MenuItem icon={RefreshCw} label="Check for Updates" />
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

                    {/* Action buttons */}
                    <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85}>
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
    );
};

export default MenuScreen;

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },

    // ── Header ────────────────────────────────────────────────
    headerContainer: {
        paddingTop: Platform.OS === 'ios' ? 64 : (StatusBar.currentHeight ?? 24) + 8,
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
        width: 220,
        height: 74,
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

    // ── Credits ───────────────────────────────────────────────
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
    gemIcon: {
        width: 28,
        height: 28,
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
        justifyContent:"center",
        paddingHorizontal:5,
        borderRadius: 20,
        gap: 2,
     
    },
    getMoreText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.5,
        padding: 8
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
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 4,
        color: 'rgba(255,255,255,0.55)',
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
