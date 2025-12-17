import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity, Image } from 'react-native';
import GradientBackground from './GradientBackground';
import InputField from '../components/InputField';


const SignUpScreen = ({ navigation }) => {
    // States for all fields
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

    return (
        <GradientBackground opacity={0.9}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.content}>
                        <Text style={styles.title}>Create account to get started now!</Text>
                        <View style={{}}>
                            <InputField
                                placeholder="First Name"
                                value={firstName}
                                onChangeText={setFirstName}
                            // iconName="person"
                            />
                            <InputField
                                placeholder="Last Name"
                                value={lastName}
                                onChangeText={setLastName}
                            // iconName="person-outline"
                            />
                            <InputField
                                placeholder="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                // iconName="email"
                                keyboardType="email-address"
                            />
                            <InputField
                                placeholder="Age"
                                value={age}
                                onChangeText={setAge}
                                // iconName="calendar-today"
                                keyboardType="number-pad"
                            />
                            <InputField
                                placeholder="Gender"
                                value={gender}
                                // iconName="wc"
                                editable={false}
                                // rightIcon="keyboard-arrow-down"
                                onPress={() => setGenderModal(true)}
                            />
                            <InputField
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword} // toggle visibility
                                rightIcon={showPassword ? 'visibility' : 'visibility-off'}
                                onRightIconPress={() => setShowPassword(!showPassword)}
                                iconName="lock"
                            />

                            <InputField
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword} // toggle visibility
                                rightIcon={showConfirmPassword ? 'visibility' : 'visibility-off'}
                                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                iconName="lock"
                            />

                        </View>
                        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('SignUpScreen')}>
                            <Text style={styles.loginButtonText}>Sign up</Text>
                        </TouchableOpacity>

                        {/* --- Social Login Section --- */}
                        <View style={styles.socialContainer}>
                            <View style={styles.socialHeader}>
                                <View style={styles.line} />
                                <Text style={styles.socialText}>Or Login With</Text>
                                <View style={styles.line} />
                            </View>

                            <View style={styles.socialButtons}>
                                {/* Google */}
                                <TouchableOpacity style={styles.socialButton}>
                                    <Image
                                        source={require('../assets/images/Google-Icon.png')}
                                        style={styles.socialIcon}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>

                                {/* Facebook */}
                                <TouchableOpacity style={styles.socialButton}>
                                    <Image
                                        source={require('../assets/images/Facebook-Icon.png')}
                                        style={styles.socialIcon}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>

                                {/* Apple */}
                                <TouchableOpacity style={styles.socialButton}>
                                    <Image
                                        source={require('../assets/images/Apple-Icon.png')}
                                        style={styles.socialIcon}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 25, gap: 5 }}>
                                <Text style={{ color: 'white', fontFamily: 'Oswald-Regular' }}>Don't have an account?</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                                    <Text style={styles.signupText}>Log In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Image
                            source={require('../assets/images/logo.jpg')}
                            style={styles.logo}
                            resizeMode="contain"
                        />

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    logo:{
        marginTop:10,
        height:80,
        width:280,
        opacity:0.4
    },
    container: {
        flex: 1,
        marginTop: 40,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
    },
    signupText: {
        color: '#ffffffff',
        textDecorationLine: 'underline',
        fontFamily: 'Oswald-Regular',
        letterSpacing: 0.9,
    },
    content: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 15,
    },
    title: {
        fontFamily: 'Oswald-Bold',
        fontSize: 28,
        color: '#FFFFFF',
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    socialContainer: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },
    socialHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'white',
        marginHorizontal: 8,
    },
    socialText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
    socialButton: {
        width: 80,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "white"
    },
    socialIcon: {
        width: 30,
        height: 30,
    },
    loginButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#0582ffff',
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },

});

export default SignUpScreen;
