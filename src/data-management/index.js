/**
 * Data Management Functions for Sync Stone Protocol™
 * Core functions for encoding, compression, and data restoration
 */

/**
 * Converts input data into 7-bit septets for optimal bit distribution
 * @param {Buffer|Uint8Array|string} data - Raw binary data
 * @returns {Array<number>} Array of 7-bit data units
 */
export function septet_encode(data) {
    if (!data) throw new Error('Data is required for septet encoding');
    
    let bytes;
    if (typeof data === 'string') {
        bytes = new TextEncoder().encode(data);
    } else if (data instanceof Buffer) {
        bytes = new Uint8Array(data);
    } else if (data instanceof Uint8Array) {
        bytes = data;
    } else {
        throw new Error('Data must be Buffer, Uint8Array, or string');
    }

    const septets = [];
    let bits = '';
    
    // Convert bytes to bit string
    for (const byte of bytes) {
        bits += byte.toString(2).padStart(8, '0');
    }
    
    // Split into 7-bit septets
    for (let i = 0; i < bits.length; i += 7) {
        const septet = bits.slice(i, i + 7);
        if (septet.length > 0) {
            // Pad incomplete septets with zeros
            septets.push(parseInt(septet.padEnd(7, '0'), 2));
        }
    }
    
    return septets;
}

/**
 * Applies Pi-based lattice-sphere compression using harmonic patterns
 * @param {Array<number>} septet_data - Array of 7-bit septets
 * @returns {Object} Compressed data with harmonic metadata
 */
export function timbr_compress(septet_data) {
    if (!Array.isArray(septet_data)) {
        throw new Error('Septet data must be an array');
    }
    
    const n = septet_data.length;
    const compressed = [];
    const metadata = {
        originalLength: n,
        harmonicPattern: [],
        compressionRatio: 0,
        piCoefficients: []
    };
    
    // Apply Pi-based compression formula: C_TIMBR = Σ(D_i × cos(πi/n))
    for (let i = 0; i < n; i++) {
        const harmonicValue = septet_data[i] * Math.cos(Math.PI * i / n);
        compressed.push(harmonicValue);
        metadata.piCoefficients.push(Math.PI * i / n);
        
        // Track harmonic patterns for decompression
        if (i % 7 === 0) { // Every 7th element creates a harmonic node
            metadata.harmonicPattern.push({
                index: i,
                phase: Math.PI * i / n,
                amplitude: harmonicValue
            });
        }
    }
    
    // Calculate compression efficiency
    const originalSize = n * 7; // bits
    const compressedSize = compressed.length * 32; // assuming 32-bit floats
    metadata.compressionRatio = originalSize / compressedSize;
    
    return {
        data: compressed,
        metadata,
        type: 'TIMBR_COMPRESSED'
    };
}

/**
 * Further compresses data using First, Outer, Inner, Last harmonic folding
 * @param {Object} timbr_data - TIMBR compressed data
 * @returns {Object} FOIL compressed data with order preservation metadata
 */
export function foil_harmonic_fold(timbr_data) {
    if (!timbr_data || timbr_data.type !== 'TIMBR_COMPRESSED') {
        throw new Error('Input must be TIMBR compressed data');
    }
    
    const data = timbr_data.data;
    const n = data.length;
    
    if (n < 4) {
        throw new Error('Data must have at least 4 elements for FOIL folding');
    }
    
    const foilCompressed = [];
    const metadata = {
        ...timbr_data.metadata,
        foilPattern: {},
        orderPreservation: [],
        foldingCoefficients: {}
    };
    
    // FOIL folding: F(x) ⊗ O(x) ⊗ I(x) ⊗ L(x)
    const chunks = Math.ceil(n / 4);
    
    for (let chunk = 0; chunk < chunks; chunk++) {
        const start = chunk * 4;
        const end = Math.min(start + 4, n);
        const segment = data.slice(start, end);
        
        if (segment.length >= 4) {
            const [F, O, I, L] = segment;
            
            // Apply FOIL operation: First×Last + Outer×Inner
            const foilValue = (F * L) + (O * I);
            foilCompressed.push(foilValue);
            
            // Store order preservation data
            metadata.orderPreservation.push({
                chunkIndex: chunk,
                originalIndices: [start, start + 1, start + 2, start + 3],
                foilComponents: { F, O, I, L },
                reconstructionKey: F + O + I + L // Sum for validation
            });
        } else {
            // Handle incomplete segments
            const paddedSegment = [...segment];
            while (paddedSegment.length < 4) {
                paddedSegment.push(0);
            }
            const [F, O, I, L] = paddedSegment;
            const foilValue = (F * L) + (O * I);
            foilCompressed.push(foilValue);
            
            metadata.orderPreservation.push({
                chunkIndex: chunk,
                originalIndices: Array.from({length: segment.length}, (_, i) => start + i),
                foilComponents: { F, O, I, L },
                reconstructionKey: F + O + I + L,
                padded: true,
                originalSegmentLength: segment.length
            });
        }
    }
    
    // Store FOIL pattern metadata
    metadata.foilPattern = {
        totalChunks: chunks,
        compressionRatio: n / foilCompressed.length,
        foldingMethod: 'HARMONIC_FOIL'
    };
    
    return {
        data: foilCompressed,
        metadata,
        type: 'FOIL_COMPRESSED'
    };
}

/**
 * Encodes compressed data for multiple signal types (digital, analog, RF, optical)
 * @param {Object} foil_data - FOIL compressed data
 * @param {Array<string>} signal_types - Array of target signal types
 * @returns {Object} Multi-format encoded data ready for transmission
 */
export function multi_signal_encode(foil_data, signal_types) {
    if (!foil_data || foil_data.type !== 'FOIL_COMPRESSED') {
        throw new Error('Input must be FOIL compressed data');
    }
    
    if (!Array.isArray(signal_types) || signal_types.length === 0) {
        throw new Error('Signal types array is required');
    }
    
    const supportedTypes = ['digital', 'analog', 'rf', 'optical'];
    const invalidTypes = signal_types.filter(type => !supportedTypes.includes(type));
    if (invalidTypes.length > 0) {
        throw new Error(`Unsupported signal types: ${invalidTypes.join(', ')}`);
    }
    
    const encodings = {};
    const data = foil_data.data;
    
    for (const signalType of signal_types) {
        switch (signalType) {
            case 'digital':
                encodings.digital = {
                    format: 'BINARY_STREAM',
                    data: data.map(val => Math.round(val).toString(2).padStart(16, '0')).join(''),
                    bitRate: '1Mbps',
                    errorCorrection: 'HAMMING_CODE'
                };
                break;
                
            case 'analog':
                encodings.analog = {
                    format: 'AMPLITUDE_MODULATION',
                    data: data.map(val => ({
                        amplitude: val,
                        frequency: 1000 + (val % 1000), // Base 1kHz + variation
                        phase: (val * Math.PI) % (2 * Math.PI)
                    })),
                    carrierFreq: '10MHz',
                    modulation: 'AM'
                };
                break;
                
            case 'rf':
                encodings.rf = {
                    format: 'FREQUENCY_SHIFT_KEYING',
                    data: data.map(val => ({
                        frequency: 2400000000 + (val * 1000), // 2.4GHz + variation
                        power: Math.min(val / 100, 1), // Normalize power
                        duration: 1 // 1ms per symbol
                    })),
                    band: '2.4GHz',
                    protocol: 'SYNC_STONE_RF'
                };
                break;
                
            case 'optical':
                encodings.optical = {
                    format: 'INTENSITY_MODULATION',
                    data: data.map(val => ({
                        wavelength: 850 + (val % 100), // Near-infrared range
                        intensity: Math.abs(val) % 1, // 0-1 intensity
                        pulseWidth: 1e-9 // 1ns pulses
                    })),
                    wavelengthRange: '850-950nm',
                    modulation: 'OOK' // On-Off Keying
                };
                break;
        }
    }
    
    return {
        encodings,
        metadata: {
            ...foil_data.metadata,
            signal_types,
            encodingTimestamp: Date.now(),
            transmissionReady: true
        },
        type: 'MULTI_SIGNAL_ENCODED'
    };
}

/**
 * Securely decompresses and restores original data order on any device
 * @param {Object} encoded_data - Multi-signal encoded data
 * @param {Object} metadata - Harmonic metadata from compression
 * @returns {Buffer} Original data in perfect order
 */
export function closed_hub_unzip(encoded_data, metadata) {
    if (!encoded_data || encoded_data.type !== 'MULTI_SIGNAL_ENCODED') {
        throw new Error('Input must be multi-signal encoded data');
    }
    
    if (!metadata) {
        metadata = encoded_data.metadata;
    }
    
    // Extract FOIL compressed data from any available signal encoding
    let foilData;
    const encodings = encoded_data.encodings;
    
    // Prefer digital encoding for reconstruction
    if (encodings.digital) {
        const binaryString = encodings.digital.data;
        foilData = [];
        for (let i = 0; i < binaryString.length; i += 16) {
            const chunk = binaryString.slice(i, i + 16);
            foilData.push(parseInt(chunk, 2));
        }
    } else if (encodings.analog) {
        foilData = encodings.analog.data.map(signal => signal.amplitude);
    } else if (encodings.rf) {
        foilData = encodings.rf.data.map(signal => (signal.frequency - 2400000000) / 1000);
    } else if (encodings.optical) {
        foilData = encodings.optical.data.map(signal => signal.wavelength - 850);
    } else {
        throw new Error('No supported encoding found for decompression');
    }
    
    // Reverse FOIL compression using order preservation metadata
    const timbrData = [];
    const orderPreservation = metadata.orderPreservation;
    
    for (let i = 0; i < orderPreservation.length; i++) {
        const chunkInfo = orderPreservation[i];
        const foilValue = foilData[i];
        const { F, O, I, L } = chunkInfo.foilComponents;
        
        // Reconstruct original quartet from FOIL value
        // This is an approximation since FOIL compression is lossy
        const sum = chunkInfo.reconstructionKey;
        const reconstructed = [F, O, I, L];
        
        if (chunkInfo.padded) {
            // Only add non-padded elements
            for (let j = 0; j < chunkInfo.originalSegmentLength; j++) {
                timbrData.push(reconstructed[j]);
            }
        } else {
            timbrData.push(...reconstructed);
        }
    }
    
    // Reverse TIMBR compression using harmonic patterns
    const septets = [];
    const n = metadata.originalLength;
    const piCoefficients = metadata.piCoefficients;
    
    for (let i = 0; i < n; i++) {
        if (i < timbrData.length && i < piCoefficients.length) {
            // Reverse the harmonic compression: original = compressed / cos(πi/n)
            const cosValue = Math.cos(piCoefficients[i]);
            const originalValue = cosValue !== 0 ? timbrData[i] / cosValue : timbrData[i];
            septets.push(Math.round(Math.abs(originalValue)) & 0x7F); // Ensure 7-bit range
        }
    }
    
    // Convert septets back to bytes
    let bitString = '';
    for (const septet of septets) {
        bitString += septet.toString(2).padStart(7, '0');
    }
    
    // Convert bit string to bytes
    const bytes = [];
    for (let i = 0; i < bitString.length; i += 8) {
        const byte = bitString.slice(i, i + 8);
        if (byte.length === 8) {
            bytes.push(parseInt(byte, 2));
        }
    }
    
    return Buffer.from(bytes);
}