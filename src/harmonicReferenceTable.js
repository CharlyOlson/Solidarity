// Professional Harmonic Reference Table for Solidarity Audio Platform

const harmonicReferenceTable = [
    {
        name: "Unison",
        ratio: 1.0,
        interval: "P1",
        description: "Fundamental frequency, no pitch change."
    },
    {
        name: "Minor Second",
        ratio: 16/15,
        interval: "m2",
        description: "Smallest melodic interval, dissonant."
    },
    {
        name: "Major Second",
        ratio: 9/8,
        interval: "M2",
        description: "Whole step, common melodic interval."
    },
    {
        name: "Minor Third",
        ratio: 6/5,
        interval: "m3",
        description: "Expressive, used in minor chords."
    },
    {
        name: "Major Third",
        ratio: 5/4,
        interval: "M3",
        description: "Bright, used in major chords."
    },
    {
        name: "Perfect Fourth",
        ratio: 4/3,
        interval: "P4",
        description: "Stable, consonant interval."
    },
    {
        name: "Tritone",
        ratio: 45/32,
        interval: "TT",
        description: "Dissonant, divides octave in half."
    },
    {
        name: "Perfect Fifth",
        ratio: 3/2,
        interval: "P5",
        description: "Strong, foundational harmonic interval."
    },
    {
        name: "Minor Sixth",
        ratio: 8/5,
        interval: "m6",
        description: "Mellow, used in minor harmony."
    },
    {
        name: "Major Sixth",
        ratio: 5/3,
        interval: "M6",
        description: "Warm, used in major harmony."
    },
    {
        name: "Minor Seventh",
        ratio: 9/5,
        interval: "m7",
        description: "Tense, used in dominant chords."
    },
    {
        name: "Major Seventh",
        ratio: 15/8,
        interval: "M7",
        description: "Leading tone, resolves to octave."
    },
    {
        name: "Octave",
        ratio: 2.0,
        interval: "P8",
        description: "Double frequency, strong consonance."
    }
];

// Utility: Get harmonic by interval name
function getHarmonicByInterval(interval) {
    return harmonicReferenceTable.find(h => h.interval === interval);
}

// Utility: Get all harmonic ratios
function getAllHarmonicRatios() {
    return harmonicReferenceTable.map(h => h.ratio);
}

// Utility: Get harmonic info by ratio (within tolerance)
function getHarmonicByRatio(ratio, tolerance = 0.01) {
    return harmonicReferenceTable.find(h => Math.abs(h.ratio - ratio) < tolerance);
}

module.exports = {
    harmonicReferenceTable,
    getHarmonicByInterval,
    getAllHarmonicRatios,
    getHarmonicByRatio
};
