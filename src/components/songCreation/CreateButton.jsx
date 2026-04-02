import React from 'react';
import { Text, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { styles } from './songCreationStyles';

const CreateButton = ({ label = 'GENERATE NOW', icon = 'auto-awesome', handleGenerate, generating, btnScale }) => (
    <Animated.View style={[styles.createBtnWrap, { transform: [{ scale: btnScale }] }]}>
        <TouchableOpacity onPress={handleGenerate} activeOpacity={0.88} disabled={generating}>
            <LinearGradient
                colors={['#66cc33', '#047ec9']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.createBtn}
            >
                <MaterialIcons name={icon} size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.createBtnText}>{label}</Text>
            </LinearGradient>
        </TouchableOpacity>
    </Animated.View>
);

export default CreateButton;
