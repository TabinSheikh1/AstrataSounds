// Shares a song as an MP3 file plus a fixed message, identical for every target app.
//
// Uses the authenticated /stream endpoint rather than /download on purpose: sharing
// shouldn't spend the plan's monthly download allowance. The file is fetched into the
// cache directory (not the downloads folder), so it's temporary and OS-clearable.

import RNBlobUtil from 'react-native-blob-util';
import Share from 'react-native-share';
import { store } from '../store/store';
import { API_BASE_URL } from '../config/api';
import { getLocalDownloadPath, isSongDownloaded } from './downloadSong';

const slugify = (title) =>
  (title || 'song').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'song';

export const buildShareMessage = (title) => `Check out ${title || 'this song'}`;

export const shareSongFile = async (song) => {
  const accessToken = store.getState().auth?.accessToken;
  const title = song.title || 'this song';
  const filename = `${slugify(song.title)}.mp3`;

  // Reuse the offline copy if the user already downloaded it
  let filePath;
  if (await isSongDownloaded(song.id)) {
    filePath = getLocalDownloadPath(song.id);
  } else {
    filePath = `${RNBlobUtil.fs.dirs.CacheDir}/${filename}`;
    const res = await RNBlobUtil.config({ path: filePath, fileCache: true }).fetch(
      'GET',
      `${API_BASE_URL}/songs/${song.id}/stream`,
      { Authorization: `Bearer ${accessToken}` },
    );
    if (res.info().status >= 400) {
      await RNBlobUtil.fs.unlink(filePath).catch(() => {});
      throw new Error('Could not prepare the song for sharing. Please try again.');
    }
  }

  try {
    await Share.open({
      title,
      message: buildShareMessage(song.title),
      url: `file://${filePath}`,
      type: 'audio/mpeg',
      filename,
      failOnCancel: false,
    });
  } finally {
    // Only delete our temporary copy, never the user's offline download
    if (filePath.startsWith(RNBlobUtil.fs.dirs.CacheDir)) {
      RNBlobUtil.fs.unlink(filePath).catch(() => {});
    }
  }
};
