import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, Image, TouchableOpacity } from 'react-native';
import Header from './Header';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import LinearGradient from 'react-native-linear-gradient';
const { width, height } = Dimensions.get('window');
import { Colors } from '../assets/theme/colors';

const FullScreenBackground = () => {
    return (
        <ImageBackground
            source={require('../assets/images/image-1.jpg')} // replace with your image
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <Header title="STRATASOUND MUSIC" coins={25} onMenuPress={() => console.log("Menu pressed")} />
                <View style={styles.playerContainer}>
                    {/* Waveform Visualization Area */}
                    <Image
                        source={require('../assets/images/Rectangle-9564.png')}
                        style={styles.waveformImage}
                        resizeMode="cover"
                    />

                    {/* Progress Bar */}
                    <View style={styles.progressSection}>
                        <View style={styles.timeRow}>
                            <Text style={styles.timeText}>00:00:20</Text>
                            <Text style={styles.timeText}>00:00:42</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '35%' }]} />
                        </View>
                    </View>

                    {/* Control Buttons */}
                    <View style={styles.controlsRow}>
                        <TouchableOpacity style={styles.controlCircleSmall}>
                            <Text style={styles.controlTextSmall}>1.0x</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlCircleSmall}>
                            <MaterialIcons name="repeat" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <LinearGradient
                                colors={[Colors.bottom, Colors.middle, Colors.top]}
                                style={styles.playButtonMain}
                            >
                                <FontAwesome name="play" size={30} color="#fff" style={{ marginLeft: 2 }} />
                            </LinearGradient>
                        </TouchableOpacity>


                        <TouchableOpacity style={styles.controlCircleSmall}>
                            <MaterialIcons name="favorite-border" size={24} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlCircleSmall}>
                            <MaterialIcons name="file-download" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Date</Text>
                            <Text style={styles.infoValue}>April 20, 2024 | 14:39 AM</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Format</Text>
                            <Text style={styles.infoValue}>Mp3 | 320Kbps</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Duration</Text>
                            <Text style={styles.infoValue}>00:00:42</Text>
                        </View>
                    </View>
                </View>
            </View>

        </ImageBackground >
    );
};

const styles = StyleSheet.create({
    background: {
        width: width,
        height: height,
        flex: 1,
    },
    container: {
        flex: 1,
        paddingTop: 40
    },
    playerContainer: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    waveformImage: {
        width: '100%',
        height: 220,
        borderRadius: 15,
        marginTop: 20,
    },
    progressSection: {
        width: '100%',
        marginTop: 15,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    timeText: {
        color: '#fff',
        fontSize: 12,
    },
    progressBarBg: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#66cc33', 
        borderRadius: 2,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginVertical: 30,
    },
    controlCircleSmall: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlTextSmall: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    playButtonMain: {
        width: 70,
        height: 70,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    infoCard: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 15,
        padding: 20,
    },
    infoRow: {
        marginBottom: 15,
    },
    infoLabel: {
        color: '#666',
        fontSize: 12,
        marginBottom: 2,
        fontFamily: 'Oswald-Light'
    },
    infoValue: {
        color: '#000',
        fontSize: 15,
        fontFamily: 'Oswald-Regular'
    },
});

export default FullScreenBackground;
