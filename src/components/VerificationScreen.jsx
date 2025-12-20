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

const VerificationScreen = ({ navigation }) => {
    const [otp, setOtp] = useState('');

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
                                source={require('../assets/images/verification.png')}
                                style={styles.v1}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={styles.title}>Verification</Text>

                        <InputField
                            placeholder="Enter Your Code"
                            value={otp}
                            onChangeText={setOtp}
                            // iconName="calendar-today"
                            keyboardType="number-pad"
                        />
                        {/* LOG IN Button */}
                        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('ResetPasswordScreen')}>
                            <Text style={styles.loginButtonText}>continue</Text>
                        </TouchableOpacity>
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

export default VerificationScreen;

const styles = StyleSheet.create({
    logo: {
        height: 380,
        width: 280,
        opacity: 0.4
    },
    container: {
        flex: 1,
        marginTop: 10,
    },
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
        marginTop: 80,
    },
    title: {
        fontFamily: 'Oswald-Bold',
        fontSize: 28,
        color: '#FFFFFF',
        marginBottom: 20,
        marginTop: 7,
        textTransform: 'uppercase',
    },
    loginButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#047ec9',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Oswald-Bold',
        textTransform: 'uppercase',
    },

});
