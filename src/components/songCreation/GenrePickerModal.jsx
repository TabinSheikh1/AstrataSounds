import React, { useState, useMemo } from 'react';
import {
    Modal, View, Text, TouchableOpacity, TextInput, FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { CATEGORIES } from './constants';
import { styles } from './songCreationStyles';

const GenrePickerModal = ({ visible, selectedCategory, onSelect, onClose }) => {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return CATEGORIES;
        return CATEGORIES.filter((c) => c.label.toLowerCase().includes(q));
    }, [search]);

    const handleClose = () => {
        setSearch('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.genreOverlay}>
                <View style={styles.genreSheet}>
                    <View style={styles.moodHeader}>
                        <MaterialIcons name="queue-music" size={20} color="#66cc33" />
                        <Text style={styles.moodHeaderTitle}>Choose a Genre</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.moodCloseBtn}>
                            <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.genreSearchWrap}>
                        <MaterialIcons name="search" size={18} color="rgba(255,255,255,0.4)" />
                        <TextInput
                            style={styles.genreSearchInput}
                            placeholder="Search genres..."
                            placeholderTextColor="rgba(255,255,255,0.35)"
                            value={search}
                            onChangeText={setSearch}
                            autoCorrect={false}
                            autoCapitalize="none"
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <MaterialIcons name="close" size={16} color="rgba(255,255,255,0.4)" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.value}
                        keyboardShouldPersistTaps="handled"
                        style={styles.genreList}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={20}
                        ListEmptyComponent={
                            <Text style={styles.genreEmptyText}>No genres match "{search}"</Text>
                        }
                        renderItem={({ item }) => {
                            const isSel = selectedCategory === item.value;
                            return (
                                <TouchableOpacity
                                    style={[styles.genreRow, isSel && styles.genreRowActive]}
                                    onPress={() => { onSelect(item.value); handleClose(); }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.genreRowText, isSel && styles.genreRowTextActive]}>
                                        {item.label}
                                    </Text>
                                    {isSel && <MaterialIcons name="check" size={18} color="#66cc33" />}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default GenrePickerModal;
