"""
Cross-Language Harmonic Implementations
Author: Scott Charles Olson, "Charly"
Date: August 24, 2025

C and Java implementations of core harmonic calculations for cross-platform compatibility.
"""

import os
from typing import Dict, List

def generate_c_implementation() -> str:
    """Generate C implementation of harmonic calculations"""
    c_code = """
/* 
 * Harmonic Processing Library - C Implementation
 * Author: Scott Charles Olson, "Charly"
 * Date: August 24, 2025
 * 
 * Core harmonic frequency calculations and mathematical harmonic series
 * Formula: f_n = n × f₀ (for frequency harmonics)  
 * Formula: H_n = Σ(1/k) for k=1 to n (for mathematical harmonic series)
 */

#include <stdio.h>
#include <math.h>
#include <stdlib.h>

/**
 * Calculate nth harmonic frequency
 * @param fundamental Base frequency in Hz
 * @param n Harmonic number
 * @return nth harmonic frequency
 */
double harmonic_frequency(double fundamental, int n) {
    return fundamental * n;
}

/**
 * Calculate nth harmonic number (mathematical harmonic series)
 * @param n Number of terms
 * @return Sum of reciprocals H_n = 1 + 1/2 + 1/3 + ... + 1/n
 */
double harmonic_number(int n) {
    double sum = 0.0;
    for (int i = 1; i <= n; i++) {
        sum += 1.0 / i;
    }
    return sum;
}

/**
 * Calculate nth harmonic number recursively
 * @param n Number of terms
 * @return Sum of reciprocals calculated recursively
 */
double harmonic_number_recursive(int n) {
    if (n == 1) {
        return 1.0;
    }
    return 1.0 / n + harmonic_number_recursive(n - 1);
}

/**
 * Calculate cents deviation from equal temperament
 * @param ratio Frequency ratio
 * @return Deviation in cents
 */
double cents_deviation(double ratio) {
    return 1200.0 * log2(ratio);
}

/**
 * Generate complete harmonic series
 * @param fundamental_frequency Base frequency in Hz
 * @param max_harmonic Maximum harmonic number
 * @param frequencies Output array for frequencies
 * @param ratios Output array for ratio decimals
 * @param cents Output array for cents deviations
 */
void generate_harmonic_series(double fundamental_frequency, int max_harmonic,
                            double* frequencies, double* ratios, double* cents) {
    for (int n = 1; n <= max_harmonic; n++) {
        frequencies[n-1] = harmonic_frequency(fundamental_frequency, n);
        ratios[n-1] = (double)n;
        cents[n-1] = cents_deviation((double)n);
    }
}

/**
 * Verify harmonic integrity for data validation
 * @param fundamental Test fundamental frequency
 * @return 1 if verified, 0 if failed
 */
int verify_harmonic_integrity(double fundamental) {
    double expected_harmonics[] = {440.0, 880.0, 1320.0, 1760.0, 2200.0, 
                                 2640.0, 3080.0, 3520.0, 3960.0, 4400.0};
    
    for (int i = 0; i < 10; i++) {
        double calculated = harmonic_frequency(fundamental, i + 1);
        if (fabs(calculated - expected_harmonics[i]) > 0.01) {
            printf("Harmonic %d failed: %.2f != %.2f\\n", 
                   i + 1, calculated, expected_harmonics[i]);
            return 0;
        }
    }
    
    // Test mathematical harmonic series
    double h5 = harmonic_number(5);
    double expected_h5 = 1.0 + 1.0/2.0 + 1.0/3.0 + 1.0/4.0 + 1.0/5.0;
    
    if (fabs(h5 - expected_h5) > 0.000001) {
        printf("H5 failed: %.6f != %.6f\\n", h5, expected_h5);
        return 0;
    }
    
    printf("All harmonic calculations verified successfully!\\n");
    return 1;
}

/**
 * Example usage and testing
 */
int main() {
    printf("Harmonic Processing Library - C Implementation\\n");
    printf("============================================\\n");
    
    // Test basic harmonic calculations
    double fundamental = 440.0;  // A440
    
    printf("\\nFirst 16 Harmonics of A440:\\n");
    printf("%-8s %-12s %-8s %-8s\\n", "Harmonic", "Frequency", "Ratio", "Cents");
    printf("----------------------------------------\\n");
    
    for (int n = 1; n <= 16; n++) {
        double freq = harmonic_frequency(fundamental, n);
        double cents = cents_deviation((double)n);
        double math_h = harmonic_number(n);
        
        printf("%-8d %-12.1f %-8.0f %-8.1f\\n", n, freq, (double)n, cents);
    }
    
    // Verify integrity
    printf("\\n");
    verify_harmonic_integrity(fundamental);
    
    return 0;
}
"""
    return c_code


def generate_java_implementation() -> str:
    """Generate Java implementation of harmonic calculations"""
    java_code = """
/**
 * Harmonic Processing Library - Java Implementation
 * Author: Scott Charles Olson, "Charly"
 * Date: August 24, 2025
 * 
 * Core harmonic frequency calculations and mathematical harmonic series
 * Formula: f_n = n × f₀ (for frequency harmonics)
 * Formula: H_n = Σ(1/k) for k=1 to n (for mathematical harmonic series)
 */

import java.util.*;

public class HarmonicProcessor {
    
    private int sampleRate;
    private double soundSpeed;
    
    /**
     * Constructor
     * @param sampleRate Sample rate in Hz
     */
    public HarmonicProcessor(int sampleRate) {
        this.sampleRate = sampleRate;
        this.soundSpeed = 343.0; // m/s at 20°C
    }
    
    /**
     * Default constructor with 44.1kHz sample rate
     */
    public HarmonicProcessor() {
        this(44100);
    }
    
    /**
     * Calculate nth harmonic frequency
     * @param fundamental Base frequency in Hz
     * @param n Harmonic number
     * @return nth harmonic frequency
     */
    public static double harmonicFrequency(double fundamental, int n) {
        return fundamental * n;
    }
    
    /**
     * Calculate nth harmonic number (mathematical harmonic series)
     * @param n Number of terms
     * @return Sum of reciprocals H_n = 1 + 1/2 + 1/3 + ... + 1/n
     */
    public static double harmonicNumber(int n) {
        double sum = 0.0;
        for (int i = 1; i <= n; i++) {
            sum += 1.0 / i;
        }
        return sum;
    }
    
    /**
     * Calculate nth harmonic number recursively
     * @param n Number of terms
     * @return Sum of reciprocals calculated recursively
     */
    public static double harmonicNumberRecursive(int n) {
        if (n == 1) {
            return 1.0;
        }
        return 1.0 / n + harmonicNumberRecursive(n - 1);
    }
    
    /**
     * Calculate cents deviation from equal temperament
     * @param ratio Frequency ratio
     * @return Deviation in cents
     */
    public static double centsDeviation(double ratio) {
        return 1200.0 * Math.log(ratio) / Math.log(2.0);
    }
    
    /**
     * Generate complete harmonic series
     * @param fundamentalFrequency Base frequency in Hz
     * @param maxHarmonic Maximum harmonic number
     * @return Map containing harmonic data
     */
    public Map<Integer, Map<String, Object>> generateHarmonicSeries(
            double fundamentalFrequency, int maxHarmonic) {
        
        Map<Integer, Map<String, Object>> harmonics = new HashMap<>();
        
        for (int n = 1; n <= maxHarmonic; n++) {
            Map<String, Object> harmonicData = new HashMap<>();
            
            double frequency = harmonicFrequency(fundamentalFrequency, n);
            double centsFromFundamental = centsDeviation((double)n);
            int octave = (int)(Math.log(n) / Math.log(2));
            double mathematicalHarmonic = harmonicNumber(n);
            
            harmonicData.put("harmonic_number", n);
            harmonicData.put("frequency", Math.round(frequency * 1000.0) / 1000.0);
            harmonicData.put("ratio", n + ":1");
            harmonicData.put("ratio_decimal", (double)n);
            harmonicData.put("cents_from_fundamental", 
                           Math.round(centsFromFundamental * 100.0) / 100.0);
            harmonicData.put("octave", octave);
            harmonicData.put("mathematical_harmonic", 
                           Math.round(mathematicalHarmonic * 1000000.0) / 1000000.0);
            
            harmonics.put(n, harmonicData);
        }
        
        return harmonics;
    }
    
    /**
     * Get just intonation intervals based on harmonic ratios
     * @return Map of just intonation intervals
     */
    public Map<String, Map<String, Object>> getJustIntonationIntervals() {
        Map<String, Map<String, Object>> intervals = new HashMap<>();
        
        // Define intervals
        String[] names = {"unison", "minor_2nd", "major_2nd", "minor_3rd", "major_3rd",
                         "perfect_4th", "tritone", "perfect_5th", "minor_6th", "major_6th",
                         "minor_7th", "major_7th", "octave"};
        
        String[] ratios = {"1:1", "16:15", "9:8", "6:5", "5:4", "4:3", "11:8", 
                          "3:2", "8:5", "5:3", "7:4", "15:8", "2:1"};
        
        double[] decimals = {1.0000, 1.0667, 1.1250, 1.2000, 1.2500, 1.3333, 1.3750,
                           1.5000, 1.6000, 1.6667, 1.7500, 1.8750, 2.0000};
        
        double[] cents = {0.0, 111.7, 203.9, 315.6, 386.3, 498.0, 551.3,
                        702.0, 813.7, 884.4, 968.8, 1088.3, 1200.0};
        
        for (int i = 0; i < names.length; i++) {
            Map<String, Object> intervalData = new HashMap<>();
            intervalData.put("ratio", ratios[i]);
            intervalData.put("decimal", decimals[i]);
            intervalData.put("cents", cents[i]);
            intervals.put(names[i], intervalData);
        }
        
        return intervals;
    }
    
    /**
     * Verify harmonic integrity for data validation
     * @param fundamental Test fundamental frequency
     * @return true if verified, false if failed
     */
    public boolean verifyHarmonicIntegrity(double fundamental) {
        double[] expectedHarmonics = {440.0, 880.0, 1320.0, 1760.0, 2200.0,
                                    2640.0, 3080.0, 3520.0, 3960.0, 4400.0};
        
        for (int i = 0; i < expectedHarmonics.length; i++) {
            double calculated = harmonicFrequency(fundamental, i + 1);
            if (Math.abs(calculated - expectedHarmonics[i]) > 0.01) {
                System.out.printf("Harmonic %d failed: %.2f != %.2f%n",
                                i + 1, calculated, expectedHarmonics[i]);
                return false;
            }
        }
        
        // Test mathematical harmonic series
        double h5 = harmonicNumber(5);
        double expectedH5 = 1.0 + 1.0/2.0 + 1.0/3.0 + 1.0/4.0 + 1.0/5.0;
        
        if (Math.abs(h5 - expectedH5) > 0.000001) {
            System.out.printf("H5 failed: %.6f != %.6f%n", h5, expectedH5);
            return false;
        }
        
        System.out.println("All harmonic calculations verified successfully!");
        return true;
    }
    
    /**
     * Example usage and testing
     */
    public static void main(String[] args) {
        System.out.println("Harmonic Processing Library - Java Implementation");
        System.out.println("===============================================");
        
        HarmonicProcessor processor = new HarmonicProcessor();
        
        // Test basic harmonic calculations
        double fundamental = 440.0; // A440
        
        System.out.println("\\nFirst 16 Harmonics of A440:");
        System.out.println("-----------------------------------------------");
        System.out.printf("%-8s %-12s %-8s %-8s %-12s%n", 
                         "Harmonic", "Frequency", "Ratio", "Cents", "Math H_n");
        System.out.println("-----------------------------------------------");
        
        Map<Integer, Map<String, Object>> harmonics = 
            processor.generateHarmonicSeries(fundamental, 16);
        
        for (int n = 1; n <= 16; n++) {
            Map<String, Object> h = harmonics.get(n);
            System.out.printf("%-8d %-12.1f %-8s %-8.1f %-12.6f%n",
                            n, 
                            (Double)h.get("frequency"),
                            (String)h.get("ratio"),
                            (Double)h.get("cents_from_fundamental"),
                            (Double)h.get("mathematical_harmonic"));
        }
        
        // Verify integrity
        System.out.println();
        processor.verifyHarmonicIntegrity(fundamental);
    }
}
"""
    return java_code


def save_cross_language_implementations():
    """Save C and Java implementations to files"""
    
    # Create cross-language directory
    cross_lang_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'cross_language')
    os.makedirs(cross_lang_dir, exist_ok=True)
    
    # Save C implementation
    c_file_path = os.path.join(cross_lang_dir, 'harmonic_processor.c')
    with open(c_file_path, 'w') as f:
        f.write(generate_c_implementation())
    
    # Save Java implementation  
    java_file_path = os.path.join(cross_lang_dir, 'HarmonicProcessor.java')
    with open(java_file_path, 'w') as f:
        f.write(generate_java_implementation())
    
    print(f"Generated C implementation: {c_file_path}")
    print(f"Generated Java implementation: {java_file_path}")
    
    return c_file_path, java_file_path


if __name__ == "__main__":
    print("Cross-Language Harmonic Implementations")
    print("=" * 50)
    
    c_path, java_path = save_cross_language_implementations()
    
    print("\nCross-language implementations generated successfully!")
    print("These implementations provide identical harmonic calculation")
    print("functionality in C and Java for maximum compatibility.")