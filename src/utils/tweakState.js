// Everything the UI needs to know about tweaking a song, in one tested place.
// The server owns the rules (free-tweak limit, ownership, finalized) and sends the limit as
// `freeTweaksLimit`; the fallback only covers an older server response.

export const DEFAULT_FREE_TWEAK_LIMIT = 3;

export const getTweakState = (song, userId) => {
  const limit = song?.freeTweaksLimit ?? DEFAULT_FREE_TWEAK_LIMIT;
  const used = song?.freeTweaksUsed ?? 0;
  const left = Math.max(0, limit - used);

  // Hide the controls only when we positively know the song belongs to someone else. If the
  // song object carries no owner id we show them and let the server (which always checks)
  // decide, rather than hiding them from the real owner.
  const isOwner = !(song?.userId && userId && String(song.userId) !== String(userId));

  const isFinalized = !!song?.isFinalized;
  const busy = song?.generationStatus === 'generating';

  return {
    limit,
    used,
    left,
    isOwner,
    isFinalized,
    canTweak: isOwner && !isFinalized && left > 0 && !busy,
    canUndo: isOwner && !isFinalized && !!song?.canUndoTweak && !busy,
  };
};
