const mockFetch = jest.fn();
const mockUnlink = jest.fn(() => Promise.resolve());
const mockOpen = jest.fn(() => Promise.resolve({}));
const mockIsDownloaded = jest.fn();

jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    fs: { dirs: { CacheDir: '/cache' }, unlink: (...a) => mockUnlink(...a) },
    config: () => ({ fetch: (...a) => mockFetch(...a) }),
  },
}));
jest.mock('react-native-share', () => ({ __esModule: true, default: { open: (...a) => mockOpen(...a) } }));
jest.mock('../src/store/store', () => ({ store: { getState: () => ({ auth: { accessToken: 'tok' } }) } }));
jest.mock('../src/config/api', () => ({ API_BASE_URL: 'https://api.test/api/v1' }));
jest.mock('../src/utils/downloadSong', () => ({
  getLocalDownloadPath: (id) => `/downloads/${id}.mp3`,
  isSongDownloaded: (...a) => mockIsDownloaded(...a),
}));

import { shareSongFile, buildShareMessage } from '../src/utils/shareSong';

beforeEach(() => {
  jest.clearAllMocks();
  mockIsDownloaded.mockResolvedValue(false);
  mockFetch.mockResolvedValue({ info: () => ({ status: 200 }) });
});

describe('shareSongFile', () => {
  it('fetches the song through the authenticated stream endpoint and shares it as an MP3', async () => {
    await shareSongFile({ id: 's1', title: 'My Song!' });

    expect(mockFetch).toHaveBeenCalledWith('GET', 'https://api.test/api/v1/songs/s1/stream', {
      Authorization: 'Bearer tok',
    });
    expect(mockOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'file:///cache/My-Song.mp3',
        type: 'audio/mpeg',
        filename: 'My-Song.mp3',
        message: 'Check out My Song!',
      }),
    );
  });

  it('removes its temporary cache copy afterwards', async () => {
    await shareSongFile({ id: 's1', title: 'T' });
    expect(mockUnlink).toHaveBeenCalledWith('/cache/T.mp3');
  });

  it('reuses an offline download and never deletes it', async () => {
    mockIsDownloaded.mockResolvedValue(true);
    await shareSongFile({ id: 's2', title: 'Offline' });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockOpen).toHaveBeenCalledWith(expect.objectContaining({ url: 'file:///downloads/s2.mp3' }));
    expect(mockUnlink).not.toHaveBeenCalled();
  });

  it('fails clearly (and cleans up) when the server refuses the download', async () => {
    mockFetch.mockResolvedValue({ info: () => ({ status: 403 }) });
    await expect(shareSongFile({ id: 's3', title: 'X' })).rejects.toThrow(/Could not prepare the song/);
    expect(mockOpen).not.toHaveBeenCalled();
    expect(mockUnlink).toHaveBeenCalledWith('/cache/X.mp3');
  });

  it('falls back to a generic name for an untitled song', async () => {
    await shareSongFile({ id: 's4', title: '' });
    expect(mockOpen).toHaveBeenCalledWith(expect.objectContaining({ filename: 'song.mp3' }));
    expect(buildShareMessage('')).toBe('Check out this song');
  });
});
