import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    background: { flex: 1 },
    container: { flex: 1 },

    // Tab bar
    tabBarWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
    tabBarContainer: {
        flex: 1, flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
        padding: 2, position: 'relative',
    },
    tabPill: {
        position: 'absolute', top: 2, bottom: 2,
        backgroundColor: '#fff', borderRadius: 28,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12, shadowRadius: 5, elevation: 3,
    },
    tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, zIndex: 1 },
    tabText: { fontSize: 13, fontFamily: 'Oswald-Bold', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
    tabTextActive: { color: '#1a1a2e' },

    // Tab content
    tabContent: { flex: 1 },
    tabContentInner: { paddingHorizontal: 16, paddingBottom: 100 },

    // Section labels
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 6 },
    sectionLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 14 },
    sectionLabelLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionIconWrap: { width: 24, height: 24, borderRadius: 7, backgroundColor: 'rgba(102,204,51,0.15)', justifyContent: 'center', alignItems: 'center' },
    sectionLabelText: { color: '#fff', fontSize: 14, fontFamily: 'Oswald-Bold', letterSpacing: 0.5 },
    hintBtn: { padding: 4 },
    instrumentalRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    instrumentalLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Oswald-Regular' },

    // Glass box
    glassBox: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', padding: 14, marginBottom: 4 },
    textArea: { color: '#fff', fontSize: 14, fontFamily: 'Oswald-Regular', textAlignVertical: 'top', minHeight: 70 },
    charCount: { color: 'rgba(255,255,255,0.35)', fontSize: 10, textAlign: 'right', marginTop: 6, fontFamily: 'Oswald-Regular' },

    // Style mode toggle
    styleModeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    styleModeBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingVertical: 10,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    },
    styleModeBtnActive:      { backgroundColor: 'rgba(102,204,51,0.12)', borderColor: 'rgba(102,204,51,0.4)' },
    styleModeVibeActive:     { backgroundColor: 'rgba(4,126,201,0.12)',  borderColor: 'rgba(4,126,201,0.4)'  },
    styleModeBtnText:        { color: 'rgba(255,255,255,0.45)', fontFamily: 'Oswald-Bold', fontSize: 12 },
    styleModeBtnTextActive:  { color: '#66cc33' },
    styleModeBtnTextVibe:    { color: '#047ec9' },

    // Genre tags
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    tag:       { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
    tagActive: { backgroundColor: '#66cc33', borderColor: '#66cc33', shadowColor: '#66cc33', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.45, shadowRadius: 6, elevation: 4 },
    tagText:       { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: 'Oswald-Bold' },
    tagTextActive: { color: '#fff' },

    // Vibe picker
    vibeLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16 },
    vibeLoadingText: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 13 },
    vibeEmptyBox: { alignItems: 'center', gap: 8, paddingVertical: 24, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)' },
    vibeEmptyText: { color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald-Regular', fontSize: 12, textAlign: 'center', paddingHorizontal: 20 },
    vibePickCard: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 8,
    },
    vibePickCardActive: { backgroundColor: 'rgba(4,126,201,0.12)', borderColor: 'rgba(4,126,201,0.4)' },
    vibePickDot: { width: 10, height: 10, borderRadius: 5 },
    vibePickName: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Oswald-Bold', fontSize: 14 },
    vibePickMeta: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 11, marginTop: 2 },

    // Lyrics AI mode
    aiLyricsSelected: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(102,204,51,0.1)', borderRadius: 10, padding: 10, marginBottom: 8 },
    aiLyricsSelectedText: { flex: 1, color: '#66cc33', fontFamily: 'Oswald-Bold', fontSize: 13 },
    aiLyricsClear: { padding: 4 },

    // AI button
    aiBtn: { marginTop: 10, alignSelf: 'flex-start', borderRadius: 20, overflow: 'hidden' },
    aiBtnGradient: { flexDirection: 'row', alignItems: 'center',  gap: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(102,204,51,0.35)' },
    aiBtnText: { color: '#66cc33', fontSize: 12, fontFamily: 'Oswald-Bold', letterSpacing: 0.5 , padding:10},

    // Gender
    genderRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    genderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    genderBtnActive: { backgroundColor: '#66cc33', borderColor: '#66cc33', shadowColor: '#66cc33', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 5 },
    genderBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'Oswald-Bold' },
    genderBtnTextActive: { color: '#fff' },

    // Cover tab
    coverHeaderCard: { marginBottom: 14, marginTop: 6, borderRadius: 16, overflow: 'hidden', },
    coverHeaderGrad: {paddingVertical:10, alignItems: 'center', gap: 8, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    coverHeaderTitle: { color: '#fff', fontSize: 18, fontFamily: 'Oswald-Bold', letterSpacing: 0.5, },
    coverHeaderSub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'Oswald-Regular', textAlign: 'center', marginBottom:20, marginHorizontal:20 },
    aiCoverNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 4 },
    aiCoverNoteText: { color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald-Regular', fontSize: 11, flex: 1 },
    uploadCoverBtn: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(4,126,201,0.3)', height: 180, position: 'relative' },
    uploadCoverPreview: { width: '100%', height: '100%' },
    uploadCoverEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
    uploadCoverEmptyText: { color: '#047ec9', fontFamily: 'Oswald-Bold', fontSize: 14 },
    uploadCoverEmptySub: { color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald-Regular', fontSize: 11 },
    uploadCoverChangeOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 8 },
    uploadCoverChangeText: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 12 },

    // Generate tab
    genHeroCard: { borderRadius: 18,  alignItems: 'center', gap: 8, marginBottom: 6, marginTop: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    genHeroTitle: { color: '#fff', fontSize: 20, fontFamily: 'Oswald-Bold', letterSpacing: 0.5 },
    genHeroSub: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 13, textAlign: 'center', marginBottom:20 },
    summaryCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16, marginBottom: 4 },
    summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    summaryIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: 'rgba(102,204,51,0.12)', justifyContent: 'center', alignItems: 'center' },
    summaryLabel: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 12, width: 80 },
    summaryValue: { flex: 1, color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 13 },
    summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 10 },

    // Create button
    createBtnWrap: { marginTop: 24, marginBottom: 20 },
    createBtn: { flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#66cc33', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10 },
    createBtnText: { color: '#fff', fontSize: 18, fontFamily: 'Oswald-Bold', letterSpacing: 2 },

    // Mood picker modal
    moodOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
    moodSheet: { backgroundColor: '#0d1117', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    moodHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
    moodHeaderTitle: { flex: 1, color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 18 },
    moodCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
    moodHeaderSub: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 12, marginBottom: 18 },
    moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    moodCard: { width: (width - 48 - 30) / 4, borderRadius: 14, overflow: 'hidden' },
    moodCardGrad: {  alignItems: 'center', gap: 6, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    moodEmoji: { fontSize: 22, marginTop:5 },
    moodLabel: { fontFamily: 'Oswald-Bold', fontSize: 10, letterSpacing: 0.5 , marginBottom:5},

    // Generating overlay
    genOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
    genOverlayInner: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16,  },
    genSpinWrap: { marginBottom: 8 },
    genSpinGrad: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', shadowColor: '#66cc33', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 12 },
    genTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 22, letterSpacing: 0.5 },
    genStep: { color: 'rgba(255,255,255,0.6)', fontFamily: 'Oswald-Regular', fontSize: 14, textAlign: 'center', lineHeight: 20 },
    genDots: { flexDirection: 'row', gap: 8, marginTop: 8 },
    genDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#66cc33' },
});
