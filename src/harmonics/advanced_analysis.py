"""
Advanced Harmonic Analysis
Author: Scott Charles Olson, "Charly"
Date: August 24, 2025

Advanced FFT-based harmonic analysis, Harmonic Product Spectrum (HPS),
Total Harmonic Distortion (THD), and Autocorrelation pitch detection
"""

import numpy as np
import math
from scipy import signal
from scipy.fft import fft, fftfreq, ifft
from typing import Dict, List, Tuple, Optional, Union
import warnings


class AdvancedHarmonicAnalyzer:
    """
    Advanced harmonic analysis using FFT, HPS, THD calculation, and pitch detection
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
        self.nyquist = sample_rate // 2
        
    def analyze_harmonics_fft(self, signal_data: np.ndarray, fundamental_freq: float, 
                            max_harmonics: int = 20) -> Dict:
        """
        Analyze harmonic content using FFT
        
        Args:
            signal_data (np.ndarray): Input audio signal
            fundamental_freq (float): Expected fundamental frequency
            max_harmonics (int): Number of harmonics to analyze
            
        Returns:
            Dict: Harmonic analysis results with magnitudes and phases
        """
        # Apply Hanning window to reduce spectral leakage
        windowed = signal_data * np.hanning(len(signal_data))
        
        # Compute FFT
        fft_result = fft(windowed)
        fft_magnitude = np.abs(fft_result)
        fft_phase = np.angle(fft_result)
        freqs = fftfreq(len(signal_data), 1/self.sample_rate)
        
        # Only use positive frequencies
        positive_freqs = freqs[:len(freqs)//2]
        positive_magnitudes = fft_magnitude[:len(fft_magnitude)//2]
        positive_phases = fft_phase[:len(fft_phase)//2]
        
        harmonics = {}
        
        for n in range(1, max_harmonics + 1):
            target_freq = fundamental_freq * n
            
            # Skip if target frequency exceeds Nyquist
            if target_freq >= self.nyquist:
                break
                
            # Find closest frequency bin
            bin_idx = np.argmin(np.abs(positive_freqs - target_freq))
            actual_freq = positive_freqs[bin_idx]
            
            # Calculate frequency accuracy
            freq_error = abs(actual_freq - target_freq)
            freq_error_cents = 1200 * np.log2(actual_freq / target_freq) if target_freq > 0 else 0
            
            harmonics[n] = {
                'harmonic_number': n,
                'target_frequency': target_freq,
                'actual_frequency': round(actual_freq, 3),
                'frequency_error': round(freq_error, 3),
                'frequency_error_cents': round(freq_error_cents, 2),
                'magnitude': round(positive_magnitudes[bin_idx], 6),
                'magnitude_db': round(20 * np.log10(positive_magnitudes[bin_idx] + 1e-10), 2),
                'phase': round(positive_phases[bin_idx], 4),
                'bin_index': bin_idx
            }
        
        return harmonics
    
    def harmonic_product_spectrum(self, signal_data: np.ndarray, 
                                max_harmonics: int = 5) -> float:
        """
        Estimate fundamental frequency using Harmonic Product Spectrum (HPS) algorithm
        
        Args:
            signal_data (np.ndarray): Input audio signal
            max_harmonics (int): Number of harmonics to use in product
            
        Returns:
            float: Estimated fundamental frequency
        """
        # Apply window and compute spectrum
        windowed = signal_data * np.hanning(len(signal_data))
        spectrum = np.abs(fft(windowed))
        spectrum = spectrum[:len(spectrum)//2]  # Keep only positive frequencies
        
        # Initialize HPS with the original spectrum
        hps = spectrum.copy()
        
        # Multiply downsampled versions of the spectrum
        for h in range(2, max_harmonics + 1):
            # Downsample spectrum by factor of h
            downsampled_length = len(spectrum) // h
            downsampled = spectrum[:downsampled_length * h:h]
            
            # Multiply with HPS (truncate to shorter length)
            min_length = min(len(hps), len(downsampled))
            hps = hps[:min_length] * downsampled[:min_length]
        
        # Find peak in HPS
        peak_bin = np.argmax(hps)
        freq_resolution = self.sample_rate / len(signal_data)
        fundamental_freq = peak_bin * freq_resolution
        
        return fundamental_freq
    
    def calculate_total_harmonic_distortion(self, signal_data: np.ndarray, 
                                          fundamental_freq: float,
                                          max_harmonics: int = 10) -> Dict:
        """
        Calculate Total Harmonic Distortion (THD)
        
        Args:
            signal_data (np.ndarray): Input audio signal
            fundamental_freq (float): Fundamental frequency
            max_harmonics (int): Number of harmonics to include in THD calculation
            
        Returns:
            Dict: THD analysis results
        """
        # Analyze harmonics
        harmonic_analysis = self.analyze_harmonics_fft(signal_data, fundamental_freq, max_harmonics)
        
        # Get fundamental power (first harmonic)
        fundamental_power = harmonic_analysis[1]['magnitude'] ** 2
        
        # Calculate total harmonic power (2nd harmonic and above)
        harmonic_powers = []
        for harmonic_num in range(2, max_harmonics + 1):
            if harmonic_num in harmonic_analysis:
                power = harmonic_analysis[harmonic_num]['magnitude'] ** 2
                harmonic_powers.append(power)
        
        total_harmonic_power = sum(harmonic_powers)
        
        # Calculate THD percentage
        if fundamental_power > 0:
            thd_ratio = np.sqrt(total_harmonic_power) / np.sqrt(fundamental_power)
            thd_percent = 100 * thd_ratio
            thd_db = 20 * np.log10(thd_ratio + 1e-10)
        else:
            thd_percent = 0.0
            thd_db = -np.inf
        
        return {
            'thd_percent': round(thd_percent, 4),
            'thd_db': round(thd_db, 2),
            'fundamental_power': round(fundamental_power, 8),
            'total_harmonic_power': round(total_harmonic_power, 8),
            'individual_harmonic_powers': [round(p, 8) for p in harmonic_powers],
            'harmonics_analyzed': max_harmonics
        }
    
    def autocorrelation_pitch_detection(self, signal_data: np.ndarray,
                                      min_period: int = 50,
                                      max_period: int = 800) -> Dict:
        """
        Estimate pitch using autocorrelation method
        
        Args:
            signal_data (np.ndarray): Input audio signal
            min_period (int): Minimum period in samples
            max_period (int): Maximum period in samples
            
        Returns:
            Dict: Pitch detection results
        """
        # Compute autocorrelation
        autocorr = np.correlate(signal_data, signal_data, mode='full')
        autocorr = autocorr[len(autocorr)//2:]  # Keep only positive lags
        
        # Apply period constraints
        autocorr_constrained = autocorr[min_period:min(max_period, len(autocorr))]
        
        if len(autocorr_constrained) == 0:
            return {
                'fundamental_frequency': 0.0,
                'confidence': 0.0,
                'period_samples': 0,
                'method': 'autocorrelation'
            }
        
        # Find peak in constrained range
        peak_index = np.argmax(autocorr_constrained) + min_period
        peak_value = autocorr[peak_index]
        
        # Calculate confidence (normalized peak value)
        max_possible = autocorr[0]  # Zero-lag autocorrelation
        confidence = peak_value / max_possible if max_possible > 0 else 0.0
        
        # Calculate fundamental frequency
        fundamental_freq = self.sample_rate / peak_index if peak_index > 0 else 0.0
        
        return {
            'fundamental_frequency': round(fundamental_freq, 3),
            'confidence': round(confidence, 4),
            'period_samples': peak_index,
            'period_seconds': round(peak_index / self.sample_rate, 6),
            'method': 'autocorrelation'
        }
    
    def cepstral_pitch_detection(self, signal_data: np.ndarray) -> Dict:
        """
        Estimate pitch using cepstral analysis
        
        Args:
            signal_data (np.ndarray): Input audio signal
            
        Returns:
            Dict: Cepstral pitch detection results
        """
        # Apply window
        windowed = signal_data * np.hanning(len(signal_data))
        
        # Compute power spectrum
        fft_result = fft(windowed)
        power_spectrum = np.abs(fft_result) ** 2
        
        # Compute cepstrum (IFFT of log power spectrum)
        log_power_spectrum = np.log(power_spectrum + 1e-10)
        cepstrum = np.abs(ifft(log_power_spectrum))
        
        # Only consider positive quefrencies
        half_length = len(cepstrum) // 2
        cepstrum = cepstrum[:half_length]
        
        # Find peak in cepstrum (skip very low quefrencies)
        min_quefrency = int(self.sample_rate / 800)  # Corresponds to max 800 Hz
        max_quefrency = int(self.sample_rate / 50)   # Corresponds to min 50 Hz
        
        search_range = cepstrum[min_quefrency:min(max_quefrency, len(cepstrum))]
        
        if len(search_range) == 0:
            return {
                'fundamental_frequency': 0.0,
                'confidence': 0.0,
                'quefrency': 0,
                'method': 'cepstral'
            }
        
        peak_index = np.argmax(search_range) + min_quefrency
        peak_value = cepstrum[peak_index]
        
        # Calculate fundamental frequency from quefrency
        fundamental_freq = self.sample_rate / peak_index if peak_index > 0 else 0.0
        
        # Calculate confidence
        mean_cepstrum = np.mean(cepstrum[min_quefrency:])
        confidence = peak_value / (mean_cepstrum + 1e-10) - 1.0
        confidence = max(0.0, min(1.0, confidence))  # Clamp to [0, 1]
        
        return {
            'fundamental_frequency': round(fundamental_freq, 3),
            'confidence': round(confidence, 4),
            'quefrency': peak_index,
            'quefrency_seconds': round(peak_index / self.sample_rate, 6),
            'method': 'cepstral'
        }
    
    def multi_method_pitch_detection(self, signal_data: np.ndarray) -> Dict:
        """
        Use multiple pitch detection methods and combine results
        
        Args:
            signal_data (np.ndarray): Input audio signal
            
        Returns:
            Dict: Combined pitch detection results
        """
        methods = {}
        
        # HPS method
        try:
            hps_freq = self.harmonic_product_spectrum(signal_data)
            methods['hps'] = {'frequency': hps_freq, 'confidence': 0.8}
        except Exception as e:
            methods['hps'] = {'frequency': 0.0, 'confidence': 0.0, 'error': str(e)}
        
        # Autocorrelation method
        try:
            autocorr_result = self.autocorrelation_pitch_detection(signal_data)
            methods['autocorrelation'] = autocorr_result
        except Exception as e:
            methods['autocorrelation'] = {'frequency': 0.0, 'confidence': 0.0, 'error': str(e)}
        
        # Cepstral method
        try:
            cepstral_result = self.cepstral_pitch_detection(signal_data)
            methods['cepstral'] = cepstral_result
        except Exception as e:
            methods['cepstral'] = {'frequency': 0.0, 'confidence': 0.0, 'error': str(e)}
        
        # Combine results using weighted average based on confidence
        total_weight = 0.0
        weighted_freq = 0.0
        
        for method_name, result in methods.items():
            if 'error' not in result:
                # Handle different result structures
                freq_key = 'frequency' if 'frequency' in result else 'fundamental_frequency'
                if freq_key in result and result[freq_key] > 0:
                    weight = result['confidence']
                    weighted_freq += result[freq_key] * weight
                    total_weight += weight
        
        if total_weight > 0:
            consensus_frequency = weighted_freq / total_weight
        else:
            consensus_frequency = 0.0
        
        return {
            'consensus_frequency': round(consensus_frequency, 3),
            'total_confidence': round(total_weight / len(methods), 4),
            'individual_methods': methods
        }


# Example usage and testing
if __name__ == "__main__":
    analyzer = AdvancedHarmonicAnalyzer()
    
    # Generate test signal (A440 with harmonics)
    duration = 1.0  # seconds
    sample_rate = 44100
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Create signal with fundamental and several harmonics
    fundamental = 440.0
    signal_test = (np.sin(2 * np.pi * fundamental * t) +
                  0.5 * np.sin(2 * np.pi * 2 * fundamental * t) +
                  0.3 * np.sin(2 * np.pi * 3 * fundamental * t) +
                  0.2 * np.sin(2 * np.pi * 4 * fundamental * t))
    
    # Add some noise
    signal_test += 0.05 * np.random.randn(len(signal_test))
    
    print("Advanced Harmonic Analysis Results")
    print("=" * 50)
    
    # Analyze harmonics
    harmonics = analyzer.analyze_harmonics_fft(signal_test, fundamental, 8)
    print("\nHarmonic Analysis (FFT):")
    print(f"{'Harm':<4} {'Target':<8} {'Actual':<8} {'Mag dB':<8} {'Error':<8}")
    print("-" * 40)
    for n in range(1, 5):
        if n in harmonics:
            h = harmonics[n]
            print(f"{n:<4} {h['target_frequency']:<8.1f} {h['actual_frequency']:<8.1f} "
                  f"{h['magnitude_db']:<8.1f} {h['frequency_error_cents']:<8.2f}")
    
    # Calculate THD
    thd = analyzer.calculate_total_harmonic_distortion(signal_test, fundamental)
    print(f"\nTotal Harmonic Distortion: {thd['thd_percent']:.2f}% ({thd['thd_db']:.1f} dB)")
    
    # Multi-method pitch detection
    pitch_results = analyzer.multi_method_pitch_detection(signal_test)
    print(f"\nPitch Detection Results:")
    print(f"Consensus Frequency: {pitch_results['consensus_frequency']:.2f} Hz")
    print(f"Overall Confidence: {pitch_results['total_confidence']:.3f}")