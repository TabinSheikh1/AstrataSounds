import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    Image,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
    Share2,
    MessageSquare,
    Mail,
    HelpCircle,
    FileText,
    ShieldCheck,
    RefreshCw,
    Trophy,
    Mic,
    Facebook,
    Twitter,
    Youtube,
    Instagram // Added for social row
} from 'lucide-react-native';

const MenuScreen = () => {
    const navigation = useNavigation();

    // Reusable component for the list items
    const MenuItem = ({ icon: Icon, label, onPress }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <Icon color="white" size={20} style={styles.itemIcon} />
                <Text style={styles.menuItemText}>{label}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="white" />
        </TouchableOpacity>
    );

    return (
        <ImageBackground
            source={require('../assets/images/image-1.jpg')}
            style={styles.background}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" />

            {/* --- SECONDARY HEADER SECTION --- */}
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.logoCenter}>
                        <Text style={styles.brandText}>
                            STRATASOUND<Text style={styles.tmSymbol}>™</Text>
                        </Text>
                        <Text style={styles.subBrandText}>MUSIC</Text>
                    </View>

                    <View style={styles.headerPlaceholder} />
                </View>
                <View style={styles.headerDivider} />
            </View>

            {/* --- SCROLLABLE CONTENT --- */}
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <MaterialIcons name="person" size={40} color="white" />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>John Michael</Text>
                        <Text style={styles.profileSub}>No information available yet</Text>
                    </View>
                </View>

                {/* Credits Section */}
                <View style={styles.card}>
                    <View style={styles.creditRow}>
                        <View style={styles.creditLeft}>
                            <Image
                                source={require('../assets/images/gem-1.png')}
                                style={styles.gemIcon}
                            />
                            <Text style={styles.creditText}>20 Credit</Text>
                        </View>
                        <TouchableOpacity style={styles.getMoreBtn}>
                            <Text style={styles.getMoreText}>Get More Songs</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Group 1: Sharing & Feedback */}
                <View style={styles.card}>
                    <MenuItem icon={Share2} label="Share Musicful" />
                    <View style={styles.separator} />
                    <MenuItem icon={MessageSquare} label="Help Us Improve" />
                    <MenuItem icon={Trophy} label="Leaderboard" onPress={()=>navigation.navigate('LeaderBoardScreen')} />
                    <MenuItem icon={Mic} label="Singers" onPress={()=>navigation.navigate('SingersScreen')} />
                </View>

                {/* Group 2: Legal & Support */}
                <View style={styles.card}>
                    <MenuItem icon={Mail} label="Contact Us" />
                    <View style={styles.separator} />
                    <MenuItem icon={HelpCircle} label="FAQs" />
                    <View style={styles.separator} />
                    <MenuItem icon={FileText} label="Terms of Services" />
                    <View style={styles.separator} />
                    <MenuItem icon={ShieldCheck} label="Privacy Policy" />
                    <View style={styles.separator} />
                    <MenuItem icon={RefreshCw} label="Check for Updated" />
                </View>

                {/* Follow Us Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Follow Us</Text>
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialCircle}><Facebook color="white" size={18} /></TouchableOpacity>
                        <TouchableOpacity style={styles.socialCircle}><Instagram color="white" size={18} /></TouchableOpacity>
                        <TouchableOpacity style={styles.socialCircle}><Twitter color="white" size={18} /></TouchableOpacity>
                        <TouchableOpacity style={styles.socialCircle}>
                            <Text style={styles.socialEmoji}>👾</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialCircle}><Youtube color="white" size={18} /></TouchableOpacity>
                    </View>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity style={styles.logoutBtn}>
                    <Text style={styles.actionBtnText}>LOG OUT</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn}>
                    <Text style={styles.actionBtnText}>DELETE ACCOUNT</Text>
                </TouchableOpacity>

            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Header Styles
    headerContainer: {
        paddingTop: 45, // Adjust for notch/status bar
        backgroundColor: 'transparent',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
    },
    backButton: {
        width: 40,
    },
    headerPlaceholder: {
        width: 40,
    },
    logoCenter: {
        alignItems: 'center',
    },
    brandText: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.5,
    },
    tmSymbol: {
        fontSize: 8,
        textAlignVertical: 'top',
    },
    subBrandText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Oswald-Regular',
        marginTop: -4,
        letterSpacing: 4,
    },
    headerDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: '100%',
    },

    // Main Container
    scrollContainer: {
        padding: 20,
        paddingTop: 10, // Small gap after header
        paddingBottom: 40,
    },

    // Profile
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        marginLeft: 15,
    },
    profileName: {
        color: 'white',
        fontSize: 22,
        fontFamily: 'Oswald-Bold',
    },
    profileSub: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 13,
    },

    // Cards
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 1)',
        marginBottom: 15,
        paddingVertical: 5,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        marginRight: 15,
    },
    menuItemText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Oswald-SemiBold',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 15,
    },

    // Credits
    creditRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
    },
    creditLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gemIcon: {
        width: 18,
        height: 18,
        marginRight: 10,
    },
    creditText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Oswald-Bold',
    },
    getMoreBtn: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 8,
    },
    getMoreText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Oswald-Bold',
    },

    // Social
    sectionTitle: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Oswald-Bold',
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    socialRow: {
        flexDirection: 'row',
        padding: 8,
        gap: 12,
    },
    socialCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialEmoji: {
        fontSize: 16,
    },

    // Bottom Buttons
    logoutBtn: {
        backgroundColor: '#047ec9',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    deleteBtn: {
        backgroundColor: '#18ff20b1',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 80,
    },
    actionBtnText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Oswald-Bold',
    },
});

export default MenuScreen;