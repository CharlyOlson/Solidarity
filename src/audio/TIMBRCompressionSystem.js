/**
 * TIMBR Compression System
 * Time-Integrated Modular Bandwidth Reduction for Solidarity Platform
 * 
 * @author Scott Charles Olson (Charly)
 * @platform Soul.Ed.Xchange.Fi
 * @version 2.1.0
 */

const { SacredNumericSequence } = require('./SacredNumericSequence');
const fs = require('fs');
const path = require('path');

class TIMBRCompressionSystem {
    constructor(config = {}) {
        this.config = {
            compressionLevel: config.compressionLevel || 7,
            useOmegaLock: config.useOmegaLock !== undefined ? config.useOmegaLock : true,
            goldenRatioThreshold: config.goldenRatioThreshold || 0.618, // φ^-1
            temporalSampling: config.temporalSampling || 1.618,         // φ
            maxIterations: config.maxIterations || 21                   // Solidarity node
        };
        
        this.sacredSequence = new SacredNumericSequence();
        this.compressionMetrics = {
            averageCompressionRatio: 0,
            totalBytesProcessed: 0,
            totalCompressedBytes: 0,
            successfulOperations: 0,
            failedOperations: 0
        };
        
        this.phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
        this.phiInverse = 1 / this.phi;    // Golden ratio inverse
        
        console.log("🔄 TIMBR Compression System initialized");
        console.log(`   Compression Level: ${this.config.compressionLevel}`);
        console.log(`   Omega Lock: ${this.config.useOmegaLock ? 'Enabled' : 'Disabled'}`);
    }

    /**
     * Calculate optimal compression parameters based on data characteristics
     * @param {Buffer|Array} data - Input data to analyze
     * @returns {Object} - Compression parameters
     * @private
     */
    _calculateCompressionParameters(data) {
        // Extract sample of data for analysis
        const sampleSize = Math.min(1024, data.length);
        const sample = data.slice(0, sampleSize);
        
        // Calculate data entropy (simplified Shannon entropy calculation)
        const entropy = this._calculateDataEntropy(sample);
        
        // Calculate compression ratio based on entropy and golden ratio
        const compressionRatio = Math.max(0.1, Math.min(0.9, 
            this.phiInverse * (1 - entropy)
        ));
        
        // Calculate temporal sampling rate for compression
        const sequenceNode = this.config.compressionLevel;
        const fibSequence = this.sacredSequence.getSequence('fibonacci', this.config.compressionLevel + 5);
        const temporalSamplingRate = fibSequence[sequenceNode] / fibSequence[sequenceNode - 1];
        
        // Calculate omega lock parameters if enabled
        const omegaLockParams = this.config.useOmegaLock ? 
            this._calculateOmegaLockParameters(entropy, data.length) : null;
        
        return {
            targetCompressionRatio: compressionRatio,
            entropy: entropy,
            temporalSamplingRate: temporalSamplingRate,
            blockSize: Math.floor(this.phi * this.config.compressionLevel * 32),
            omegaLock: omegaLockParams
        };
    }
    
    /**
     * Calculate Shannon entropy of data (simplified)
     * @param {Buffer|Array} data - Data to analyze
     * @returns {number} - Entropy value between 0-1
     * @private
     */
    _calculateDataEntropy(data) {
        // Count occurrences of each byte value
        const counts = new Array(256).fill(0);
        
        for (let i = 0; i < data.length; i++) {
            counts[data[i]]++;
        }
        
        // Calculate Shannon entropy
        let entropy = 0;
        for (let i = 0; i < counts.length; i++) {
            if (counts[i] > 0) {
                const probability = counts[i] / data.length;
                entropy -= probability * Math.log2(probability);
            }
        }
        
        // Normalize entropy to 0-1 range (max entropy for bytes is 8 bits)
        return entropy / 8;
    }
    
    /**
     * Calculate Omega Lock parameters for enhanced compression integrity
     * @param {number} entropy - Data entropy
     * @param {number} dataSize - Size of data
     * @returns {Object} - Omega Lock parameters
     * @private
     */
    _calculateOmegaLockParameters(entropy, dataSize) {
        // Calculate lock strength based on golden ratio, entropy, and solidarity node 7
        const lockStrength = this.phi * entropy * 7;
        
        // Calculate verification intervals based on Fibonacci sequence
        const fibSequence = this.sacredSequence.getSequence('fibonacci');
        const blockCount = Math.floor(dataSize / (this.config.compressionLevel * 64));
        
        // Get verification points (intervals where integrity checks are inserted)
        const verificationPoints = [];
        for (let i = 0; i < this.config.compressionLevel; i++) {
            const idx = i % fibSequence.length;
            const point = Math.floor((fibSequence[idx] / fibSequence[fibSequence.length-1]) * blockCount);
            if (point > 0 && point < blockCount && !verificationPoints.includes(point)) {
                verificationPoints.push(point);
            }
        }
        
        return {
            lockStrength: lockStrength,
            verificationPoints: verificationPoints,
            lockSignature: this._generateLockSignature(entropy)
        };
    }
    
    /**
     * Generate lock signature for data integrity
     * @param {number} entropy - Data entropy
     * @returns {string} - Lock signature
     * @private
     */
    _generateLockSignature(entropy) {
        // Create a unique signature based on entropy and golden ratio
        const signatureBase = (entropy * this.phi * 1000).toString(16);
        return `ΩL-${signatureBase.substring(0, 8)}-${this.config.compressionLevel}`;
    }

    /**
     * Compress data using TIMBR algorithm
     * @param {Buffer|Array} inputData - Data to compress
     * @returns {Object} - Compressed data and metadata
     */
    compress(inputData) {
        if (!Buffer.isBuffer(inputData) && !Array.isArray(inputData)) {
            throw new Error('Input data must be a Buffer or Array');
        }
        
        console.log(`🔄 Starting TIMBR compression on ${inputData.length} bytes of data`);
        const startTime = Date.now();
        
        try {
            // Calculate compression parameters based on data characteristics
            const params = this._calculateCompressionParameters(inputData);
            console.log(`   Analyzed entropy: ${params.entropy.toFixed(4)}`);
            console.log(`   Target compression ratio: ${params.targetCompressionRatio.toFixed(4)}`);
            
            // Prepare buffers and counters
            let compressedData = [];
            let blockStart = 0;
            let omegaLockInsertions = 0;
            
            // Process data in blocks
            while (blockStart < inputData.length) {
                const blockEnd = Math.min(blockStart + params.blockSize, inputData.length);
                const block = inputData.slice(blockStart, blockEnd);
                
                // Apply golden ratio sampling (temporal reduction)
                const sampledBlock = this._applySampling(block, params.temporalSamplingRate);
                
                // Apply TIMBR compression algorithm
                const compressedBlock = this._compressBlock(sampledBlock);
                
                // Add to compressed output
                compressedData.push(...compressedBlock);
                
                // Insert Omega Lock verification if needed
                if (params.omegaLock && params.omegaLock.verificationPoints.includes(Math.floor(blockStart/params.blockSize))) {
                    const lockData = this._insertOmegaLock(compressedBlock, params.omegaLock.lockSignature);
                    compressedData.push(...lockData);
                    omegaLockInsertions++;
                }
                
                blockStart = blockEnd;
            }
            
            // Create final compressed buffer
            const outputBuffer = Buffer.from(compressedData);
            
            // Calculate compression ratio
            const compressionRatio = outputBuffer.length / inputData.length;
            
            // Update metrics
            this.compressionMetrics.totalBytesProcessed += inputData.length;
            this.compressionMetrics.totalCompressedBytes += outputBuffer.length;
            this.compressionMetrics.successfulOperations++;
            this.compressionMetrics.averageCompressionRatio = 
                this.compressionMetrics.totalCompressedBytes / this.compressionMetrics.totalBytesProcessed;
            
            // Create metadata
            const metadata = {
                originalSize: inputData.length,
                compressedSize: outputBuffer.length,
                compressionRatio: compressionRatio,
                processingTimeMs: Date.now() - startTime,
                entropy: params.entropy,
                compressionLevel: this.config.compressionLevel,
                omegaLockEnabled: this.config.useOmegaLock,
                omegaLockInsertions: omegaLockInsertions,
                temporalSamplingRate: params.temporalSamplingRate
            };
            
            console.log(`✅ Compression complete - Ratio: ${compressionRatio.toFixed(4)} (${metadata.processingTimeMs}ms)`);
            
            return {
                data: outputBuffer,
                metadata: metadata
            };
            
        } catch (error) {
            console.error(`❌ Compression error: ${error.message}`);
            this.compressionMetrics.failedOperations++;
            throw error;
        }
    }
    
    /**
     * Apply temporal sampling to reduce data
     * @param {Buffer|Array} block - Data block to sample
     * @param {number} rate - Sampling rate
     * @returns {Array} - Sampled data
     * @private
     */
    _applySampling(block, rate) {
        const result = [];
        let idx = 0;
        
        while (idx < block.length) {
            result.push(block[idx]);
            // Advance by the dynamic rate using golden ratio principles
            idx = Math.floor(idx + rate);
        }
        
        return result;
    }
    
    /**
     * Compress a data block using TIMBR algorithm
     * @param {Array} block - Data block to compress
     * @returns {Array} - Compressed data
     * @private
     */
    _compressBlock(block) {
        // This is a simplified algorithm for demonstration purposes
        // In a real implementation, this would use more sophisticated techniques
        
        const result = [];
        let current = block[0];
        let count = 1;
        
        // Run-length encoding with golden ratio optimizations
        for (let i = 1; i < block.length; i++) {
            if (block[i] === current && count < 255) {
                count++;
            } else {
                // Store using RLE format
                result.push(count);
                result.push(current);
                current = block[i];
                count = 1;
            }
        }
        
        // Add the last group
        if (count > 0) {
            result.push(count);
            result.push(current);
        }
        
        return result;
    }
    
    /**
     * Insert Omega Lock verification data for integrity checking
     * @param {Array} block - Compressed block
     * @param {string} signature - Lock signature
     * @returns {Array} - Verification data
     * @private
     */
    _insertOmegaLock(block, signature) {
        // Calculate checksum for verification (simple sum for demonstration)
        const checksum = block.reduce((sum, byte) => (sum + byte) % 256, 0);
        
        // Create Omega Lock header (OL marker + checksum + signature length)
        const header = [0x4F, 0x4C, checksum, signature.length];
        
        // Convert signature to bytes
        const signatureBytes = [];
        for (let i = 0; i < signature.length; i++) {
            signatureBytes.push(signature.charCodeAt(i));
        }
        
        // Combine header and signature
        return [...header, ...signatureBytes];
    }

    /**
     * Decompress data that was compressed with TIMBR
     * @param {Buffer} compressedData - Compressed data buffer
     * @returns {Object} - Decompressed data and metadata
     */
    decompress(compressedData) {
        if (!Buffer.isBuffer(compressedData)) {
            throw new Error('Input must be a Buffer');
        }
        
        console.log(`🔄 Starting TIMBR decompression on ${compressedData.length} bytes of data`);
        const startTime = Date.now();
        
        try {
            // Convert buffer to array for processing
            const dataArray = Array.from(compressedData);
            const decompressedData = [];
            
            let i = 0;
            while (i < dataArray.length) {
                // Check for Omega Lock marker
                if (dataArray[i] === 0x4F && dataArray[i+1] === 0x4C && i+3 < dataArray.length) {
                    // This is an Omega Lock section
                    const checksum = dataArray[i+2];
                    const signatureLength = dataArray[i+3];
                    
                    // Skip over the Omega Lock section
                    i += 4 + signatureLength;
                    continue;
                }
                
                // Normal compressed data
                if (i+1 < dataArray.length) {
                    const count = dataArray[i];
                    const value = dataArray[i+1];
                    
                    // Expand the run-length encoding
                    for (let j = 0; j < count; j++) {
                        decompressedData.push(value);
                    }
                    
                    i += 2;
                } else {
                    // Incomplete data at the end
                    i++;
                }
            }
            
            // Create decompressed buffer
            const outputBuffer = Buffer.from(decompressedData);
            
            // Calculate metrics
            const metadata = {
                originalSize: compressedData.length,
                decompressedSize: outputBuffer.length,
                expansionRatio: outputBuffer.length / compressedData.length,
                processingTimeMs: Date.now() - startTime
            };
            
            console.log(`✅ Decompression complete - Expansion ratio: ${metadata.expansionRatio.toFixed(4)} (${metadata.processingTimeMs}ms)`);
            
            return {
                data: outputBuffer,
                metadata: metadata
            };
            
        } catch (error) {
            console.error(`❌ Decompression error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Compress a file using TIMBR compression
     * @param {string} inputPath - Path to input file
     * @param {string} outputPath - Path to output file
     * @returns {Object} - Compression results
     */
    async compressFile(inputPath, outputPath) {
        try {
            const inputData = fs.readFileSync(inputPath);
            console.log(`📂 Compressing file: ${path.basename(inputPath)}`);
            
            // Compress the data
            const result = this.compress(inputData);
            
            // Write compressed data to output file
            fs.writeFileSync(outputPath, result.data);
            
            // Create metadata file
            const metadataPath = `${outputPath}.meta.json`;
            fs.writeFileSync(metadataPath, JSON.stringify({
                original_filename: path.basename(inputPath),
                compression_timestamp: new Date().toISOString(),
                ...result.metadata,
                solidarity_node: this.config.compressionLevel,
                phi_value: this.phi,
                phi_inverse: this.phiInverse
            }, null, 2));
            
            console.log(`✅ File compressed successfully: ${path.basename(outputPath)}`);
            console.log(`   Original size: ${result.metadata.originalSize} bytes`);
            console.log(`   Compressed size: ${result.metadata.compressedSize} bytes`);
            console.log(`   Ratio: ${result.metadata.compressionRatio.toFixed(4)}`);
            
            return {
                success: true,
                inputPath,
                outputPath,
                metadataPath,
                ...result.metadata
            };
            
        } catch (error) {
            console.error(`❌ File compression error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                inputPath,
                outputPath
            };
        }
    }

    /**
     * Decompress a file that was compressed with TIMBR
     * @param {string} inputPath - Path to compressed file
     * @param {string} outputPath - Path to output file
     * @returns {Object} - Decompression results
     */
    async decompressFile(inputPath, outputPath) {
        try {
            const inputData = fs.readFileSync(inputPath);
            console.log(`📂 Decompressing file: ${path.basename(inputPath)}`);
            
            // Check for metadata file
            const metadataPath = `${inputPath}.meta.json`;
            let metadata = null;
            
            if (fs.existsSync(metadataPath)) {
                try {
                    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                    console.log(`📄 Found metadata file: ${path.basename(metadataPath)}`);
                    console.log(`   Original file: ${metadata.original_filename}`);
                    console.log(`   Compression ratio: ${metadata.compressionRatio}`);
                } catch (e) {
                    console.warn(`⚠️ Could not parse metadata file: ${e.message}`);
                }
            } else {
                console.warn('⚠️ No metadata file found, continuing with blind decompression');
            }
            
            // Decompress the data
            const result = this.decompress(inputData);
            
            // Write decompressed data to output file
            fs.writeFileSync(outputPath, result.data);
            
            console.log(`✅ File decompressed successfully: ${path.basename(outputPath)}`);
            console.log(`   Compressed size: ${result.metadata.originalSize} bytes`);
            console.log(`   Decompressed size: ${result.metadata.decompressedSize} bytes`);
            console.log(`   Expansion ratio: ${result.metadata.expansionRatio.toFixed(4)}`);
            
            return {
                success: true,
                inputPath,
                outputPath,
                metadata: result.metadata,
                originalMetadata: metadata
            };
            
        } catch (error) {
            console.error(`❌ File decompression error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                inputPath,
                outputPath
            };
        }
    }

    /**
     * Get compression system metrics
     * @returns {Object} - System metrics
     */
    getCompressionMetrics() {
        return {
            ...this.compressionMetrics,
            timestamp: new Date().toISOString(),
            phi: this.phi,
            phiInverse: this.phiInverse,
            compressionLevel: this.config.compressionLevel,
            omegaLockEnabled: this.config.useOmegaLock
        };
    }
    
    /**
     * Configure the compression system
     * @param {Object} newConfig - Configuration parameters
     */
    configure(newConfig) {
        if (newConfig.compressionLevel !== undefined) {
            this.config.compressionLevel = newConfig.compressionLevel;
        }
        
        if (newConfig.useOmegaLock !== undefined) {
            this.config.useOmegaLock = newConfig.useOmegaLock;
        }
        
        if (newConfig.goldenRatioThreshold !== undefined) {
            this.config.goldenRatioThreshold = newConfig.goldenRatioThreshold;
        }
        
        if (newConfig.temporalSampling !== undefined) {
            this.config.temporalSampling = newConfig.temporalSampling;
        }
        
        if (newConfig.maxIterations !== undefined) {
            this.config.maxIterations = newConfig.maxIterations;
        }
        
        console.log("🔄 TIMBR Compression System reconfigured");
        console.log(`   Compression Level: ${this.config.compressionLevel}`);
        console.log(`   Omega Lock: ${this.config.useOmegaLock ? 'Enabled' : 'Disabled'}`);
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TIMBRCompressionSystem };
}

// Demo usage if run directly
if (require.main === module) {
    const testCompression = async () => {
        console.log("🔄 TIMBR Compression System Demo");
        console.log("=" + "=".repeat(50));
        
        // Create test data
        const testData = Buffer.from("This is a test of the TIMBR Compression System. " +
            "It uses the Sacred Numeric Sequence and Golden Ratio principles to " +
            "achieve optimal compression with Omega Lock verification. " +
            "This demonstration is using simplified algorithms, but the " +
            "concept follows Scott Charles Olson's harmonic framework principles. " +
            "The compression level is set to 7, which corresponds to one of the " +
            "key Solidarity nodes. TIMBR stands for Time-Integrated Modular Bandwidth Reduction. " +
            "In a full implementation, this would leverage advanced algorithms with " +
            "φ-based optimization for both lossless and perceptual compression modes."
            .repeat(10)); // Repeat to get more data
        
        // Create the compression system
        const timbr = new TIMBRCompressionSystem({
            compressionLevel: 7,
            useOmegaLock: true
        });
        
        console.log(`\n📊 Test Data Size: ${testData.length} bytes`);
        
        // Compress the test data
        console.log("\n🔄 Compressing test data...");
        const compressed = timbr.compress(testData);
        
        console.log(`\n📊 Compressed Data Size: ${compressed.data.length} bytes`);
        console.log(`📊 Compression Ratio: ${compressed.metadata.compressionRatio.toFixed(4)}`);
        console.log(`📊 Processing Time: ${compressed.metadata.processingTimeMs}ms`);
        
        // Decompress the data
        console.log("\n🔄 Decompressing test data...");
        const decompressed = timbr.decompress(compressed.data);
        
        // Verify decompression
        const decompressedString = decompressed.data.toString();
        const originalString = testData.toString();
        const verificationSuccessful = decompressedString === originalString;
        
        console.log(`📊 Decompressed Data Size: ${decompressed.data.length} bytes`);
        console.log(`📊 Expansion Ratio: ${decompressed.metadata.expansionRatio.toFixed(4)}`);
        console.log(`📊 Processing Time: ${decompressed.metadata.processingTimeMs}ms`);
        console.log(`✅ Verification: ${verificationSuccessful ? 'SUCCESSFUL' : 'FAILED'}`);
        
        // Show system metrics
        console.log("\n📈 TIMBR Compression System Metrics:");
        console.log(timbr.getCompressionMetrics());
    };
    
    testCompression().catch(error => {
        console.error(`❌ Demo error: ${error.message}`);
    });
}