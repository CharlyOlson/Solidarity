
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
            printf("Harmonic %d failed: %.2f != %.2f\n", 
                   i + 1, calculated, expected_harmonics[i]);
            return 0;
        }
    }
    
    // Test mathematical harmonic series
    double h5 = harmonic_number(5);
    double expected_h5 = 1.0 + 1.0/2.0 + 1.0/3.0 + 1.0/4.0 + 1.0/5.0;
    
    if (fabs(h5 - expected_h5) > 0.000001) {
        printf("H5 failed: %.6f != %.6f\n", h5, expected_h5);
        return 0;
    }
    
    printf("All harmonic calculations verified successfully!\n");
    return 1;
}

/**
 * Example usage and testing
 */
int main() {
    printf("Harmonic Processing Library - C Implementation\n");
    printf("============================================\n");
    
    // Test basic harmonic calculations
    double fundamental = 440.0;  // A440
    
    printf("\nFirst 16 Harmonics of A440:\n");
    printf("%-8s %-12s %-8s %-8s\n", "Harmonic", "Frequency", "Ratio", "Cents");
    printf("----------------------------------------\n");
    
    for (int n = 1; n <= 16; n++) {
        double freq = harmonic_frequency(fundamental, n);
        double cents = cents_deviation((double)n);
        double math_h = harmonic_number(n);
        
        printf("%-8d %-12.1f %-8.0f %-8.1f\n", n, freq, (double)n, cents);
    }
    
    // Verify integrity
    printf("\n");
    verify_harmonic_integrity(fundamental);
    
    return 0;
}
