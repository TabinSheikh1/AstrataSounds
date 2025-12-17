import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    Dimensions,
    ScrollView
} from 'react-native';
import GradientBackground from './GradientBackground';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import InputField from './InputField';

const { width } = Dimensions.get('window');

const forgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <GradientBackground opacity={0.9}>

            <KeyboardAvoidingView

                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView>
                    <View style={styles.content}>
                        {/* V1 Image Container */}
                        <View style={styles.v1Cont}>
                            <Image
                                source={require('../assets/images/login-vector.png')}
                                style={styles.v1}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={styles.title}>log in</Text>

                        {/* Email Input Field */}
                        <View style={styles.inputWrapper}>
        
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
                                secureTextEntry={!showPassword} // toggle visibility
                                rightIcon={showPassword ? 'visibility' : 'visibility-off'}
                                onRightIconPress={() => setShowPassword(!showPassword)}
                                iconName="lock"
                            />
                        </View>
                        {/* Forgot Password Link */}
                        <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('ForgotPasswordScreen')}>
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* LOG IN Button */}
                        <TouchableOpacity style={styles.loginButton} onPress={()=>navigation.navigate('HomeSongsScreen')}>
                            <Text style={styles.loginButtonText}>LOG IN</Text>
                        </TouchableOpacity>

                        {/* --- Social Login Section --- */}
                        <View style={styles.socialContainer}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={styles.line}></View>
                                <Text style={styles.socialText}>Or Login With</Text>
                                <View style={styles.line}></View>
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
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: 25, gap: 5 }}>
                            <Text style={{ color: 'white', fontFamily: 'Oswald-Regular' }}>Don't have an account?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
                                <Text style={styles.signupText}>Sign Up Now</Text>
                            </TouchableOpacity>
                            
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

export default forgotPasswordScreen;

const styles = StyleSheet.create({
    logo:{
        marginTop:25,
        height:120,
        width:220,
        opacity:0.4
    
    },
    signupText: {
        color: '#ffffffff',
        textDecorationLine: 'underline',
        fontFamily: 'Oswald-Regular',
        letterSpacing: 0.9,
    },
    line: {
        marginTop: 20,
        flex: 1, // Makes the line take up available space
        height: 1, // Thickness of the line
        backgroundColor: 'white', // Color of the line
        marginHorizontal: 8, // Spacing between the line and the text
    },
    container: { flex: 1 },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    v1: {
        width: 220,
        height: 220,
    },
    v1Cont: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 65,
    },
    title: {
        fontFamily: 'Oswald-Bold',
        fontSize: 28,
        color: '#FFFFFF',
        marginBottom: 20,
        marginTop: 7,
        textTransform: 'uppercase',
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        width: '100%',
        paddingRight: 5,
        marginBottom: 20,
    },
    forgotText: {
        color: '#ffffffff',
        fontSize: 14,
    },
    loginButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#0582ffff',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Oswald-Bold',
        textTransform: 'uppercase',
    },
    // --- Social login styles ---
    socialContainer: {
        marginTop: 20,
        alignItems: 'center',
        width: '100%',
    },
    socialText: {
        color: '#fff',
        marginBottom: 10,
        fontSize: 14,
        padding: 10,
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
});
