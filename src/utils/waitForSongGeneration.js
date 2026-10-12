import { AppState } from 'react-native';
import { getSongById } from '../api/songsService';

const POLL_INTERVAL_MS = 3000;
const MAX_WAIT_MS = 15 * 60 * 1000;

// The server generates songs in the background, so this screen only has to *watch* the
// song. Polling survives a locked/sleeping phone: JS timers pause while suspended, and the
// moment the app is foregrounded again we check immediately instead of waiting for the
// next tick. Network errors while polling (e.g. radio still waking up) are retried, never
// treated as a generation failure.
export const waitForSongGeneration = (songId) =>
    new Promise((resolve, reject) => {
        const startedAt = Date.now();
        let timer = null;
        let done = false;
        let inFlight = false;

        const finish = (fn, value) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            sub.remove();
            fn(value);
        };

        const check = async () => {
            if (done || inFlight) return;
            inFlight = true;
            try {
                const res = await getSongById(songId);
                const song = res?.data ?? res;

                if (song?.generationStatus === 'failed') {
                    const err = new Error(song.generationError || 'Generation failed.');
                    err.isGenerationFailure = true;
                    return finish(reject, err);
                }
                if (song && song.generationStatus !== 'generating') {
                    return finish(resolve, song);
                }
                if (Date.now() - startedAt > MAX_WAIT_MS) {
                    return finish(reject, new Error('Generation is taking longer than expected. Check your library in a few minutes.'));
                }
            } catch (e) {
                // 401 means the session is gone: the axios interceptor already logged the user
                // out, so stop polling instead of looping forever.
                if (e?.response?.status === 401 || e?.response?.status === 404) {
                    return finish(reject, e);
                }
            } finally {
                inFlight = false;
            }
            timer = setTimeout(check, POLL_INTERVAL_MS);
        };

        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                clearTimeout(timer);
                check();
            }
        });

        check();
    });
