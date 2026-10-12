// The recorder library hands back file URLs in platform-specific shapes:
//   Android: "file:////data/user/0/<app>/cache/sound.mp4"  (four slashes)
//   iOS:     "file:///var/.../Caches/sound.m4a"            (may be percent-encoded)
// Filesystem calls need a plain path; uploads/playback want a clean file:// URL.

export const toFsPath = (uri) => {
  let p = String(uri).replace(/^file:\/*/, '/');
  try { p = decodeURI(p); } catch (_) { /* not percent-encoded; use as is */ }
  return p;
};

export const toFileUri = (uri) => `file://${encodeURI(toFsPath(uri))}`;
