// ── Saves a song/reel's audio into the app's own private storage so it plays
// back offline. This is NOT exported to the device's public Files/Downloads —
// keeping it inside the app sandbox is what makes the subscription's monthly
// download limit meaningful (a plain public file URL could be shared/re-downloaded
// endlessly by anyone who has it).

import RNBlobUtil from 'react-native-blob-util';
import { store } from '../store/store';
import { API_BASE_URL } from '../config/api';

const DOWNLOAD_DIR = `${RNBlobUtil.fs.dirs.DocumentDir}/astrata-downloads`;

export const getLocalDownloadPath = (songId, kind = 'audio') =>
  `${DOWNLOAD_DIR}/${songId}-${kind}.mp3`;

export const isSongDownloaded = (songId, kind = 'audio') =>
  RNBlobUtil.fs.exists(getLocalDownloadPath(songId, kind));

// kind: 'audio' | 'reel'. onProgress receives a 0–1 fraction.
export const downloadSongToDevice = async (songId, kind = 'audio', onProgress) => {
  const accessToken = store.getState().auth?.accessToken;
  const endpoint = kind === 'reel' ? 'download-reel' : 'download';
  const localPath = getLocalDownloadPath(songId, kind);

  await RNBlobUtil.fs.mkdir(DOWNLOAD_DIR).catch(() => {}); // already exists is fine

  const res = await RNBlobUtil.config({ path: localPath })
    .fetch('GET', `${API_BASE_URL}/songs/${songId}/${endpoint}`, {
      Authorization: `Bearer ${accessToken}`,
    })
    .progress((received, total) => {
      if (total > 0) onProgress?.(Number(received) / Number(total));
    });

  const { status } = res.info();
  if (status >= 400) {
    const bodyText = await res.text().catch(() => null);
    await RNBlobUtil.fs.unlink(localPath).catch(() => {});

    let message = 'Download failed. Please try again.';
    try {
      const parsed = JSON.parse(bodyText);
      if (typeof parsed?.message === 'string') message = parsed.message;
    } catch {
      // leave the generic message in place
    }
    const err = new Error(message);
    err.userMessage = message;
    throw err;
  }

  return res.path();
};
