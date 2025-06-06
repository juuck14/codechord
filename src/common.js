import * as d3 from 'd3';

const COLOR_SCHEME = [
    "#0095FF",  // 파랑
    "#00E096",  // 민트
    "#EF4444",  // 빨강
    "#A700FF",  // 퍼플
    "#FFA500",  // 주황
    "#00C8FF",  // 밝은 블루
    "#FF69B4",  // 핑크
    "#8A2BE2",  // 블루바이올렛
    "#00FF7F",  // 스프링그린
    "#FFD700",  // 골드
];


const GRAY_COLOR_SCHEME = [
    "#EEEEEE",
    "#DDDDDD",
    "#CCCCCC",
    "#BBBBBB",
    "#9A9A9A",
]

const ROMAN_NUMERALS = [
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'
]

const STROKE_DASHARRAYS = {
    'Instrumental Intro': "",
    'Solo': "2,2",
    'Intro and Verse': "4,4",
    'Pre-Chorus': "6,3",
    'Pre-Outro': "8,4",
    'Outro 2': "10,5",
    'Intro and Chorus': "1,5",
    'Bridge': "2,6",
    'Chorus Lead-Out': "10,4,2,4",
    'Instrumental': "10,4,2,4,2,4",
    'Intro': "15,5",
    'Outro 1': "5,10",
    'Chorus': "3,7",
    'Solo 3': "8,2,2,2",
    'Outro': "12,3,3,3",
    'Pre-Chorus and Chorus': "6,2,2,2",
    'Solo 2': "7,3,2,3",
    'Solo 1': "9,3,1,3",
    'Verse': "5,3,2,3",
    'Verse and Pre-Chorus': "4,2,1,2"
};

const CHORD_TYPES = [5,7,9]

const isEmpty = element => {
    if (element === null || element === undefined) {
        return true;
    }
    if (typeof element === 'string' && element.trim() === '') {
        return true;
    }
    if (Array.isArray(element) && element.length === 0) {
        return true;
    }
    if (typeof element === 'object' && Object.keys(element).length === 0) {
        return true;
    }
    return false;
}

/* animation config */
const ANIMATION = {
    EASE: d3.easeCubicInOut,
    MAIN_DURATION: 1500,
    INOUT_DURATION: 500,
    HOVER_DURATION: 200 
}

/* opacity config */
const OPACITY = {
    DEFAULT: 0.5,
    SELECTED: 0.8,
    UNSELECTED: 0.05
}

const isSelected = (selectedItems, d) => {
    return selectedItems.some(item => item.id === d.id && item.section === d.section);
}

/* chord convert */
const getDiatonicScale = (tonic, scale) => {
    const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const SCALES = {
        "major": [0, 2, 4, 5, 7, 9, 11],
        "minor": [0, 2, 3, 5, 7, 8, 10],
        "harmonicMinor": [0, 2, 3, 5, 7, 8, 11],
        "melodicMinor": [0, 2, 3, 5, 7, 9, 11],
        "dorian": [0, 2, 3, 5, 7, 9, 10],
        "mixolydian": [0, 2, 4, 5, 7, 9, 10],
        "phrygian": [0, 1, 3, 5, 7, 8, 10],
        "lydian": [0, 2, 4, 6, 7, 9, 11],
        "locrian": [0, 1, 3, 5, 6, 8, 10]
    }


    const tonicIndex = NOTES_SHARP.indexOf(tonic);
    const intervals = SCALES[scale];
    const scaleNotes = intervals.map(i => NOTES_SHARP[(tonicIndex + i) % 12]);

    return scaleNotes;
}

const chordToString = (chord, key) => {
    if (isEmpty(chord) || chord.root < 1 || chord.root > 7) {
        return "X";
    }
    const degree = chord.root - 1;  // 1~7 → 0-based index
    const scaleNotes = getDiatonicScale(key.tonic, key.scale);
    const rootNote = scaleNotes[degree];

    let suffix = "";
    if (key.scale === 'minor') {
        if ([0, 3, 4].includes(degree)) {
            suffix = "m";
        } else {
            suffix = "";
        }
    } else {
        if ([1, 2, 5].includes(degree)) {
            suffix = "m";
        } else {
            suffix = "";
        }
    }

    // type 처리
    suffix += addVariants(chord);

    return rootNote + suffix;
}

/**
 * chord 객체로부터 full string을 생성하여 반환합니다.
 *
 * type 값(5, 7, 9, 11, 13):
 *   5  → 기본 triad (아무 문자열도 붙이지 않음)
 *   7  → "7"
 *   9  → "9"
 *   11 → "11"
 *   13 → "13"
 *
 * suspensions 값(2, 4, null):
 *   2 → "sus2"
 *   4 → "sus4"
 *   null → 추가 없음
 *
 * adds 값(4, 6, 9, null):
 *   4 → "add4"
 *   6 → "add6"
 *   9 → "add9"
 *   null → 추가 없음
 *
 * @param {Object} chord
 * @param {number|null} chord.type        - 코드 타입 (5, 7, 9, 11, 13)
 * @param {number|null} chord.adds        - adds 정보 (4, 6, 9 중 하나 또는 null)
 * @param {number|null} chord.suspensions - suspensions 정보 (2, 4 중 하나 또는 null)
 * @returns {string} full string (예: "7sus4add9", "sus4" 등)
 */
const addVariants = chord => {
  const { type, adds, suspensions } = chord;
  const variants = [];

  // 1) type 처리: 5는 기본 triad(아무 문자열 없이), 7/9/11/13은 해당 숫자 문자열로 추가
  if (type && type !== 5) {
    variants.push(String(type));
  }

  // 2) suspensions 처리: 2 또는 4인 경우 "sus" + 숫자 문자열로 추가
  if (suspensions === 2 || suspensions === 4) {
    variants.push(`sus${suspensions}`);
  }

  // 3) adds 처리: 4, 6, 9인 경우 "add" + 숫자 문자열로 추가
  if (adds === 4 || adds === 6 || adds === 9) {
    variants.push(`add${adds}`);
  }

  // 4) variants 배열을 이어붙여서 반환 (없으면 빈 문자열)
  return variants.join('');
}

/* parallel coordinate style*/
const PARALLEL_COORDINATE_STYLE = {
    MARGIN: { TOP: 16, RIGHT: 27, BOTTOM: 16, LEFT: 31 },
    X_LABEL_MARGIN: { TOP: 12 },
    TICK_SIZE: 10,
    TICK_PADDING: 8,
    WIDTH: 1234,
    HEIGHT: 397,
    GRAPH_HEIGHT: 361,
};

const COMPARE_STYLE = {
    WIDTH: 1325,
    Y_LABEL_WIDTH: 19,
    X_OFFSET_SIDE: 13,
    BAR_WIDTH: 98,
    BAR_GAP: 10,
    SPACING: 168,
    BAR_HEIGHT: 190,
    X_LABEL_TOP_HEIGHT: 40,
    X_LABEL_TOP_FONT_SIZE: 16,
    MARGIN: { TOP: 19, LEFT:3, BOTTOM: 9 },
    X_LABEL_BOTTOM_HEIGHT: 24,
    HEIGHT: function() {
        return this.X_LABEL_TOP_HEIGHT + this.MARGIN.TOP + this.BAR_HEIGHT + this.MARGIN.BOTTOM + this.X_LABEL_BOTTOM_HEIGHT;
    },
}

export {
    COLOR_SCHEME,
    GRAY_COLOR_SCHEME,
    ROMAN_NUMERALS,
    STROKE_DASHARRAYS,
    CHORD_TYPES,
    ANIMATION,
    isEmpty,
    OPACITY,
    isSelected,
    chordToString,
    addVariants,
    PARALLEL_COORDINATE_STYLE,
    COMPARE_STYLE
}