import { getTweakState, DEFAULT_FREE_TWEAK_LIMIT } from '../src/utils/tweakState';

describe('getTweakState', () => {
    const song = (o = {}) => ({ id: 's1', userId: 'me', freeTweaksUsed: 0, freeTweaksLimit: 3, ...o });

    it('counts remaining tweaks from the limit the SERVER sent', () => {
        expect(getTweakState(song({ freeTweaksUsed: 1, freeTweaksLimit: 5 }), 'me')).toMatchObject({ limit: 5, used: 1, left: 4, canTweak: true });
    });

    it('falls back to the default limit only for an older server response', () => {
        expect(getTweakState({ id: 's1', userId: 'me', freeTweaksUsed: 1 }, 'me')).toMatchObject({ limit: DEFAULT_FREE_TWEAK_LIMIT, left: 2 });
    });

    it('cannot tweak once the free tweaks are used up (and never goes negative)', () => {
        expect(getTweakState(song({ freeTweaksUsed: 3 }), 'me')).toMatchObject({ left: 0, canTweak: false });
        expect(getTweakState(song({ freeTweaksUsed: 9 }), 'me').left).toBe(0);
    });

    it('hides controls when the song is positively someone else\'s', () => {
        expect(getTweakState(song({ userId: 'other' }), 'me')).toMatchObject({ isOwner: false, canTweak: false, canUndo: false });
    });

    it('keeps controls for the owner when the song carries no owner id (the server still checks)', () => {
        expect(getTweakState({ id: 's1', freeTweaksUsed: 0 }, 'me').isOwner).toBe(true);
        expect(getTweakState(song(), undefined).isOwner).toBe(true);
    });

    it('compares ids as strings', () => {
        expect(getTweakState(song({ userId: 42 }), '42').isOwner).toBe(true);
    });

    it('no tweaking or undo once finalized, or while a generation is running', () => {
        expect(getTweakState(song({ isFinalized: true, canUndoTweak: true }), 'me')).toMatchObject({ canTweak: false, canUndo: false, isFinalized: true });
        expect(getTweakState(song({ generationStatus: 'generating', canUndoTweak: true }), 'me')).toMatchObject({ canTweak: false, canUndo: false });
    });

    it('undo is available only when the server says there is a previous version', () => {
        expect(getTweakState(song({ canUndoTweak: true }), 'me').canUndo).toBe(true);
        expect(getTweakState(song({ canUndoTweak: false }), 'me').canUndo).toBe(false);
        expect(getTweakState(song(), 'me').canUndo).toBe(false);
    });
});
