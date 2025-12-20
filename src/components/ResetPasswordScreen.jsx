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
import SuccessModal from './SuccessModal';


const { width } = Dimensions.get('window');

const ResetPasswordScreen = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [error, setError] = useState('');

    const handleContinue = () => {
        if (!password || !confirmPassword) {
            setError('Please fill all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');
        setModalVisible(true); // Show success modal
    };

    return (
        <GradientBackground opacity={0.9}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingHorizontal: 24 }}>
                    <View style={{ alignItems: 'center', marginTop: 90 }}>
                        <Image source={require('../assets/images/Reset-Password.png')} style={{ width: 220, height: 220 }} resizeMode="contain" />
                    </View>

                    <Text style={{ fontFamily: 'Oswald-Bold', fontSize: 28, color: '#fff', marginVertical: 20, textTransform: 'uppercase' }}>
                        Reset Password
                    </Text>

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

                    {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}

                    <TouchableOpacity
                        style={{ width: '100%', height: 50, backgroundColor: '#0582ff', borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}
                        onPress={handleContinue}
                    >
                        <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Oswald-Bold', textTransform: 'uppercase' }}>
                            Continue
                        </Text>
                    </TouchableOpacity>
                    <Image
                        source={require('../assets/images/logo.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <SuccessModal isVisible={modalVisible} onClose={() => setModalVisible(false)} />
                </ScrollView>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
};


export default ResetPasswordScreen;

const styles = StyleSheet.create({
    logo:{
        height:260,
        width:280,
        opacity:0.4
    },
    container: {

        marginTop: 10,
    },
    content: {

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
        marginTop: 60,
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
