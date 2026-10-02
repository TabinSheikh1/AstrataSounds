import TrackPlayer, { AppKilledPlaybackBehavior, Capability } from 'react-native-track-player';

export async function setupPlayer() {
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    // false = keep playing when the app is backgrounded (was killing playback
    // on background/minimize before).
    stopWithApp: false,
    android: {
      // Keep playing even if the user swipes the app away from recents.
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
      Capability.SeekTo,
      Capability.JumpForward,
      Capability.JumpBackward,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause],
    forwardJumpInterval: 10,
    backwardJumpInterval: 10,
  });
}
