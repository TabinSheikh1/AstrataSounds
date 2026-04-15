// ── Category map: frontend label → backend enum value ───────
export const CATEGORIES = [
    // Pop / Urban
    { label: 'Pop',         value: 'Pop'         },
    { label: 'Hip-Hop',     value: 'Hip-Hop'     },
    { label: 'Rap',         value: 'Rap'         },
    { label: 'R&B',         value: 'R&B'         },
    { label: 'Trap',        value: 'Trap'        },
    { label: 'Drill',       value: 'Drill'       },
    { label: 'Disco',       value: 'Disco'       },
    // Rock / Alternative
    { label: 'Rock',        value: 'Rock'        },
    { label: 'Indie',       value: 'Indie'       },
    { label: 'Alternative', value: 'Alternative' },
    { label: 'Metal',       value: 'Metal'       },
    { label: 'Punk',        value: 'Punk'        },
    { label: 'Ska',         value: 'Ska'         },
    // Electronic
    { label: 'EDM',         value: 'EDM'         },
    { label: 'House',       value: 'House'       },
    { label: 'Techno',      value: 'Techno'      },
    { label: 'Trance',      value: 'Trance'      },
    { label: 'Dubstep',     value: 'Dubstep'     },
    { label: 'Synthwave',   value: 'Synthwave'   },
    // Chill / Atmospheric
    { label: 'Lo-Fi',       value: 'Lo-fi'       },
    { label: 'Ambient',     value: 'Ambient'     },
    { label: 'Chillout',    value: 'Chillout'    },
    // Classical / Acoustic
    { label: 'Classical',   value: 'Classical'   },
    { label: 'Orchestral',  value: 'Orchestral'  },
    { label: 'Piano',       value: 'Piano'       },
    { label: 'Acoustic',    value: 'Acoustic'    },
    { label: 'Cinematic',   value: 'Cinematic'   },
    // Jazz / Soul
    { label: 'Jazz',        value: 'Jazz'        },
    { label: 'Blues',       value: 'Blues'       },
    { label: 'Soul',        value: 'Soul'        },
    { label: 'Funk',        value: 'Funk'        },
    // World
    { label: 'Latin',       value: 'Latin'       },
    { label: 'Afrobeat',    value: 'Afrobeat'    },
    { label: 'Reggaeton',   value: 'Reggaeton'   },
    { label: 'Bollywood',   value: 'Bollywood'   },
    // Country / Folk / Gospel
    { label: 'Country',     value: 'Country'     },
    { label: 'Folk',        value: 'Folk'        },
    { label: 'Gospel',      value: 'Gospel'      },
];

export const TABS = ['Lyrics', 'Cover', 'Generate'];

export const MOODS = [
    // Positive / Upbeat
    { value: 'happy',        label: 'Happy',        emoji: '😊', color: '#FFD700' },
    { value: 'uplifting',    label: 'Uplifting',    emoji: '✨', color: '#ffd54f' },
    { value: 'excited',      label: 'Excited',      emoji: '🎉', color: '#ff6f00' },
    { value: 'playful',      label: 'Playful',      emoji: '🎈', color: '#ffee58' },
    { value: 'groovy',       label: 'Groovy',       emoji: '🎸', color: '#f48fb1' },
    // Calm / Peaceful
    { value: 'peaceful',     label: 'Peaceful',     emoji: '🍃', color: '#66cc33' },
    { value: 'calm',         label: 'Calm',         emoji: '🌊', color: '#29b6f6' },
    { value: 'relaxed',      label: 'Relaxed',      emoji: '😌', color: '#80cbc4' },
    { value: 'chill',        label: 'Chill',        emoji: '❄️', color: '#4dd0e1' },
    { value: 'dreamy',       label: 'Dreamy',       emoji: '💭', color: '#ce93d8' },
    // Romantic / Emotional
    { value: 'romantic',     label: 'Romantic',     emoji: '❤️', color: '#ff4d6d' },
    { value: 'love',         label: 'Love',         emoji: '💕', color: '#f06292' },
    { value: 'emotional',    label: 'Emotional',    emoji: '🥺', color: '#e91e63' },
    // Sad / Melancholic
    { value: 'sad',          label: 'Sad',          emoji: '😢', color: '#4fc3f7' },
    { value: 'melancholic',  label: 'Melancholic',  emoji: '🌧️', color: '#9575cd' },
    { value: 'nostalgic',    label: 'Nostalgic',    emoji: '🌅', color: '#ff7043' },
    // Motivational / Inspirational
    { value: 'motivational', label: 'Motivational', emoji: '💪', color: '#f57c00' },
    { value: 'inspirational',label: 'Inspirational',emoji: '🌟', color: '#ffca28' },
    { value: 'hopeful',      label: 'Hopeful',      emoji: '🌈', color: '#42a5f5' },
    { value: 'energetic',    label: 'Energetic',    emoji: '⚡', color: '#ff9800' },
    // Dark / Intense
    { value: 'dark',         label: 'Dark',         emoji: '🌑', color: '#546e7a' },
    { value: 'intense',      label: 'Intense',      emoji: '💥', color: '#c62828' },
    { value: 'dramatic',     label: 'Dramatic',     emoji: '🎭', color: '#7b1fa2' },
    { value: 'aggressive',   label: 'Aggressive',   emoji: '😤', color: '#b71c1c' },
    { value: 'rebellious',   label: 'Rebellious',   emoji: '🔥', color: '#e53935' },
    // Mysterious / Epic
    { value: 'mysterious',   label: 'Mysterious',   emoji: '🌙', color: '#4527a0' },
    { value: 'epic',         label: 'Epic',         emoji: '🏆', color: '#ff8f00' },
    { value: 'cinematic',    label: 'Cinematic',    emoji: '🎬', color: '#1565c0' },
    // Mindful / Spiritual
    { value: 'focused',      label: 'Focused',      emoji: '🎯', color: '#00897b' },
    { value: 'meditative',   label: 'Meditative',   emoji: '🧘', color: '#66bb6a' },
    { value: 'spiritual',    label: 'Spiritual',    emoji: '🕊️', color: '#b39ddb' },
];
