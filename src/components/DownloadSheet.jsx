import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    ActivityIndicator, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { downloadSongToDevice } from '../utils/downloadSong';

const fmt = (secs) => {
    const s = Math.max(0, Math.floor(secs));
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
};

const DownloadSheet = ({ visible, onClose, song, onDownloadComplete }) => {
    const [downloading, setDownloading] = useState(null); // 'song' | 'reel' | null
    const [progress, setProgress] = useState(0);

    const hasReel = !!song?.reelPath;

    const triggerDownload = async (type) => {
        setDownloading(type);
        setProgress(0);
        try {
            await downloadSongToDevice(song.id, type === 'reel' ? 'reel' : 'audio', setProgress);
            onDownloadComplete?.();
            onClose();
        } catch (e) {
            Alert.alert('Download Failed', e?.userMessage || 'Download failed. Please try again.');
        } finally {
            setDownloading(null);
            setProgress(0);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    {/* Handle bar */}
                    <View style={styles.handle} />

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Download</Text>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.subtitle}>Choose what you want to save</Text>

                    {/* Options */}
                    <View style={styles.options}>

                        {/* Full Song */}
                        <TouchableOpacity
                            style={[styles.option, downloading === 'song' && styles.optionLoading]}
                            onPress={() => triggerDownload('song')}
                            activeOpacity={0.8}
                            disabled={!!downloading}
                        >
                            <View style={styles.optionIcon}>
                                <LinearGradient
                                    colors={['rgba(102,204,51,0.2)', 'rgba(4,126,201,0.15)']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                />
                                <MaterialIcons name="music-note" size={22} color="#66cc33" />
                            </View>
                            <View style={styles.optionInfo}>
                                <Text style={styles.optionTitle}>Full Song</Text>
                                <Text style={styles.optionSub}>Complete AI-generated track</Text>
                            </View>
                            {downloading === 'song' ? (
                                <View style={styles.progressWrap}>
                                    <ActivityIndicator size="small" color="#66cc33" />
                                    <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
                                </View>
                            ) : (
                                <MaterialIcons name="file-download" size={22} color="#66cc33" />
                            )}
                        </TouchableOpacity>

                        {/* Reel — only shown if a reel exists */}
                        {hasReel && (
                            <TouchableOpacity
                                style={[styles.option, downloading === 'reel' && styles.optionLoading]}
                                onPress={() => triggerDownload('reel')}
                                activeOpacity={0.8}
                                disabled={!!downloading}
                            >
                                <View style={styles.optionIcon}>
                                    <LinearGradient
                                        colors={['rgba(4,126,201,0.2)', 'rgba(102,204,51,0.15)']}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                    <MaterialIcons name="bolt" size={22} color="#047ec9" />
                                </View>
                                <View style={styles.optionInfo}>
                                    <Text style={styles.optionTitle}>Reel</Text>
                                    <Text style={styles.optionSub}>
                                        {song?.reelDuration ?? 30}s clip · {fmt(song?.reelStartTime ?? 0)} → {fmt((song?.reelStartTime ?? 0) + (song?.reelDuration ?? 30))}
                                    </Text>
                                </View>
                                {downloading === 'reel' ? (
                                    <View style={styles.progressWrap}>
                                        <ActivityIndicator size="small" color="#047ec9" />
                                        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
                                    </View>
                                ) : (
                                    <MaterialIcons name="file-download" size={22} color="#047ec9" />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default DownloadSheet;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#111827',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 12,
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    handle: {
        width: 36, height: 4, borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 20,
        letterSpacing: 0.3,
    },
    closeBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center', alignItems: 'center',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Oswald-Regular',
        fontSize: 13,
        marginBottom: 24,
    },
    options: {
        gap: 12,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    optionLoading: {
        opacity: 0.6,
    },
    optionIcon: {
        width: 48, height: 48, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden',
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 15,
        marginBottom: 3,
    },
    optionSub: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Oswald-Regular',
        fontSize: 12,
    },
    progressWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    progressText: {
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'Oswald-Regular',
        fontSize: 12,
    },
});
