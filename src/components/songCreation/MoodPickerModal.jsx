import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MOODS } from './constants';
import { styles } from './songCreationStyles';

const MoodPickerModal = ({ visible, onSelect, onClose }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.moodOverlay}>
            <View style={styles.moodSheet}>
                <View style={styles.moodHeader}>
                    <MaterialIcons name="mood" size={20} color="#66cc33" />
                    <Text style={styles.moodHeaderTitle}>Choose a Mood</Text>
                    <TouchableOpacity onPress={onClose} style={styles.moodCloseBtn}>
                        <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.moodHeaderSub}>The AI will write lyrics matching this feeling</Text>
                <View style={styles.moodGrid}>
                    {MOODS.map((m) => (
                        <TouchableOpacity
                            key={m.value}
                            style={styles.moodCard}
                            onPress={() => onSelect(m.value)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[`${m.color}22`, `${m.color}11`]}
                                style={styles.moodCardGrad}
                            >
                                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                                <Text style={[styles.moodLabel, { color: m.color }]}>{m.label}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    </Modal>
);

export default MoodPickerModal;
