/**
 * Focused Pass Correction System for Solidarity Platform
 * Implements Python-style focused correction with harmonic phrase integration
 * 
 * Based on Python implementation:
 * def focused_pass(data, unit="symbol"):
 *     Performs correction at symbol, word, or line level
 */

// Focused Pass Correction System - Integration with Solidarity Platform
class FocusedPassCorrector {
    constructor() {
        this.correctionUnits = ["symbol", "word", "line"];
        this.correctionHistory = [];
        this.errorPatterns = new Map([
            ["symbol", /[^\w\s\.\,\;\:\!\?]/g], // Invalid symbols
            ["word", /\b\w{1,2}\b/g], // Very short words (potential errors)
            ["line", /^.{1,10}$/gm] // Very short lines (potential fragments)
        ]);
        this.harmonicCorrections = new Map();
        this.stats = {
            symbolCorrections: 0,
            wordCorrections: 0,
            lineCorrections: 0,
            totalPasses: 0
        };
    }

    // Symbol-level correction - equivalent to Python correct_symbol()
    correctSymbol(symbol) {
        // Replace problematic symbols with harmonic equivalents
        const symbolMap = {
            '�': '♪', // Replace invalid chars with musical notes
            '©': '♫',
            '®': '♬',
            '™': '♭',
            '†': '♯',
            '\x00': '', // Remove null characters
            '\uFFFD': '♪', // Replace replacement characters
            '\r': '\n', // Normalize line endings
        };
        
        const corrected = symbolMap[symbol] || symbol;
        if (corrected !== symbol) {
            this.stats.symbolCorrections++;
        }
        return corrected;
    }

    // Word-level correction with harmonic phrase integration - equivalent to Python correct_word()
    correctWord(word) {
        // Check if word is part of harmonic phrase vocabulary
        const harmonicWords = {
            // Common typos
            'teh': 'the',
            'adn': 'and',
            'thier': 'their',
            'recieve': 'receive',
            'seperate': 'separate',
            'occured': 'occurred',
            'smple': 'simple',
            'txt': 'text',
            'erors': 'errors',
            'tim': 'time',
            
            // Harmonic phrase corrections
            'fourrs': 'fours', // Harmonic phrase correction
            'fours': 'fours', // Already correct
            'cents': 'Cents', // Capitalize for harmonic phrase
            'hiccup': 'Hiccup', // Capitalize for harmonic phrase
            'notifer': 'Notifier', // Fix typo and capitalize
            'telephon': 'Telephone',
            'carousl': 'carousel',
            'angel': 'Angel',
            'daemon': 'Daemon',
            'archetpes': 'Archetypes',
            'reacting': 'reacting',
            'gusts': 'gusts'
        };
        
        const cleaned = word.toLowerCase().replace(/[^\w]/g, '');
        const corrected = harmonicWords[cleaned] || word;
        
        if (corrected !== word) {
            this.stats.wordCorrections++;
            console.log(`   Word correction: "${word}" → "${corrected}"`);
        }
        
        return corrected;
    }

    // Line-level correction for harmonic phrases - equivalent to Python correct_line()
    correctLine(line) {
        if (!line || line.trim().length === 0) return line;
        
        let correctedLine = line;
        const originalLine = line;
        
        // Enhance known harmonic phrases
        const harmonicPhrases = [
            { pattern: /too\s+fours?/i, replacement: "Too fours" },
            { pattern: /hard\s+time\s+making\s+cents/i, replacement: "Hard time making Cents" },
            { pattern: /hiccup\s+notif[ie]r/i, replacement: "Hiccup Notifier" },
            { pattern: /telephone\s+password\s+carousl?/i, replacement: "Telephone password carousel" },
            { pattern: /water\s+reacting\s+to+\s+gusts/i, replacement: "Water reacting to gusts" },
            { pattern: /angel\s*\/?\s*daemon\s+archetypes?/i, replacement: "Angel / Daemon Archetypes" }
        ];
        
        for (const phrase of harmonicPhrases) {
            const beforeCorrection = correctedLine;
            correctedLine = correctedLine.replace(phrase.pattern, phrase.replacement);
            if (beforeCorrection !== correctedLine) {
                console.log(`   Line correction applied: "${phrase.replacement}"`);
            }
        }
        
        if (correctedLine !== originalLine) {
            this.stats.lineCorrections++;
        }
        
        return correctedLine;
    }

    // Main focused pass function - equivalent to Python focused_pass()
    focusedPass(data, unit = "symbol") {
        if (typeof data !== 'string') {
            console.log("⚠️ Data must be string for correction");
            return data;
        }

        let corrected;
        
        switch (unit) {
            case "symbol":
                // Process each character individually
                corrected = data.split('').map(s => this.correctSymbol(s)).join('');
                break;
                
            case "word":
                // Split by whitespace, correct each word, rejoin
                corrected = data.split(/\s+/).map(w => this.correctWord(w)).join(' ');
                break;
                
            case "line":
                // Split by newlines, correct each line, rejoin
                corrected = data.split('\n').map(l => this.correctLine(l)).join('\n');
                break;
                
            default:
                throw new Error(`Unknown correction unit: ${unit}`);
        }
        
        // Store correction history
        this.correctionHistory.push({
            unit: unit,
            original: data,
            corrected: corrected,
            timestamp: Date.now(),
            changes: data !== corrected,
            originalLength: data.length,
            correctedLength: corrected.length
        });
        
        return corrected;
    }

    // Multi-pass correction with harmonic integration - Python equivalent workflow
    multiPassCorrection(text, passes = 3) {
        console.log(`🔧 Starting multi-pass correction (${passes} passes)...`);
        console.log(`   Original text length: ${text.length} characters`);
        
        let correctedText = text;
        const passResults = [];
        this.stats.totalPasses = passes;
        
        for (let pass = 1; pass <= passes; pass++) {
            console.log(`\n   Pass ${pass}:`);
            
            // Apply corrections in order: symbol → word → line
            for (const unit of this.correctionUnits) {
                const beforeCorrection = correctedText;
                correctedText = this.focusedPass(correctedText, unit);
                
                if (beforeCorrection !== correctedText) {
                    const changeCount = Math.abs(correctedText.length - beforeCorrection.length);
                    console.log(`      ✓ ${unit} corrections applied (${changeCount} character changes)`);
                } else {
                    console.log(`      • ${unit} pass: no changes needed`);
                }
            }
            
            passResults.push({
                pass: pass,
                text: correctedText,
                length: correctedText.length,
                changesFromPrevious: pass === 1 ? text !== correctedText : 
                    passResults[pass - 2].text !== correctedText
            });
        }
        
        console.log(`\n✅ Multi-pass correction complete`);
        console.log(`   Final text length: ${correctedText.length} characters`);
        console.log(`   Total corrections: ${this.getTotalCorrections()}`);
        
        return {
            final: correctedText,
            original: text,
            passes: passResults,
            totalPasses: passes,
            statistics: { ...this.stats }
        };
    }

    // Get total correction count
    getTotalCorrections() {
        return this.stats.symbolCorrections + this.stats.wordCorrections + this.stats.lineCorrections;
    }

    // Reset statistics
    resetStats() {
        this.stats = {
            symbolCorrections: 0,
            wordCorrections: 0,
            lineCorrections: 0,
            totalPasses: 0
        };
    }

    // Integration with telephone game processor
    integrateWithTelephoneGame(telephoneProcessor, data) {
        console.log(`📞 Integrating focused correction with telephone game...`);
        
        // Convert text to numerical data for telephone game
        const textAsNumbers = data.split('').map(char => char.charCodeAt(0));
        
        // Apply telephone game processing
        const telephoneResult = telephoneProcessor.gradientPassOverAndClean(
            textAsNumbers, 3, 0.05
        );
        
        // Convert back to text with bounds checking
        const processedText = telephoneResult.final
            .map(num => {
                // Ensure valid ASCII range
                const charCode = Math.round(Math.abs(num) % 95 + 32); // Printable ASCII range
                return String.fromCharCode(charCode);
            })
            .join('');
        
        console.log(`   Telephone game processing: ${data.length} → ${processedText.length} chars`);
        
        // Apply focused correction to cleaned telephone game result
        const correctionResult = this.multiPassCorrection(processedText, 2);
        
        return {
            telephoneGame: telephoneResult,
            correction: correctionResult,
            finalText: correctionResult.final,
            integrationStats: {
                originalLength: data.length,
                telephoneLength: processedText.length,
                finalLength: correctionResult.final.length
            }
        };
    }

    // Batch processing for multiple texts
    batchProcessing(texts, passes = 3) {
        console.log(`📦 Batch processing ${texts.length} texts...`);
        
        const results = [];
        this.resetStats();
        
        texts.forEach((text, index) => {
            console.log(`\n--- Processing text ${index + 1}/${texts.length} ---`);
            const result = this.multiPassCorrection(text, passes);
            results.push({
                index: index,
                result: result,
                success: result.final.length > 0
            });
        });
        
        const successCount = results.filter(r => r.success).length;
        console.log(`\n✅ Batch processing complete: ${successCount}/${texts.length} successful`);
        
        return {
            results: results,
            summary: {
                total: texts.length,
                successful: successCount,
                totalCorrections: this.getTotalCorrections(),
                statistics: { ...this.stats }
            }
        };
    }

    // Export correction history
    exportHistory() {
        return {
            history: this.correctionHistory,
            statistics: this.stats,
            timestamp: Date.now()
        };
    }
}

// Example usage and testing
function demonstrateFocusedCorrector() {
    console.log("🔧 Focused Pass Corrector Demonstration");
    console.log("=" * 60);
    
    const corrector = new FocusedPassCorrector();
    
    // Sample text with various errors (matching Python example)
    const errorText = `Ths is a smple txt with erors.
Too fourrs and hard tim making cents.
Hiccup notifer and telephon password carousl.
Water reacting too gusts with angel/daemon archetpes.`;
    
    console.log("📝 Original text:");
    console.log(errorText);
    console.log();
    
    // Apply multi-pass correction (equivalent to Python loop)
    const result = corrector.multiPassCorrection(errorText, 3);
    
    console.log("✅ Final corrected text:");
    console.log(result.final);
    console.log();
    
    // Show pass-by-pass results
    console.log("📊 Pass-by-pass results:");
    result.passes.forEach((pass, index) => {
        console.log(`   Pass ${pass.pass}: "${pass.text.substring(0, 50)}${pass.text.length > 50 ? '...' : ''}"`);
    });
    
    console.log();
    console.log("📈 Correction statistics:");
    console.log(`   Symbol corrections: ${result.statistics.symbolCorrections}`);
    console.log(`   Word corrections: ${result.statistics.wordCorrections}`);
    console.log(`   Line corrections: ${result.statistics.lineCorrections}`);
    console.log(`   Total corrections: ${result.statistics.symbolCorrections + result.statistics.wordCorrections + result.statistics.lineCorrections}`);
    
    return result;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FocusedPassCorrector,
        demonstrateFocusedCorrector
    };
}

// Auto-run demonstration if called directly
if (typeof window === 'undefined' && require.main === module) {
    demonstrateFocusedCorrector();
}