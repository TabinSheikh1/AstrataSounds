/**
 * The tweak sheet must start from the song's saved settings and send the tempo — the bug
 * was that a tweak "forgot" everything about the song. A tweak also updates the SAME song
 * (it watches that song id until its new version is ready); it never creates another one.
 */
import React from 'react';
import { Alert } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('../src/components/songCreation/GenrePickerModal', () => () => null);
jest.mock('../src/components/songCreation/MoodPickerModal', () => () => null);
jest.mock('../src/api/songsService', () => ({ tweakSongAudio: jest.fn() }));
jest.mock('../src/utils/waitForSongGeneration', () => ({ waitForSongGeneration: jest.fn() }));

import { tweakSongAudio } from '../src/api/songsService';
import { waitForSongGeneration } from '../src/utils/waitForSongGeneration';
import TweakSongModal from '../src/components/songCreation/TweakSongModal';

const savedSong = (o = {}) => ({
    id: 's1', userId: 'me', freeTweaksUsed: 1, freeTweaksLimit: 3, lyrics: 'la la la',
    generationSettings: { category: 'Pop', prompt: 'dreamy synths', mood: 'uplifting', language: 'spanish', songLength: 'short', tempoBpm: 105 },
    ...o,
});

let renderer, onClose, onTweaked;
const mount = async (song) => {
    onClose = jest.fn(); onTweaked = jest.fn();
    await act(async () => {
        renderer = ReactTestRenderer.create(<TweakSongModal visible onClose={onClose} song={song} onTweaked={onTweaked} />);
    });
};
const press = async (id) => {
    const node = renderer.root.findAll((n) => n.props.testID === id && typeof n.props.onPress === 'function')[0];
    if (!node) throw new Error(`no pressable "${id}"`);
    await act(async () => { await node.props.onPress(); });
    await act(async () => { await Promise.resolve(); });
};
const exists = (id) => renderer.root.findAll((n) => n.props.testID === id).length > 0;
const textOf = (id) => {
    const n = renderer.root.findAll((x) => x.props.testID === id && typeof x.type === 'string')[0];
    const flat = (c) => (Array.isArray(c) ? c.map(flat).join('') : typeof c === 'object' && c ? flat(c.children ?? c.props?.children) : String(c ?? ''));
    return flat(n.children);
};
const allText = () => {
    const out = [];
    renderer.root.findAll((n) => n.type === 'Text').forEach((n) => out.push([].concat(n.props.children).flat(5).filter((c) => typeof c === 'string' || typeof c === 'number').join('')));
    return out.join(' | ');
};

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    tweakSongAudio.mockResolvedValue({});
    waitForSongGeneration.mockResolvedValue({ id: 's1', freeTweaksUsed: 2 });
});
afterEach(async () => { await act(async () => { renderer?.unmount(); }); });

describe('starts from the song, not from scratch', () => {
    it('submitting without touching anything sends the song\'s own genre, style, mood, language AND tempo', async () => {
        await mount(savedSong());
        await press('tweak-submit');

        expect(Alert.alert).not.toHaveBeenCalled(); // genre was already filled in
        expect(tweakSongAudio).toHaveBeenCalledWith('s1', {
            category: 'Pop', language: 'spanish', mood: 'uplifting', tempoBpm: 105, prompt: 'dreamy synths',
            lyricsMode: 'manual', lyrics: 'la la la',
        });
    });

    it('shows the saved tempo and lets the user adjust it', async () => {
        await mount(savedSong());
        expect(textOf('tweak-bpm')).toMatch(/105/);
        await press('tweak-bpm-up');
        await press('tweak-bpm-up');
        await press('tweak-bpm-down');
        await press('tweak-submit');
        expect(tweakSongAudio.mock.calls[0][1].tempoBpm).toBe(110);
    });

    it('switching the tempo off sends null so the server clears it', async () => {
        await mount(savedSong());
        const sw = renderer.root.findAll((n) => n.props.testID === 'tweak-tempo-switch')[0];
        await act(async () => { sw.props.onValueChange(false); });
        await press('tweak-submit');
        expect(tweakSongAudio.mock.calls[0][1].tempoBpm).toBeNull();
        expect(exists('tweak-bpm')).toBe(false);
    });

    it('a song that never had a tempo starts with the tempo off', async () => {
        await mount(savedSong({ generationSettings: { category: 'Rock', prompt: 'x', language: 'english', songLength: 'full' } }));
        expect(exists('tweak-bpm')).toBe(false);
        await press('tweak-submit');
        expect(tweakSongAudio.mock.calls[0][1]).toMatchObject({ category: 'Rock', language: 'english', tempoBpm: null });
    });

    it('an older song with no saved settings still requires picking a genre', async () => {
        await mount(savedSong({ generationSettings: null }));
        await press('tweak-submit');
        expect(Alert.alert.mock.calls[0][0]).toBe('Genre required');
        expect(tweakSongAudio).not.toHaveBeenCalled();
    });
});

describe('limits come from the server', () => {
    it('shows remaining / limit using the server\'s limit', async () => {
        await mount(savedSong({ freeTweaksUsed: 1, freeTweaksLimit: 5 }));
        expect(allText()).toMatch(/4 of 5 free tweaks left/);
    });

    it('with none left it refuses to submit and explains, without calling the server', async () => {
        await mount(savedSong({ freeTweaksUsed: 3 }));
        expect(allText()).toMatch(/0 of 3 free tweaks left/);
        await press('tweak-submit');
        expect(Alert.alert.mock.calls[0][0]).toBe('No free tweaks left');
        expect(JSON.stringify(Alert.alert.mock.calls[0])).not.toMatch(/paid regeneration/i);
        expect(tweakSongAudio).not.toHaveBeenCalled();
    });
});

describe('keeps everything else the same', () => {
    it('leaves the style out when it is blank, so the saved style is not replaced by a placeholder', async () => {
        await mount(savedSong({ generationSettings: { category: 'Pop', prompt: null, mood: null, language: 'english', tempoBpm: null } }));
        await press('tweak-submit');
        const payload = tweakSongAudio.mock.calls[0][1];
        expect(payload).not.toHaveProperty('prompt');
        expect(payload).toMatchObject({ category: 'Pop', language: 'english', tempoBpm: null });
    });

    it('tweaks and watches the same song id, never another one', async () => {
        await mount(savedSong());
        await press('tweak-submit');
        expect(tweakSongAudio.mock.calls[0][0]).toBe('s1');
        expect(waitForSongGeneration).toHaveBeenCalledTimes(1);
        expect(waitForSongGeneration).toHaveBeenCalledWith('s1');
    });

    it('opens with the song\'s current lyrics so they carry over unless edited', async () => {
        await mount(savedSong({ lyrics: 'verse one\nchorus' }));
        await press('tweak-submit');
        expect(tweakSongAudio.mock.calls[0][1]).toMatchObject({ lyricsMode: 'manual', lyrics: 'verse one\nchorus' });
    });
});

describe('result handling', () => {
    it('hands the updated song back and closes on success', async () => {
        await mount(savedSong());
        await press('tweak-submit');
        expect(waitForSongGeneration).toHaveBeenCalledWith('s1');
        expect(onTweaked).toHaveBeenCalledWith({ id: 's1', freeTweaksUsed: 2 });
        expect(onClose).toHaveBeenCalled();
    });

    it('shows the failure and stays open so the user can retry', async () => {
        tweakSongAudio.mockRejectedValue({ response: { status: 403, data: { message: 'Your subscription is not active.' } } });
        await mount(savedSong());
        await press('tweak-submit');
        expect(Alert.alert.mock.calls[0][0]).toBe('Tweak Failed');
        expect(JSON.stringify(Alert.alert.mock.calls[0])).toMatch(/subscription is not active/);
        expect(onClose).not.toHaveBeenCalled();
        expect(onTweaked).not.toHaveBeenCalled();
    });
});
