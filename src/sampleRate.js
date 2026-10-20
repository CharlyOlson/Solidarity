const DEFAULT_SAMPLE_RATE_HZ = 44100;
const MIN_SAMPLE_RATE_HZ = 8000;
const MAX_SAMPLE_RATE_HZ = 192000;

function validateSampleRateHz(value, name = 'sample_rate_hz') {
    if (typeof value !== 'number' || !Number.isSafeInteger(value)
        || value < MIN_SAMPLE_RATE_HZ || value > MAX_SAMPLE_RATE_HZ) {
        throw new TypeError(
            `${name} must be an integer between ${MIN_SAMPLE_RATE_HZ} and ${MAX_SAMPLE_RATE_HZ} Hz`
        );
    }
    return value;
}

function resolveSampleRateHz(config = {}) {
    const supplied = [];
    for (const name of ['sample_rate_hz', 'sampleRate']) {
        if (Object.prototype.hasOwnProperty.call(config, name)) {
            supplied.push([name, validateSampleRateHz(config[name], name)]);
        }
    }

    const environmentValues = [
        ['AUDIO_SAMPLE_RATE', process.env.AUDIO_SAMPLE_RATE],
        ['SOLIDARITY_SAMPLE_RATE_HZ', process.env.SOLIDARITY_SAMPLE_RATE_HZ],
        ['env.AUDIO_SAMPLE_RATE', config.env && config.env.AUDIO_SAMPLE_RATE],
        ['env.SOLIDARITY_SAMPLE_RATE_HZ', config.env && config.env.SOLIDARITY_SAMPLE_RATE_HZ]
    ];
    const configuredEnvironmentRates = environmentValues
        .filter(([, value]) => value !== undefined)
        .map(([name, value]) => {
            if (typeof value !== 'string' || !/^\d+$/.test(value)) {
                throw new TypeError(`${name} must be a positive integer`);
            }
            return [name, validateSampleRateHz(Number(value), name)];
        });
    if (configuredEnvironmentRates.some(([, value]) => value !== configuredEnvironmentRates[0]?.[1])) {
        throw new TypeError('Conflicting sample-rate values were provided in environment configuration');
    }
    const environmentRate = configuredEnvironmentRates[0]?.[1];

    if (supplied.length > 1 && supplied.some(([, value]) => value !== supplied[0][1])) {
        throw new TypeError('Conflicting sample-rate values were provided for sample_rate_hz and sampleRate');
    }
    if (environmentRate !== undefined && supplied.length && supplied[0][1] !== environmentRate) {
        throw new TypeError('Conflicting sample-rate values were provided for environment and wrapper config');
    }
    return supplied.length ? supplied[0][1] : (environmentRate ?? DEFAULT_SAMPLE_RATE_HZ);
}

module.exports = { resolveSampleRateHz, validateSampleRateHz };
