/**
 * Behaviour tests for the voice-recording sheet: every path the user (or the OS) can
 * throw at it. Native modules and the API are mocked; the component's real state machine,
 * timers and cleanup logic run.
 */
import React from 'react';
import { Alert, AppState, Linking, PermissionsAndroid, Platform } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

const mockRecorders = [];
jest.mock('react-native-audio-recorder-player', () =>
    jest.fn().mockImplementation(() => {
        const rec = {
            startRecorder: jest.fn().mockResolvedValue('file:///cache/sound.m4a'),
            stopRecorder: jest.fn().mockResolvedValue('file:///cache/sound.m4a'),
            startPlayer: jest.fn().mockResolvedValue('ok'),
            stopPlayer: jest.fn().mockResolvedValue('ok'),
            addPlayBackListener: jest.fn(),
            removePlayBackListener: jest.fn(),
            removeRecordBackListener: jest.fn(),
        };
        mockRecorders.push(rec);
        return rec;
    }),
);
jest.mock('react-native-blob-util', () => ({
    __esModule: true,
    default: { fs: { unlink: jest.fn().mockResolvedValue(), stat: jest.fn().mockResolvedValue({ size: 50000 }) } },
}));
jest.mock('react-native-track-player', () => ({ __esModule: true, default: { pause: jest.fn().mockResolvedValue() } }));
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('../src/api/songsService', () => ({ transcribeVoice: jest.fn() }));

import RNBlobUtil from 'react-native-blob-util';
import TrackPlayer from 'react-native-track-player';
import { transcribeVoice } from '../src/api/songsService';
import VoiceRecorderModal from '../src/components/songCreation/VoiceRecorderModal';

const flush = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve(); }); };

let renderer;
let onClose;
let onUse;
let appStateHandler;

const mount = async (props = {}) => {
    onClose = jest.fn();
    onUse = jest.fn();
    await act(async () => {
        renderer = ReactTestRenderer.create(
            <VoiceRecorderModal visible onClose={onClose} onUse={onUse} language="english" {...props} />,
        );
    });
};

const find = (id) => renderer.root.findAll((n) => n.props.testID === id && typeof n.props.onPress === 'function')[0];
const press = async (id) => {
    const node = find(id);
    if (!node) throw new Error(`no pressable "${id}" in current phase`);
    await act(async () => { await node.props.onPress(); });
    await flush();
};
const exists = (id) => renderer.root.findAll((n) => n.props.testID === id).length > 0;
const text = (id) => {
    const n = renderer.root.findAll((x) => x.props.testID === id && typeof x.type === 'string')[0];
    const flat = (c) => (Array.isArray(c) ? c.map(flat).join('') : typeof c === 'object' && c ? flat(c.children ?? c.props?.children) : String(c ?? ''));
    return flat(n.children);
};
const advance = async (ms) => { await act(async () => { jest.advanceTimersByTime(ms); }); };
const lastRecorder = () => mockRecorders[mockRecorders.length - 1];

const record = async (seconds = 5) => {
    await press('voice-start');
    await advance(seconds * 1000);
    await press('voice-stop');
};

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-08T12:00:00Z'));
    jest.clearAllMocks();
    mockRecorders.length = 0;
    Platform.OS = 'ios';
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    appStateHandler = null;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_evt, handler) => {
        appStateHandler = handler;
        return { remove: jest.fn() };
    });
    transcribeVoice.mockResolvedValue({ text: 'I walk alone tonight', suggestedBpm: 105, language: 'english' });
});

afterEach(async () => {
    await act(async () => { renderer?.unmount(); });
    jest.useRealTimers();
});

describe('happy path', () => {
    it('records, gets lyrics, lets the user review, and hands lyrics + tempo + language back', async () => {
        await mount();
        await record(5);
        expect(text('voice-timer')).toMatch(/^0:05/);

        await press('voice-get-lyrics');
        expect(transcribeVoice).toHaveBeenCalledTimes(1);
        const [path, lang, signal] = transcribeVoice.mock.calls[0];
        expect(path).toBe('file:///cache/sound.m4a');
        expect(lang).toBe('english');
        expect(signal).toBeDefined();

        expect(text('voice-bpm')).toMatch(/105/);
        expect(RNBlobUtil.fs.unlink).toHaveBeenCalled(); // recording deleted once we have the text

        await press('voice-use');
        expect(onUse).toHaveBeenCalledWith({ lyrics: 'I walk alone tonight', tempoBpm: 105, language: 'english' });
        expect(onClose).toHaveBeenCalled();
    });

    it('lets the user edit the lyrics and the tempo before using them', async () => {
        await mount();
        await record();
        await press('voice-get-lyrics');

        await act(async () => { renderer.root.findAll((n) => n.props.testID === 'voice-lyrics-input')[0].props.onChangeText('My heart is on fire'); });
        await press('voice-bpm-up');
        await press('voice-bpm-up');
        await press('voice-bpm-down');
        await press('voice-use');

        expect(onUse).toHaveBeenCalledWith({ lyrics: 'My heart is on fire', tempoBpm: 110, language: 'english' });
    });

    it('sends tempoBpm null when the user switches the tempo off', async () => {
        await mount();
        await record();
        await press('voice-get-lyrics');
        await act(async () => { renderer.root.findAll((n) => n.props.testID === 'voice-tempo-switch')[0].props.onValueChange(false); });
        await press('voice-use');
        expect(onUse.mock.calls[0][0].tempoBpm).toBeNull();
    });

    it('uses the spoken language the user picked (not just the song language)', async () => {
        await mount({ language: 'english' });
        await press('voice-lang-spanish');
        await record();
        await press('voice-get-lyrics');
        expect(transcribeVoice.mock.calls[0][1]).toBe('spanish');
        await press('voice-use');
        expect(onUse.mock.calls[0][0].language).toBe('spanish');
    });

    it('pauses any playing music before recording', async () => {
        await mount();
        await press('voice-start');
        expect(TrackPlayer.pause).toHaveBeenCalled();
    });

    it('clamps an out-of-range suggested tempo', async () => {
        transcribeVoice.mockResolvedValue({ text: 'fast words', suggestedBpm: 999 });
        await mount();
        await record();
        await press('voice-get-lyrics');
        expect(text('voice-bpm')).toMatch(/220/);
    });
});

describe('starting the recorder', () => {
    it('treats the library\'s "Already recording" string as a failure, not a recording', async () => {
        await mount();
        // First instance is created inside startRecording; make every new instance misbehave once
        const AudioRecorderPlayer = require('react-native-audio-recorder-player');
        AudioRecorderPlayer.mockImplementationOnce(() => {
            const rec = {
                startRecorder: jest.fn().mockResolvedValue('Already recording'),
                stopRecorder: jest.fn().mockResolvedValue('Already stopped'),
                removeRecordBackListener: jest.fn(), removePlayBackListener: jest.fn(), stopPlayer: jest.fn().mockResolvedValue(),
            };
            mockRecorders.push(rec);
            return rec;
        });
        await press('voice-start');
        expect(Alert.alert).toHaveBeenCalled();
        expect(exists('voice-start')).toBe(true); // back to idle, can retry
        expect(exists('voice-stop')).toBe(false);
    });

    it('recovers after a failed start: the retry uses a brand-new recorder instance', async () => {
        await mount();
        const AudioRecorderPlayer = require('react-native-audio-recorder-player');
        AudioRecorderPlayer.mockImplementationOnce(() => {
            const rec = {
                startRecorder: jest.fn().mockRejectedValue(new Error('mic busy')),
                stopRecorder: jest.fn().mockResolvedValue(),
                removeRecordBackListener: jest.fn(), removePlayBackListener: jest.fn(), stopPlayer: jest.fn().mockResolvedValue(),
            };
            mockRecorders.push(rec);
            return rec;
        });
        await press('voice-start');
        expect(Alert.alert).toHaveBeenCalledTimes(1);

        await press('voice-start');
        expect(mockRecorders.length).toBe(2);
        expect(mockRecorders[1].startRecorder).toHaveBeenCalled();
        expect(exists('voice-stop')).toBe(true);
    });

    it('iOS: a denied microphone offers a shortcut to Settings', async () => {
        await mount();
        const AudioRecorderPlayer = require('react-native-audio-recorder-player');
        AudioRecorderPlayer.mockImplementationOnce(() => {
            const rec = {
                startRecorder: jest.fn().mockRejectedValue(new Error('denied')),
                stopRecorder: jest.fn().mockResolvedValue(),
                removeRecordBackListener: jest.fn(), removePlayBackListener: jest.fn(), stopPlayer: jest.fn().mockResolvedValue(),
            };
            mockRecorders.push(rec);
            return rec;
        });
        await press('voice-start');
        const buttons = Alert.alert.mock.calls[0][2];
        expect(buttons.map((b) => b.text)).toContain('Open Settings');
        buttons.find((b) => b.text === 'Open Settings').onPress();
        expect(Linking.openSettings).toHaveBeenCalled();
    });

    it('Android: denied permission never touches the recorder', async () => {
        Platform.OS = 'android';
        jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);
        await mount();
        await press('voice-start');
        expect(mockRecorders.length).toBe(0);
        expect(exists('voice-start')).toBe(true);
    });

    it('Android: "never ask again" explains how to turn the microphone on in Settings', async () => {
        Platform.OS = 'android';
        jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN);
        await mount();
        await press('voice-start');
        expect(Alert.alert.mock.calls[0][2].map((b) => b.text)).toContain('Open Settings');
        expect(mockRecorders.length).toBe(0);
    });

    it('Android: granted permission records normally', async () => {
        Platform.OS = 'android';
        jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
        await mount();
        await press('voice-start');
        expect(exists('voice-stop')).toBe(true);
    });

    it('a double tap on the mic starts only one recording', async () => {
        await mount();
        await act(async () => {
            const start = find('voice-start').props.onPress;
            start(); start();
        });
        await flush();
        expect(mockRecorders.length).toBe(1);
        expect(mockRecorders[0].startRecorder).toHaveBeenCalledTimes(1);
    });
});

describe('while recording', () => {
    it('shows time from the wall clock even if the native module never sends progress events', async () => {
        await mount();
        await press('voice-start');
        await advance(7000);
        expect(text('voice-timer')).toMatch(/^0:07/);
    });

    it('stops by itself at the 90 second limit and keeps the recording, with a notice', async () => {
        await mount();
        await press('voice-start');
        await advance(91000);
        await flush();
        expect(lastRecorder().stopRecorder).toHaveBeenCalled();
        expect(exists('voice-get-lyrics')).toBe(true);
        expect(text('voice-notice')).toMatch(/90 seconds/);
        expect(text('voice-timer')).toMatch(/^1:30/);
    });

    it('rejects a recording shorter than 2 seconds and deletes it', async () => {
        await mount();
        await record(1);
        expect(Alert.alert.mock.calls[0][0]).toBe('Too short');
        expect(exists('voice-start')).toBe(true);
        expect(RNBlobUtil.fs.unlink).toHaveBeenCalled();
    });

    it('going to the background ends the recording cleanly and keeps what was captured', async () => {
        await mount();
        await press('voice-start');
        await advance(6000);
        await act(async () => { appStateHandler('background'); });
        await flush();
        expect(lastRecorder().stopRecorder).toHaveBeenCalled();
        expect(exists('voice-get-lyrics')).toBe(true);
        expect(text('voice-notice')).toMatch(/background/);
    });

    it('does NOT stop when iOS reports "inactive" (that is just the permission prompt)', async () => {
        await mount();
        await press('voice-start');
        await advance(3000);
        await act(async () => { appStateHandler('inactive'); });
        await flush();
        expect(exists('voice-stop')).toBe(true);
    });

    it('closing the sheet mid-recording releases the mic and deletes the file', async () => {
        await mount();
        await press('voice-start');
        await advance(4000);
        await act(async () => {
            renderer.update(<VoiceRecorderModal visible={false} onClose={onClose} onUse={onUse} language="english" />);
        });
        await flush();
        expect(lastRecorder().stopRecorder).toHaveBeenCalled();
        expect(RNBlobUtil.fs.unlink).toHaveBeenCalled();
    });

    it('unmounting mid-recording also releases the mic', async () => {
        await mount();
        await press('voice-start');
        await act(async () => { renderer.unmount(); });
        expect(lastRecorder().stopRecorder).toHaveBeenCalled();
        renderer = { unmount: () => {} };
    });
});

describe('getting the lyrics', () => {
    it('keeps the recording and allows a retry when the upload fails', async () => {
        transcribeVoice.mockRejectedValueOnce(Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' }));
        await mount();
        await record();
        await press('voice-get-lyrics');

        expect(Alert.alert).toHaveBeenCalled();
        expect(exists('voice-get-lyrics')).toBe(true); // back to "recorded"
        expect(RNBlobUtil.fs.unlink).not.toHaveBeenCalled(); // nothing deleted before success

        await press('voice-get-lyrics'); // retry succeeds (default mock)
        expect(transcribeVoice).toHaveBeenCalledTimes(2);
        expect(transcribeVoice.mock.calls[1][0]).toBe(transcribeVoice.mock.calls[0][0]);
        expect(exists('voice-use')).toBe(true);
    });

    it('shows the server\'s message (e.g. "couldn\'t hear any words") and lets the user re-record', async () => {
        transcribeVoice.mockRejectedValueOnce({
            isAxiosError: true,
            response: { status: 400, data: { message: "We couldn't hear any words in that recording." } },
        });
        await mount();
        await record();
        await press('voice-get-lyrics');
        expect(JSON.stringify(Alert.alert.mock.calls[0])).toMatch(/couldn't hear any words/);
        await press('voice-rerecord');
        expect(exists('voice-start')).toBe(true);
    });

    it('cancel aborts the upload, returns to the recording, and shows no error', async () => {
        let abortSignal;
        transcribeVoice.mockImplementationOnce((_p, _l, signal) => new Promise((_res, rej) => {
            abortSignal = signal;
            signal.addEventListener('abort', () => rej(Object.assign(new Error('canceled'), { code: 'ERR_CANCELED' })));
        }));
        await mount();
        await record();
        await act(async () => { find('voice-get-lyrics').props.onPress(); });
        await flush();
        expect(exists('voice-cancel')).toBe(true);

        await press('voice-cancel');
        expect(abortSignal.aborted).toBe(true);
        expect(Alert.alert).not.toHaveBeenCalled();
        expect(exists('voice-get-lyrics')).toBe(true);
    });

    it('cannot be closed mid-upload with the X button', async () => {
        transcribeVoice.mockImplementationOnce(() => new Promise(() => {}));
        await mount();
        await record();
        await act(async () => { find('voice-get-lyrics').props.onPress(); });
        await flush();
        const closeBtn = renderer.root.findAll((n) => n.props.testID === 'voice-close' && typeof n.props.onPress === 'function')[0];
        await act(async () => { closeBtn.props.onPress(); });
        expect(onClose).not.toHaveBeenCalled();
    });

    it('a slow result from a CLOSED session never leaks into a reopened sheet', async () => {
        let resolveUpload;
        transcribeVoice.mockImplementationOnce(() => new Promise((res) => { resolveUpload = res; }));
        await mount();
        await record();
        await act(async () => { find('voice-get-lyrics').props.onPress(); });
        await flush();

        // close, then reopen: this is now a brand-new session
        await act(async () => {
            renderer.update(<VoiceRecorderModal visible={false} onClose={onClose} onUse={onUse} language="english" />);
        });
        await act(async () => {
            renderer.update(<VoiceRecorderModal visible onClose={onClose} onUse={onUse} language="english" />);
        });
        expect(exists('voice-start')).toBe(true);

        // the OLD upload finally answers while the new sheet is open
        await act(async () => { resolveUpload({ text: 'late words from the old session', suggestedBpm: 90 }); });
        await flush();

        expect(exists('voice-start')).toBe(true); // still the fresh idle sheet
        expect(exists('voice-lyrics-input')).toBe(false); // old lyrics did not appear
        expect(onUse).not.toHaveBeenCalled();
    });

    it('refuses to upload an empty file (mic captured nothing)', async () => {
        RNBlobUtil.fs.stat.mockResolvedValueOnce({ size: 0 });
        await mount();
        await record();
        await press('voice-get-lyrics');
        expect(transcribeVoice).not.toHaveBeenCalled();
        expect(Alert.alert.mock.calls[0][0]).toBe('Nothing was recorded');
        expect(exists('voice-get-lyrics')).toBe(true);
    });

    it('handles the recording file having disappeared', async () => {
        RNBlobUtil.fs.stat.mockRejectedValueOnce(new Error('ENOENT'));
        await mount();
        await record();
        await press('voice-get-lyrics');
        expect(transcribeVoice).not.toHaveBeenCalled();
        expect(Alert.alert.mock.calls[0][0]).toBe('Recording missing');
        expect(exists('voice-start')).toBe(true);
    });

    it('does not let the user use empty lyrics', async () => {
        await mount();
        await record();
        await press('voice-get-lyrics');
        await act(async () => { renderer.root.findAll((n) => n.props.testID === 'voice-lyrics-input')[0].props.onChangeText('   '); });
        await press('voice-use');
        expect(onUse).not.toHaveBeenCalled();
        expect(Alert.alert.mock.calls[0][0]).toBe('No lyrics');
    });
});

describe('platform file paths', () => {
    const recordWithPath = async (uri) => {
        const AudioRecorderPlayer = require('react-native-audio-recorder-player');
        AudioRecorderPlayer.mockImplementationOnce(() => {
            const rec = {
                startRecorder: jest.fn().mockResolvedValue(uri),
                stopRecorder: jest.fn().mockResolvedValue(uri),
                startPlayer: jest.fn().mockResolvedValue('ok'),
                stopPlayer: jest.fn().mockResolvedValue('ok'),
                addPlayBackListener: jest.fn(), removePlayBackListener: jest.fn(), removeRecordBackListener: jest.fn(),
            };
            mockRecorders.push(rec);
            return rec;
        });
        await mount();
        await record();
    };

    it('Android\'s four-slash file URL is cleaned up for upload, stat and delete', async () => {
        await recordWithPath('file:////data/user/0/com.stratasounds/cache/sound.mp4');
        await press('voice-get-lyrics');
        expect(RNBlobUtil.fs.stat).toHaveBeenCalledWith('/data/user/0/com.stratasounds/cache/sound.mp4');
        expect(transcribeVoice.mock.calls[0][0]).toBe('file:///data/user/0/com.stratasounds/cache/sound.mp4');
        expect(RNBlobUtil.fs.unlink).toHaveBeenCalledWith('/data/user/0/com.stratasounds/cache/sound.mp4');
    });

    it('iOS percent-encoded paths (spaces) are decoded for the filesystem and re-encoded for upload', async () => {
        await recordWithPath('file:///var/mobile/My%20App/Caches/sound.m4a');
        await press('voice-get-lyrics');
        expect(RNBlobUtil.fs.stat).toHaveBeenCalledWith('/var/mobile/My App/Caches/sound.m4a');
        expect(transcribeVoice.mock.calls[0][0]).toBe('file:///var/mobile/My%20App/Caches/sound.m4a');
    });

    it('playback gets the cleaned URL on Android too', async () => {
        await recordWithPath('file:////data/user/0/com.stratasounds/cache/sound.mp4');
        await press('voice-play');
        expect(lastRecorder().startPlayer).toHaveBeenCalledWith('file:///data/user/0/com.stratasounds/cache/sound.mp4');
    });
});

describe('re-recording and playback', () => {
    it('re-record discards the old file and starts fresh with a new recorder', async () => {
        await mount();
        await record();
        await press('voice-rerecord');
        expect(RNBlobUtil.fs.unlink).toHaveBeenCalled();
        expect(exists('voice-start')).toBe(true);
        await record(3);
        expect(mockRecorders.length).toBe(2);
        expect(text('voice-timer')).toMatch(/^0:03/);
    });

    it('listen plays the recording; a playback failure is reported but not fatal', async () => {
        await mount();
        await record();
        await press('voice-play');
        expect(lastRecorder().startPlayer).toHaveBeenCalledWith('file:///cache/sound.m4a');

        await press('voice-play'); // stop
        lastRecorder().startPlayer.mockRejectedValueOnce(new Error('no audio'));
        await press('voice-play');
        expect(Alert.alert).toHaveBeenCalled();
        expect(exists('voice-get-lyrics')).toBe(true);
    });
});
