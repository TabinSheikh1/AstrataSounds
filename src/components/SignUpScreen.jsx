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
    Alert,
    ActivityIndicator,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import GradientBackground from './GradientBackground';
import InputField from './InputField';
import { registerUser } from '../store/actions/authActions';

const SignUpScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
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

    const validateForm = () => {
        if (!firstName.trim()) {
            Alert.alert('Validation Error', 'First name is required');
            return false;
        }
        if (!lastName.trim()) {
            Alert.alert('Validation Error', 'Last name is required');
            return false;
        }
        if (!email.trim()) {
            Alert.alert('Validation Error', 'Email is required');
            return false;
        }
        if (!password.trim()) {
            Alert.alert('Validation Error', 'Password is required');
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert('Validation Error', 'Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSignUpPress = async () => {
        if (!validateForm()) return;

        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.95, duration: 90, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 90, useNativeDriver: true }),
        ]).start();

        const result = await dispatch(
            registerUser({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                password,
            })
        );

        if (result.success) {
            navigation.navigate('VerificationScreen', {
                email: email.trim().toLowerCase(),
                type: 'EMAIL_VERIFICATION',
            });
        } else {
            Alert.alert('Sign Up Failed', result.message);
        }
    };

    return (
        <GradientBackground opacity={0.9}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                                style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
                                onPress={handleSignUpPress}
                                activeOpacity={0.85}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.signUpButtonText}>SIGN UP</Text>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>

                    {/* Footer */}
                    <Animated.View style={[styles.footerSection, { opacity: footerOpacity }]}>
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
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

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
    signUpButtonDisabled: {
        opacity: 0.7,
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
});
