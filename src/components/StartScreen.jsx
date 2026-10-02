import React from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

const ReviewPendingScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#f5f5f7"
            />

            <ScrollView style={styles.wrapper} contentContainerStyle={{paddingBottom:30}}>
                {/* Header */}
                <View>
                    <View style={styles.headerContainer}>
                        <View style={styles.logoContainer}>
                            <Ionicons
                                name="logo-apple"
                                size={42}
                                color="#fff"
                            />
                        </View>

                        <Text style={styles.title}>
                            App Review in Progress
                        </Text>

                        <Text style={styles.subtitle}>
                            Your AI-powered application is currently
                            undergoing an internal compliance and quality
                            review before TestFlight access is granted.
                        </Text>
                    </View>

                    {/* Information Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            Why is this required?
                        </Text>

                        <Text style={styles.cardDescription}>
                            To maintain platform integrity and ensure
                            responsible AI distribution, all AI-related
                            applications must be reviewed before external
                            testing is enabled.
                        </Text>

                        <Text
                            style={[
                                styles.cardDescription,
                                { marginTop: 16 },
                            ]}>
                            This review helps verify content safety,
                            AI-generated experiences, and App Store
                            readiness before shipment to TestFlight.
                        </Text>
                    </View>

                    {/* Time Notice */}
                    <View style={styles.noticeContainer}>
                        <Text style={styles.noticeTitle}>
                            Estimated Review Time
                        </Text>

                        <Text style={styles.noticeText}>
                            Please check back within
                            <Text style={styles.boldText}>
                                {' '}
                                24–48 hours
                            </Text>{' '}
                            while our team completes the verification
                            process.
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View>


                    <Text style={styles.footerText}>
                        TestFlight access will automatically become
                        available once the review process has been
                        completed.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ReviewPendingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f7',
    },

    wrapper: {
        flex: 1,
        
        paddingHorizontal: 24,
        paddingVertical: 40,
    },

    headerContainer: {
        alignItems: 'center',
        marginTop: 30,
    },

    logoContainer: {
        width: 84,
        height: 84,
        borderRadius: 28,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
    },

    title: {
        fontSize: 34,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        lineHeight: 42,
    },

    subtitle: {
        marginTop: 18,
        fontSize: 17,
        color: '#6e6e73',
        textAlign: 'center',
        lineHeight: 28,
        paddingHorizontal: 6,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 28,
        padding: 24,
        marginTop: 40,
        borderWidth: 1,
        borderColor: '#e5e5ea',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 10,

        elevation: 3,
    },

    cardTitle: {
        fontSize: 21,
        fontWeight: '600',
        color: '#000',
        marginBottom: 14,
    },

    cardDescription: {
        fontSize: 16,
        color: '#6e6e73',
        lineHeight: 28,
    },

    noticeContainer: {
        marginTop: 24,
        backgroundColor: '#eef2ff',
        borderWidth: 1,
        borderColor: '#dbe4ff',
        borderRadius: 22,
        padding: 20,
    },

    noticeTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },

    noticeText: {
        marginTop: 10,
        fontSize: 16,
        color: '#4b5563',
        lineHeight: 26,
    },

    boldText: {
        fontWeight: '700',
        color: '#000',
    },

    button: {
        backgroundColor: '#000',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
    },

    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },

    footerText: {
        marginTop: 18,
        textAlign: 'center',
        color: '#8e8e93',
        fontSize: 13,
        lineHeight: 20,
        paddingHorizontal: 16,
    },
});