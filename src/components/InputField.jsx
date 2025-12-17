import React from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const InputField = ({
    iconName,
    placeholder,
    value,
    onChangeText,
    keyboardType = 'default',
    secureTextEntry = false,  // controlled by parent
    autoCapitalize = 'none',
    rightIcon,
    onRightIconPress,
    editable = true,
    onPress,
    multiline = false,
    containerStyle,
    inputStyle,
}) => {
    const Wrapper = onPress ? TouchableOpacity : View;

    return (
        <Wrapper
            style={[styles.wrapper, containerStyle]}
            activeOpacity={0.8}
            onPress={onPress}
            disabled={!onPress}
        >
            {iconName && (
                <MaterialIcons
                    name={iconName}
                    size={22}
                    color="#66CC33"
                    style={styles.icon}
                />
            )}

            <TextInput
                style={[styles.input, inputStyle]}
                placeholder={placeholder}
                placeholderTextColor="#707070"
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                autoCapitalize={autoCapitalize}
                textContentType={secureTextEntry ? 'password' : 'none'}
                editable={editable}
                multiline={false}  // must be false for password
                pointerEvents={editable ? 'auto' : 'none'}
            />

            {rightIcon && (
                <MaterialIcons
                    name={rightIcon}
                    size={22}
                    color="#66CC33"
                    style={styles.rightIcon}
                    onPress={onRightIconPress}
                />
            )}
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        height: 50,
        width: '100%',
        marginBottom: 6,
        paddingHorizontal: 12,
        marginTop: 5,
    },
    icon: { marginRight: 8 },
    rightIcon: { marginLeft: 8 },
    input: {
        flex: 1,
        height: '100%',
        color: '#707070',
        fontFamily: 'Oswald-Medium',
        fontSize: 15,
    },
});

export default InputField;
