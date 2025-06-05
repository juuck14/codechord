import * as d3 from 'd3';

const COLOR_SCHEME = [
    '#FF5733', // Red
    '#33FF57', // Green
    '#3357FF', // Blue
    '#F1C40F', // Yellow
    '#8E44AD', // Purple
    '#E67E22', // Orange
    '#2ECC71', // Emerald
    '#3498DB', // Sky Blue
    '#9B59B6', // Amethyst
    '#F39C12', // Pumpkin
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
    DEFAULT: 0.4,
    SELECTED: 0.8,
    UNSELECTED: 0.1
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

    // type 처리
    if (chord.type === 5) {
        suffix = "";
    } else if (chord.type === 7) {
        suffix = "7";
    } else {
        // 기본 triad (스케일 기반 추정)
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
    }

    // suspension 처리
    if (chord.suspensions === 2) {
        suffix += "sus2";
    } else if (chord.suspensions === 4) {
        suffix += "sus4";
    }

    // adds 처리
    if (chord.adds === 9) {
        suffix += "add9";
    } else if (chord.adds === 11) {
        suffix += "add11";
    } else if (chord.adds === 13) {
        suffix += "add13";
    }

    return rootNote + suffix;
}


export {
    COLOR_SCHEME,
    ROMAN_NUMERALS,
    STROKE_DASHARRAYS,
    CHORD_TYPES,
    ANIMATION,
    isEmpty,
    OPACITY,
    isSelected,
    chordToString
}