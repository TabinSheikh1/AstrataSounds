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
import SuccessModal from './SuccessModal';
import { resetPassword } from '../store/actions/authActions';

const ResetPasswordScreen = ({ route }) => {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);

    const { email, otp } = route.params ?? {};

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [error, setError] = useState('');

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
        if (!password || !confirmPassword) {
            setError('Please fill all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');

        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.95, duration: 90, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 90, useNativeDriver: true }),
        ]).start();

        const result = await dispatch(resetPassword({ email, otp, newPassword: password }));

        if (result.success) {
            setModalVisible(true);
        } else {
            Alert.alert('Reset Failed', result.message);
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
                                source={require('../assets/images/Reset-Password.png')}
                                style={styles.illustration}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>Choose a strong new password</Text>
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
                            placeholder="New Password"
                            value={password}
                            onChangeText={(text) => { setPassword(text); setError(''); }}
                            secureTextEntry={!showPassword}
                            rightIcon={showPassword ? 'visibility' : 'visibility-off'}
                            onRightIconPress={() => setShowPassword(prev => !prev)}
                            iconName="lock"
                        />
                        <InputField
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={(text) => { setConfirmPassword(text); setError(''); }}
                            secureTextEntry={!showConfirmPassword}
                            rightIcon={showConfirmPassword ? 'visibility' : 'visibility-off'}
                            onRightIconPress={() => setShowConfirmPassword(prev => !prev)}
                            iconName="lock-outline"
                        />

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
                    </Animated.View>

                    <Image
                        source={require('../assets/images/logo.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            <SuccessModal isVisible={modalVisible} onClose={() => setModalVisible(false)} />
        </GradientBackground>
    );
};

export default ResetPasswordScreen;

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
    },

    // Form
    formSection: {
        width: '100%',
        alignItems: 'center',
    },
    errorText: {
        color: '#ff6b6b',
        fontFamily: 'Oswald-Regular',
        fontSize: 13,
        alignSelf: 'flex-start',
        marginTop: 4,
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    buttonWrapper: {
        width: '100%',
        marginTop: 16,
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

    logo: {
        marginTop: 40,
        height: 120,
        width: 220,
        opacity: 0.4,
    },
});
