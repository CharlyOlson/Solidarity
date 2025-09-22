"""
Dynamic Audio Processing - Compression and Expansion
Author: Scott Charles Olson, "Charly"
Date: August 24, 2025

Dynamic compression and expansion processing with envelope following
and automatic gain control for the Solidarity platform.
"""

import numpy as np
import math
from typing import Dict, List, Tuple, Optional, Union
import warnings


class DynamicProcessor:
    """
    Dynamic audio processor implementing compression and expansion
    with configurable attack, release, ratio, and threshold parameters.
    """
    
    def __init__(self, 
                 threshold: float = -20.0,
                 ratio: float = 4.0,
                 attack: float = 0.003,
                 release: float = 0.3,
                 makeup_gain: float = 0.0,
                 sample_rate: int = 44100):
        """
        Initialize dynamic processor
        
        Args:
            threshold (float): Threshold level in dB
            ratio (float): Compression/expansion ratio
            attack (float): Attack time in seconds
            release (float): Release time in seconds
            makeup_gain (float): Makeup gain in dB
            sample_rate (int): Sample rate in Hz
        """
        self.threshold = threshold
        self.ratio = ratio
        self.attack = attack
        self.release = release
        self.makeup_gain = makeup_gain
        self.sample_rate = sample_rate
        
        # Internal state
        self.envelope = 0.0
        self.gain_reduction = 0.0
        
        # Pre-compute envelope coefficients for efficiency
        self._update_envelope_coefficients()
    
    def _update_envelope_coefficients(self):
        """Update envelope following coefficients based on attack/release times"""
        self.attack_coeff = math.exp(-1.0 / (self.sample_rate * self.attack)) if self.attack > 0 else 0.0
        self.release_coeff = math.exp(-1.0 / (self.sample_rate * self.release)) if self.release > 0 else 0.0
    
    def _db_to_linear(self, db: float) -> float:
        """Convert dB to linear scale"""
        return 10.0 ** (db / 20.0)
    
    def _linear_to_db(self, linear: float) -> float:
        """Convert linear scale to dB"""
        return 20.0 * math.log10(max(linear, 1e-10))
    
    def process_compression(self, signal: np.ndarray) -> np.ndarray:
        """
        Apply dynamic compression to input signal
        
        Args:
            signal (np.ndarray): Input audio signal
            
        Returns:
            np.ndarray: Compressed audio signal
        """
        compressed = np.zeros_like(signal, dtype=np.float64)
        
        for i, sample in enumerate(signal):
            # Calculate input level in dB
            input_level_linear = abs(sample)
            input_level_db = self._linear_to_db(input_level_linear)
            
            # Calculate gain reduction needed
            if input_level_db > self.threshold:
                # Signal above threshold - apply compression
                excess_db = input_level_db - self.threshold
                target_gain_reduction = excess_db * (1.0 - 1.0/self.ratio)
            else:
                # Signal below threshold - no compression
                target_gain_reduction = 0.0
            
            # Apply envelope following (attack/release)
            if target_gain_reduction > self.gain_reduction:
                # Attacking - use attack time
                self.gain_reduction = (self.attack_coeff * self.gain_reduction + 
                                     (1.0 - self.attack_coeff) * target_gain_reduction)
            else:
                # Releasing - use release time  
                self.gain_reduction = (self.release_coeff * self.gain_reduction + 
                                     (1.0 - self.release_coeff) * target_gain_reduction)
            
            # Calculate total gain (gain reduction + makeup gain)
            total_gain_db = -self.gain_reduction + self.makeup_gain
            total_gain_linear = self._db_to_linear(total_gain_db)
            
            # Apply gain to sample
            compressed[i] = sample * total_gain_linear
        
        return compressed
    
    def process_expansion(self, signal: np.ndarray) -> np.ndarray:
        """
        Apply dynamic expansion to input signal
        
        Args:
            signal (np.ndarray): Input audio signal
            
        Returns:
            np.ndarray: Expanded audio signal
        """
        expanded = np.zeros_like(signal, dtype=np.float64)
        
        for i, sample in enumerate(signal):
            # Calculate input level in dB
            input_level_linear = abs(sample)
            input_level_db = self._linear_to_db(input_level_linear)
            
            # Calculate gain reduction needed for expansion
            if input_level_db < self.threshold:
                # Signal below threshold - apply expansion
                deficit_db = self.threshold - input_level_db
                target_gain_reduction = deficit_db * (self.ratio - 1.0)
            else:
                # Signal above threshold - no expansion
                target_gain_reduction = 0.0
            
            # Apply envelope following (attack/release)
            if target_gain_reduction > self.gain_reduction:
                # Attacking - use attack time
                self.gain_reduction = (self.attack_coeff * self.gain_reduction + 
                                     (1.0 - self.attack_coeff) * target_gain_reduction)
            else:
                # Releasing - use release time
                self.gain_reduction = (self.release_coeff * self.gain_reduction + 
                                     (1.0 - self.release_coeff) * target_gain_reduction)
            
            # Calculate total gain (negative gain reduction for expansion)
            total_gain_db = -self.gain_reduction + self.makeup_gain
            total_gain_linear = self._db_to_linear(total_gain_db)
            
            # Apply gain to sample
            expanded[i] = sample * total_gain_linear
        
        return expanded
    
    def process_limiter(self, signal: np.ndarray, ceiling: float = -0.1) -> np.ndarray:
        """
        Apply hard limiting to prevent signal from exceeding ceiling
        
        Args:
            signal (np.ndarray): Input audio signal
            ceiling (float): Maximum level in dB
            
        Returns:
            np.ndarray: Limited audio signal
        """
        ceiling_linear = self._db_to_linear(ceiling)
        limited = np.zeros_like(signal, dtype=np.float64)
        
        for i, sample in enumerate(signal):
            # Hard limit if sample exceeds ceiling
            if abs(sample) > ceiling_linear:
                limited[i] = np.sign(sample) * ceiling_linear
            else:
                limited[i] = sample
        
        return limited
    
    def process_gate(self, signal: np.ndarray, gate_threshold: float = -40.0) -> np.ndarray:
        """
        Apply noise gate to attenuate signal below threshold
        
        Args:
            signal (np.ndarray): Input audio signal
            gate_threshold (float): Gate threshold in dB
            
        Returns:
            np.ndarray: Gated audio signal
        """
        gated = np.zeros_like(signal, dtype=np.float64)
        gate_threshold_linear = self._db_to_linear(gate_threshold)
        
        for i, sample in enumerate(signal):
            input_level = abs(sample)
            
            if input_level > gate_threshold_linear:
                # Signal above gate threshold - pass through
                target_gain = 1.0
            else:
                # Signal below gate threshold - attenuate heavily
                target_gain = 0.1  # -20 dB attenuation
            
            # Apply envelope following for smooth gate operation
            if target_gain > self.envelope:
                # Gate opening - use attack time
                self.envelope = (self.attack_coeff * self.envelope + 
                               (1.0 - self.attack_coeff) * target_gain)
            else:
                # Gate closing - use release time
                self.envelope = (self.release_coeff * self.envelope + 
                               (1.0 - self.release_coeff) * target_gain)
            
            # Apply gain to sample
            gated[i] = sample * self.envelope
        
        return gated
    
    def analyze_dynamics(self, signal: np.ndarray) -> Dict:
        """
        Analyze dynamic characteristics of the signal
        
        Args:
            signal (np.ndarray): Input audio signal
            
        Returns:
            Dict: Dynamic analysis results
        """
        # Calculate RMS level over time (using windows)
        window_size = int(0.1 * self.sample_rate)  # 100ms windows
        hop_size = window_size // 4
        
        rms_values = []
        peak_values = []
        
        for i in range(0, len(signal) - window_size, hop_size):
            window = signal[i:i + window_size]
            rms = np.sqrt(np.mean(window ** 2))
            peak = np.max(np.abs(window))
            
            rms_values.append(rms)
            peak_values.append(peak)
        
        rms_values = np.array(rms_values)
        peak_values = np.array(peak_values)
        
        # Calculate dynamic range metrics
        overall_rms = np.sqrt(np.mean(signal ** 2))
        overall_peak = np.max(np.abs(signal))
        
        # Crest factor (peak-to-RMS ratio)
        crest_factor_linear = overall_peak / (overall_rms + 1e-10)
        crest_factor_db = 20 * np.log10(crest_factor_linear)
        
        # Dynamic range (difference between loudest and quietest parts)
        if len(rms_values) > 0:
            dynamic_range_db = 20 * np.log10(np.max(rms_values) / (np.min(rms_values) + 1e-10))
        else:
            dynamic_range_db = 0.0
        
        return {
            'overall_rms_db': round(20 * np.log10(overall_rms + 1e-10), 2),
            'overall_peak_db': round(20 * np.log10(overall_peak + 1e-10), 2),
            'crest_factor_db': round(crest_factor_db, 2),
            'dynamic_range_db': round(dynamic_range_db, 2),
            'rms_values': rms_values,
            'peak_values': peak_values
        }
    
    def get_gain_reduction_curve(self, input_levels_db: np.ndarray) -> np.ndarray:
        """
        Get the gain reduction curve for visualization
        
        Args:
            input_levels_db (np.ndarray): Array of input levels in dB
            
        Returns:
            np.ndarray: Corresponding gain reduction values in dB
        """
        gain_reduction_curve = np.zeros_like(input_levels_db)
        
        for i, input_db in enumerate(input_levels_db):
            if input_db > self.threshold:
                excess_db = input_db - self.threshold
                gain_reduction_curve[i] = excess_db * (1.0 - 1.0/self.ratio)
            else:
                gain_reduction_curve[i] = 0.0
        
        return gain_reduction_curve
    
    def reset_state(self):
        """Reset internal processor state"""
        self.envelope = 0.0
        self.gain_reduction = 0.0


# Example usage and testing
if __name__ == "__main__":
    # Create test signal with varying dynamics
    sample_rate = 44100
    duration = 2.0
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Create signal with quiet and loud sections
    signal_test = np.concatenate([
        0.1 * np.sin(2 * np.pi * 440 * t[:len(t)//4]),      # Quiet section
        0.8 * np.sin(2 * np.pi * 440 * t[len(t)//4:3*len(t)//4]),  # Loud section  
        0.3 * np.sin(2 * np.pi * 440 * t[3*len(t)//4:])     # Medium section
    ])
    
    # Initialize processor
    processor = DynamicProcessor(
        threshold=-20.0,
        ratio=4.0,
        attack=0.010,  # 10ms attack
        release=0.100,  # 100ms release
        makeup_gain=6.0,
        sample_rate=sample_rate
    )
    
    print("Dynamic Audio Processing Test")
    print("=" * 40)
    
    # Analyze original signal
    original_analysis = processor.analyze_dynamics(signal_test)
    print(f"Original Signal:")
    print(f"  RMS Level: {original_analysis['overall_rms_db']:.1f} dB")
    print(f"  Peak Level: {original_analysis['overall_peak_db']:.1f} dB")
    print(f"  Crest Factor: {original_analysis['crest_factor_db']:.1f} dB")
    print(f"  Dynamic Range: {original_analysis['dynamic_range_db']:.1f} dB")
    
    # Apply compression
    compressed_signal = processor.process_compression(signal_test)
    processor.reset_state()  # Reset for next test
    
    compressed_analysis = processor.analyze_dynamics(compressed_signal)
    print(f"\nAfter Compression (4:1 ratio, -20dB threshold):")
    print(f"  RMS Level: {compressed_analysis['overall_rms_db']:.1f} dB")
    print(f"  Peak Level: {compressed_analysis['overall_peak_db']:.1f} dB")
    print(f"  Crest Factor: {compressed_analysis['crest_factor_db']:.1f} dB")
    print(f"  Dynamic Range: {compressed_analysis['dynamic_range_db']:.1f} dB")
    
    # Apply expansion
    expanded_signal = processor.process_expansion(signal_test)
    processor.reset_state()
    
    expanded_analysis = processor.analyze_dynamics(expanded_signal)
    print(f"\nAfter Expansion (4:1 ratio, -20dB threshold):")
    print(f"  RMS Level: {expanded_analysis['overall_rms_db']:.1f} dB")
    print(f"  Peak Level: {expanded_analysis['overall_peak_db']:.1f} dB")
    print(f"  Crest Factor: {expanded_analysis['crest_factor_db']:.1f} dB")
    print(f"  Dynamic Range: {expanded_analysis['dynamic_range_db']:.1f} dB")
    
    print("\nDynamic processing test completed successfully!")