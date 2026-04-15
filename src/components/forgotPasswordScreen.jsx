import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    ScrollView,
    Animated,
    Easing,
    StatusBar,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import GradientBackground from './GradientBackground';
import InputField from './InputField';
import { forgotPassword } from '../store/actions/authActions';

const ForgotPasswordScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);

    const [email, setEmail] = useState('');

    const headerOpacity = useRef(new Animated.Value(0)).current;
    const headerSlide = useRef(new Animated.Value(-30)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;
    const formSlide = useRef(new Animated.Value(30)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.stagger(150, [
            Animated.parallel([
                Animated.timing(headerOpacity, {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(headerSlide, {
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
        ]).start();
    }, []);

    const handleContinue = async () => {
        if (!email.trim()) {
            Alert.alert('Validation Error', 'Please enter your email address');
            return;
        }

        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.95, duration: 90, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 90, useNativeDriver: true }),
        ]).start();

        const result = await dispatch(forgotPassword({ email: email.trim().toLowerCase() }));

        if (result.success) {
            navigation.navigate('VerificationScreen', {
                email: email.trim().toLowerCase(),
                type: 'PASSWORD_RESET',
            });
        } else {
            Alert.alert('Error', result.message);
        }
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
                    {/* Header */}
                    <Animated.View
                        style={[
                            styles.headerSection,
                            {
                                opacity: headerOpacity,
                                transform: [{ translateY: headerSlide }],
                            },
                        ]}
                    >
                        <View style={styles.imageContainer}>
                            <Image
                                source={require('../assets/images/Forgot-Password.png')}
                                style={styles.illustration}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.title}>Forgot Password</Text>
                        <Text style={styles.subtitle}>
                            Enter your email and we'll send you a reset code
                        </Text>
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
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            iconName="email"
                            keyboardType="email-address"
                        />

                        <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonScale }] }]}>
                            <TouchableOpacity
                                style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
                                onPress={handleContinue}
                                activeOpacity={0.85}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.continueButtonText}>CONTINUE</Text>
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                        <TouchableOpacity
                            style={styles.backLink}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backLinkText}>Back to Login</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Image
                        source={require('../assets/images/logo.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
};

export default ForgotPasswordScreen;

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

    // Header
    headerSection: {
        alignItems: 'center',
        width: '100%',
        marginBottom: 30,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    illustration: {
        width: 220,
        height: 220,
    },
    title: {
        fontFamily: 'Oswald-Bold',
        fontSize: 28,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'Oswald-Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        letterSpacing: 0.5,
        lineHeight: 20,
    },

    // Form
    formSection: {
        width: '100%',
        alignItems: 'center',
    },
    buttonWrapper: {
        width: '100%',
        marginTop: 20,
    },
    continueButton: {
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
    continueButtonDisabled: {
        opacity: 0.7,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 2,
    },
    backLink: {
        marginTop: 20,
        paddingVertical: 8,
    },
    backLinkText: {
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'Oswald-Regular',
        fontSize: 14,
        textDecorationLine: 'underline',
        letterSpacing: 0.5,
    },

    logo: {
        marginTop: 40,
        height: 120,
        width: 220,
        opacity: 0.4,
    },
});
