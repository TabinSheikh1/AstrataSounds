import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    TouchableOpacity,
    Image,
    Animated,
    Easing,
    StatusBar,
} from 'react-native';
import GradientBackground from './GradientBackground';
import InputField from './InputField';

const GENDER_OPTIONS = ['Male', 'Female', 'Prefer not to say'];

const SignUpScreen = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [isGenderModalVisible, setGenderModal] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleSlide = useRef(new Animated.Value(-20)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;
    const formSlide = useRef(new Animated.Value(30)).current;
    const footerOpacity = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.stagger(150, [
            Animated.parallel([
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(titleSlide, {
                    toValue: 0,
                    duration: 700,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(formOpacity, {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(formSlide, {
                    toValue: 0,
                    duration: 700,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(footerOpacity, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleSignUpPress = () => {
        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.95, duration: 90, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 90, useNativeDriver: true }),
        ]).start(() => {
            // TODO: handle sign up logic
        });
    };

    const handleGenderSelect = (option) => {
        setGender(option);
        setGenderModal(false);
    };

    return (
        <GradientBackground opacity={0.9}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title */}
                    <Animated.View
                        style={[
                            styles.titleSection,
                            {
                                opacity: titleOpacity,
                                transform: [{ translateY: titleSlide }],
                            },
                        ]}
                    >
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Get started today</Text>
                    </Animated.View>

                    {/* Form */}
                    <Animated.View
                        style={[
                            styles.formSection,
                            {
                                opacity: formOpacity,
                                transform: [{ translateY: formSlide }],
                            },
                        ]}
                    >
                        <InputField
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                            iconName="person"
                        />
                        <InputField
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                            iconName="person-outline"
                        />
                        <InputField
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            iconName="email"
                            keyboardType="email-address"
                        />
                        <InputField
                            placeholder="Age"
                            value={age}
                            onChangeText={setAge}
                            iconName="cake"
                            keyboardType="number-pad"
                        />
                        <InputField
                            placeholder={gender || 'Gender'}
                            value={gender}
                            iconName="wc"
                            editable={false}
                            rightIcon="keyboard-arrow-down"
                            onPress={() => setGenderModal(true)}
                        />
                        <InputField
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            rightIcon={showPassword ? 'visibility' : 'visibility-off'}
                            onRightIconPress={() => setShowPassword(prev => !prev)}
                            iconName="lock"
                        />
                        <InputField
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            rightIcon={showConfirmPassword ? 'visibility' : 'visibility-off'}
                            onRightIconPress={() => setShowConfirmPassword(prev => !prev)}
                            iconName="lock-outline"
                        />

                        <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonScale }] }]}>
                            <TouchableOpacity
                                style={styles.signUpButton}
                                onPress={handleSignUpPress}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.signUpButtonText}>SIGN UP</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>

                    {/* Footer */}
                    <Animated.View style={[styles.footerSection, { opacity: footerOpacity }]}>
                        <View style={styles.socialContainer}>
                            <View style={styles.dividerRow}>
                                <View style={styles.line} />
                                <Text style={styles.socialText}>Or Sign Up With</Text>
                                <View style={styles.line} />
                            </View>

                            <View style={styles.socialButtons}>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Image
                                        source={require('../assets/images/Google-Icon.png')}
                                        style={styles.socialIcon}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Image
                                        source={require('../assets/images/Facebook-Icon.png')}
                                        style={styles.socialIcon}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Image
                                        source={require('../assets/images/Apple-Icon.png')}
                                        style={styles.socialIcon}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.loginRow}>
                            <Text style={styles.loginPrompt}>Already have an account?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                                <Text style={styles.loginLink}>Log In</Text>
                            </TouchableOpacity>
                        </View>

                        <Image
                            source={require('../assets/images/logo.jpg')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Gender Picker Modal */}
            {isGenderModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>Select Gender</Text>
                        {GENDER_OPTIONS.map(option => (
                            <TouchableOpacity
                                key={option}
                                style={styles.modalOption}
                                onPress={() => handleGenderSelect(option)}
                            >
                                <Text style={styles.modalOptionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setGenderModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </GradientBackground>
    );
};

export default SignUpScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 30,
    },

    // Title
    titleSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontFamily: 'Oswald-Bold',
        fontSize: 30,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    subtitle: {
        fontFamily: 'Oswald-Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
        letterSpacing: 1,
    },

    // Form
    formSection: {
        width: '100%',
    },
    buttonWrapper: {
        width: '100%',
        marginTop: 10,
    },
    signUpButton: {
        width: '100%',
        height: 52,
        backgroundColor: '#047ec9',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#047ec9',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 8,
    },
    signUpButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 2,
    },

    // Footer
    footerSection: {
        width: '100%',
        alignItems: 'center',
    },
    socialContainer: {
        marginTop: 24,
        width: '100%',
        alignItems: 'center',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.35)',
        marginHorizontal: 8,
    },
    socialText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Oswald-Regular',
        letterSpacing: 0.5,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginTop: 16,
    },
    socialButton: {
        width: 80,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    socialIcon: {
        width: 30,
        height: 30,
    },
    loginRow: {
        flexDirection: 'row',
        marginTop: 24,
        gap: 5,
    },
    loginPrompt: {
        color: 'white',
        fontFamily: 'Oswald-Regular',
    },
    loginLink: {
        color: '#ffffff',
        textDecorationLine: 'underline',
        fontFamily: 'Oswald-Regular',
        letterSpacing: 0.9,
    },
    logo: {
        marginTop: 20,
        height: 80,
        width: 280,
        opacity: 0.4,
    },

    // Gender modal
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#1a1a2e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    modalTitle: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 18,
        letterSpacing: 1,
        marginBottom: 16,
        textAlign: 'center',
    },
    modalOption: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    modalOptionText: {
        color: '#fff',
        fontFamily: 'Oswald-Regular',
        fontSize: 16,
        textAlign: 'center',
    },
    modalCancel: {
        marginTop: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },
    modalCancelText: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Oswald-Regular',
        fontSize: 15,
    },
});
