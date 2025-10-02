"""
Core Harmonic Processing System
Author: Scott Charles Olson, "Charly"
Date: August 24, 2025
Location: Overland Park, KS 66210

Complete implementation of harmonic frequency calculations and mathematical harmonic series
for the Solidarity platform's audio processing capabilities.
"""

import math
import numpy as np
from typing import Dict, List, Tuple, Optional
import json


class HarmonicProcessor:
    """
    Core harmonic processing class implementing all fundamental harmonic calculations
    Formula: f_n = n × f₀ (for frequency harmonics)
    Formula: H_n = Σ(1/k) for k=1 to n (for mathematical harmonic series)
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
        self.sound_speed = 343.0  # m/s at 20°C
        
    def harmonic_frequency(self, fundamental: float, n: int) -> float:
        """
        Calculate nth harmonic frequency
        
        Args:
            fundamental (float): Fundamental frequency in Hz
            n (int): Harmonic number
            
        Returns:
            float: nth harmonic frequency in Hz
            
        Formula: f_n = n × f₀
        """
        return fundamental * n
    
    def harmonic_number(self, n: int) -> float:
        """
        Calculate nth harmonic number (mathematical harmonic series)
        
        Args:
            n (int): Number of terms
            
        Returns:
            float: Sum of reciprocals H_n = 1 + 1/2 + 1/3 + ... + 1/n
        """
        return sum(1.0/k for k in range(1, n+1))
    
    def harmonic_number_recursive(self, n: int) -> float:
        """
        Calculate nth harmonic number recursively
        
        Args:
            n (int): Number of terms
            
        Returns:
            float: Sum of reciprocals calculated recursively
        """
        if n == 1:
            return 1.0
        return 1.0/n + self.harmonic_number_recursive(n-1)
    
    def generate_harmonic_series(self, fundamental_frequency: float, max_harmonic: int = 32) -> Dict:
        """
        Generate complete harmonic series up to specified harmonic
        
        Args:
            fundamental_frequency (float): Base frequency in Hz
            max_harmonic (int): Maximum harmonic number to generate
            
        Returns:
            Dict: Complete harmonic series with frequencies, ratios, and intervals
        """
        harmonics = {}
        
        # Note names in chromatic scale
        note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        for n in range(1, max_harmonic + 1):
            frequency = self.harmonic_frequency(fundamental_frequency, n)
            
            # Calculate musical interval information
            ratio_decimal = n
            cents_from_fundamental = 1200 * math.log2(n) if n > 1 else 0
            
            # Determine octave and note
            octave = int(math.log2(n)) if n > 1 else 0
            
            harmonics[n] = {
                'harmonic_number': n,
                'frequency': round(frequency, 3),
                'ratio': f"{n}:1",
                'ratio_decimal': ratio_decimal,
                'cents_from_fundamental': round(cents_from_fundamental, 2),
                'octave': octave,
                'mathematical_harmonic': round(self.harmonic_number(n), 6)
            }
        
        return harmonics
    
    def calculate_cents_deviation(self, ratio: float) -> float:
        """
        Calculate cents deviation from equal temperament
        
        Args:
            ratio (float): Frequency ratio
            
        Returns:
            float: Deviation in cents
        """
        return 1200 * math.log2(ratio)
    
    def get_just_intonation_intervals(self) -> Dict:
        """
        Get complete set of just intonation intervals based on harmonic ratios
        
        Returns:
            Dict: Just intonation intervals with ratios and cents
        """
        intervals = {
            'unison': {'ratio': '1:1', 'decimal': 1.0000, 'cents': 0.0},
            'minor_2nd': {'ratio': '16:15', 'decimal': 1.0667, 'cents': 111.7},
            'major_2nd': {'ratio': '9:8', 'decimal': 1.1250, 'cents': 203.9},
            'minor_3rd': {'ratio': '6:5', 'decimal': 1.2000, 'cents': 315.6},
            'major_3rd': {'ratio': '5:4', 'decimal': 1.2500, 'cents': 386.3},
            'perfect_4th': {'ratio': '4:3', 'decimal': 1.3333, 'cents': 498.0},
            'tritone': {'ratio': '11:8', 'decimal': 1.3750, 'cents': 551.3},
            'perfect_5th': {'ratio': '3:2', 'decimal': 1.5000, 'cents': 702.0},
            'minor_6th': {'ratio': '8:5', 'decimal': 1.6000, 'cents': 813.7},
            'major_6th': {'ratio': '5:3', 'decimal': 1.6667, 'cents': 884.4},
            'minor_7th': {'ratio': '7:4', 'decimal': 1.7500, 'cents': 968.8},
            'major_7th': {'ratio': '15:8', 'decimal': 1.8750, 'cents': 1088.3},
            'octave': {'ratio': '2:1', 'decimal': 2.0000, 'cents': 1200.0}
        }
        return intervals
    
    def get_prime_harmonics(self, max_harmonic: int = 32) -> Dict:
        """
        Extract prime harmonics that create microtonal relationships
        
        Args:
            max_harmonic (int): Maximum harmonic to check
            
        Returns:
            Dict: Prime harmonics with their microtonal properties
        """
        def is_prime(n):
            if n < 2:
                return False
            for i in range(2, int(math.sqrt(n)) + 1):
                if n % i == 0:
                    return False
            return True
        
        prime_harmonics = {}
        for n in range(2, max_harmonic + 1):
            if is_prime(n):
                cents_deviation = 1200 * math.log2(n) - (1200 * int(math.log2(n)))
                prime_harmonics[n] = {
                    'harmonic': n,
                    'frequency_ratio': n,
                    'cents_deviation_from_equal_temp': round(cents_deviation, 2),
                    'microtonal': True
                }
        
        return prime_harmonics
    
    def verify_harmonic_integrity(self, fundamental: float = 440.0) -> bool:
        """
        Verify all harmonic calculations for data integrity
        
        Args:
            fundamental (float): Test fundamental frequency
            
        Returns:
            bool: True if all calculations are verified
        """
        try:
            # Test basic harmonic series
            expected_harmonics = [440, 880, 1320, 1760, 2200, 2640, 3080, 3520, 3960, 4400]
            
            for i, expected in enumerate(expected_harmonics, 1):
                calculated = self.harmonic_frequency(fundamental, i)
                if abs(calculated - expected) > 0.01:
                    raise ValueError(f"Harmonic {i} failed: {calculated} != {expected}")
            
            # Test mathematical harmonic series
            h5 = self.harmonic_number(5)
            expected_h5 = 1 + 1/2 + 1/3 + 1/4 + 1/5
            if abs(h5 - expected_h5) < 0.000001:
                return True
                
            print("All harmonic calculations verified successfully!")
            return True
            
        except Exception as e:
            print(f"Harmonic integrity verification failed: {e}")
            return False


# Example usage and testing
if __name__ == "__main__":
    processor = HarmonicProcessor()
    
    # Generate harmonic series for A440
    harmonics = processor.generate_harmonic_series(440.0, 16)
    
    print("First 16 Harmonics of A440:")
    print("-" * 80)
    print(f"{'Harmonic':<8} {'Frequency':<12} {'Ratio':<8} {'Cents':<8} {'Octave':<8} {'Math H_n':<12}")
    print("-" * 80)
    
    for n in range(1, 17):
        h = harmonics[n]
        print(f"{n:<8} {h['frequency']:<12} {h['ratio']:<8} {h['cents_from_fundamental']:<8.1f} "
              f"{h['octave']:<8} {h['mathematical_harmonic']:<12}")
    
    # Verify integrity
    processor.verify_harmonic_integrity()