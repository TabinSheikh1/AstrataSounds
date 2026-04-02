import React from 'react';
import { View } from 'react-native';
import { styles } from './songCreationStyles';

const GlassBox = ({ children, style }) => (
    <View style={[styles.glassBox, style]}>{children}</View>
);

export default GlassBox;
