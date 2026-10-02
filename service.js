// Background playback service — registered in index.js via
// TrackPlayer.registerPlaybackService(() => require('./service')).
// This keeps running while the app is backgrounded/killed on Android (as a
// foreground service) and handles lock-screen / notification / headset controls
// on both platforms. Without this registered, TrackPlayer has nothing driving
// playback once the app leaves the foreground.
import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function () {
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());

    TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => {
        TrackPlayer.seekTo(position);
    });

    TrackPlayer.addEventListener(Event.RemoteJumpForward, async ({ interval }) => {
        const position = await TrackPlayer.getPosition();
        TrackPlayer.seekTo(position + interval);
    });

    TrackPlayer.addEventListener(Event.RemoteJumpBackward, async ({ interval }) => {
        const position = await TrackPlayer.getPosition();
        TrackPlayer.seekTo(Math.max(0, position - interval));
    });

    // A phone call or another app's audio interrupted playback — pause, and
    // resume automatically once the interruption clears (permanent:false).
    TrackPlayer.addEventListener(Event.RemoteDuck, async ({ paused, permanent }) => {
        if (permanent) {
            TrackPlayer.pause();
            return;
        }
        if (paused) {
            TrackPlayer.pause();
        } else {
            TrackPlayer.play();
        }
    });
};
