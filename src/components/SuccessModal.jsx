import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Animated,
    Easing,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SuccessModal = ({ isVisible, onClose }) => {
    const navigation = useNavigation();
    const scaleAnim = useRef(new Animated.Value(0.7)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 65,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 250,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0.7);
            opacityAnim.setValue(0);
        }
    }, [isVisible]);

    const handleDone = () => {
        onClose();
        navigation.navigate('LoginScreen');
    };

    return (
        <Modal
            animationType="fade"
            transparent
            visible={isVisible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.modalBox,
                        {
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Image
                            source={require('../assets/images/Cross.png')}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <Image
                            source={require('../assets/images/tick.png')}
                            resizeMode="cover"
                        />
                    </View>

                    <Text style={styles.title}>Password Changed!</Text>
                    <Text style={styles.subtitle}>
                        Your password has been updated successfully.
                    </Text>

                    <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                        <Text style={styles.doneButtonText}>DONE</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default SuccessModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: '82%',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 36,
        paddingHorizontal: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 16,
        zIndex: 10,
        padding: 4,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a2e',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 20,
    },
    doneButton: {
        backgroundColor: '#047ec9',
        paddingVertical: 13,
        paddingHorizontal: 48,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#047ec9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
});
