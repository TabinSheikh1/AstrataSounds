import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const SuccessModal = ({ isVisible, onClose }) => {
    const navigation = useNavigation();
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
            statusBarTranslucent={true} // ensures full-screen on Android
        >
            <View style={[styles.overlay, { height }]}>
                <View style={styles.modalBox}>
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Image
                            source={require('../assets/images/Cross.png')}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>

                    {/* Checkmark Icon */}
                    <View style={styles.iconContainer}>
                        <Image
                            source={require('../assets/images/tick.png')}
                            resizeMode="cover"
                        />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>
                        Your Password Has Been Changed Successfully
                    </Text>

                    {/* Done Button */}
                    <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                        <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    modalBox: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingVertical: 30,
        paddingHorizontal: 25,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 15,
        zIndex: 10,
    },
    closeText: {
        fontSize: 28,
        color: '#333',
        fontWeight: '300',
    },
    iconContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 25,
    },
    doneButton: {
        backgroundColor: '#047ec9',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        alignItems: 'center',
        width: '60%',
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SuccessModal;
