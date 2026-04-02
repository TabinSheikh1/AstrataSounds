import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { HelpCircle } from 'lucide-react-native';
import { styles } from './songCreationStyles';

const SectionLabel = ({ icon, title, hint }) => (
    <View style={styles.sectionLabelRow}>
        <View style={styles.sectionLabelLeft}>
            <View style={styles.sectionIconWrap}>
                <MaterialIcons name={icon} size={14} color="#66cc33" />
            </View>
            <Text style={styles.sectionLabelText}>{title}</Text>
        </View>
        {hint && (
            <TouchableOpacity style={styles.hintBtn}>
                <HelpCircle size={15} color="rgba(255,255,255,0.45)" />
            </TouchableOpacity>
        )}
    </View>
);

export default SectionLabel;
