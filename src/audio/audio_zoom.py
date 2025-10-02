"""
Audio Zoom - Beamforming and Spatial Audio Processing
Author: Scott Charles Olson, "Charly"  
Date: August 24, 2025

Advanced beamforming algorithms for spatial audio zoom ("zoomies"),
directional audio focus, and multi-microphone array processing.
"""

import numpy as np
import math
from typing import Dict, List, Tuple, Optional, Union
from scipy import signal
from scipy.spatial.distance import cdist


class AudioZoom:
    """
    Audio zoom implementation using beamforming techniques for spatial audio focus.
    Supports delay-and-sum beamforming, adaptive beamforming, and grid-based targeting.
    """
    
    def __init__(self, 
                 mic_positions: List[Tuple[float, float]], 
                 sample_rate: int = 44100,
                 sound_speed: float = 343.0):
        """
        Initialize audio zoom processor
        
        Args:
            mic_positions (List[Tuple[float, float]]): Microphone positions as (x, y) coordinates in meters
            sample_rate (int): Sample rate in Hz
            sound_speed (float): Speed of sound in m/s (343 m/s at 20°C)
        """
        self.mic_positions = np.array(mic_positions)
        self.sample_rate = sample_rate
        self.sound_speed = sound_speed
        self.num_mics = len(mic_positions)
        
        # Calculate microphone array geometry
        self._analyze_array_geometry()
        
    def _analyze_array_geometry(self):
        """Analyze microphone array geometry for beamforming optimization"""
        # Calculate center of array
        self.array_center = np.mean(self.mic_positions, axis=0)
        
        # Calculate distances between microphones
        self.mic_distances = cdist(self.mic_positions, self.mic_positions)
        
        # Maximum baseline (largest distance between any two mics)
        self.max_baseline = np.max(self.mic_distances)
        
        # Calculate array aperture (maximum extent)
        x_extent = np.max(self.mic_positions[:, 0]) - np.min(self.mic_positions[:, 0])
        y_extent = np.max(self.mic_positions[:, 1]) - np.min(self.mic_positions[:, 1])
        self.array_aperture = math.sqrt(x_extent**2 + y_extent**2)
        
    def delay_and_sum_beamformer(self, 
                               audio_signals: List[np.ndarray], 
                               target_angle: float,
                               frequency_weighting: bool = True) -> np.ndarray:
        """
        Delay-and-sum beamforming for directional audio focus
        
        Args:
            audio_signals (List[np.ndarray]): Audio signals from each microphone
            target_angle (float): Target direction in degrees (0° = front, 90° = left)
            frequency_weighting (bool): Apply frequency-dependent weighting
            
        Returns:
            np.ndarray: Beamformed audio signal focused on target direction
        """
        if len(audio_signals) != self.num_mics:
            raise ValueError(f"Expected {self.num_mics} audio signals, got {len(audio_signals)}")
        
        # Convert angle to radians
        angle_rad = math.radians(target_angle)
        direction_vector = np.array([math.cos(angle_rad), math.sin(angle_rad)])
        
        signal_length = len(audio_signals[0])
        
        # Calculate delays for each microphone
        delays_samples = []
        for mic_pos in self.mic_positions:
            # Calculate relative position from array center
            relative_pos = mic_pos - self.array_center
            
            # Project onto direction vector to get delay distance
            delay_distance = np.dot(relative_pos, direction_vector)
            
            # Convert to samples (negative because closer mics need more delay)
            delay_samples = int(-delay_distance * self.sample_rate / self.sound_speed)
            delays_samples.append(delay_samples)
        
        # Apply delays and sum
        beamformed = np.zeros(signal_length, dtype=np.float64)
        
        for i, (audio_signal, delay) in enumerate(zip(audio_signals, delays_samples)):
            # Apply delay by shifting signal
            if delay > 0:
                # Positive delay - pad beginning, truncate end
                delayed_signal = np.concatenate([np.zeros(delay), audio_signal[:-delay]])
            elif delay < 0:
                # Negative delay - truncate beginning, pad end
                delayed_signal = np.concatenate([audio_signal[-delay:], np.zeros(-delay)])
            else:
                # No delay
                delayed_signal = audio_signal
            
            # Ensure same length
            delayed_signal = delayed_signal[:signal_length]
            
            # Apply frequency weighting if enabled
            if frequency_weighting:
                # Apply mic-specific weighting based on distance from center
                mic_distance = np.linalg.norm(self.mic_positions[i] - self.array_center)
                weight = 1.0 / (1.0 + mic_distance)  # Closer mics get higher weight
            else:
                weight = 1.0
            
            beamformed += delayed_signal * weight
        
        # Normalize by number of microphones
        beamformed /= self.num_mics
        
        return beamformed
    
    def zoom_to_coordinates(self, 
                          audio_signals: List[np.ndarray],
                          target_x: float,
                          target_y: float) -> np.ndarray:
        """
        Zoom to specific coordinates in the environment
        
        Args:
            audio_signals (List[np.ndarray]): Audio signals from each microphone
            target_x (float): Target X coordinate in meters
            target_y (float): Target Y coordinate in meters
            
        Returns:
            np.ndarray: Beamformed audio focused on target coordinates
        """
        # Calculate angle from array center to target
        target_vector = np.array([target_x, target_y]) - self.array_center
        target_angle = math.degrees(math.atan2(target_vector[1], target_vector[0]))
        
        return self.delay_and_sum_beamformer(audio_signals, target_angle)
    
    def zoom_to_grid(self, 
                    audio_signals: List[np.ndarray],
                    grid_x: int,
                    grid_y: int,
                    room_width: float,
                    room_height: float,
                    grid_resolution: int = 10) -> np.ndarray:
        """
        Zoom to specific grid position in room
        
        Args:
            audio_signals (List[np.ndarray]): Audio signals from each microphone
            grid_x (int): Grid X position (0 to grid_resolution-1)
            grid_y (int): Grid Y position (0 to grid_resolution-1)
            room_width (float): Room width in meters
            room_height (float): Room height in meters
            grid_resolution (int): Number of grid divisions per axis
            
        Returns:
            np.ndarray: Beamformed audio focused on grid position
        """
        # Convert grid position to actual coordinates
        x_step = room_width / grid_resolution
        y_step = room_height / grid_resolution
        
        target_x = (grid_x + 0.5) * x_step - room_width / 2  # Center coordinates
        target_y = (grid_y + 0.5) * y_step - room_height / 2
        
        return self.zoom_to_coordinates(audio_signals, target_x, target_y)
    
    def adaptive_beamformer(self, 
                          audio_signals: List[np.ndarray],
                          target_signal: np.ndarray,
                          adaptation_rate: float = 0.01) -> np.ndarray:
        """
        Adaptive beamforming using LMS algorithm
        
        Args:
            audio_signals (List[np.ndarray]): Audio signals from each microphone
            target_signal (np.ndarray): Desired target signal for adaptation
            adaptation_rate (float): LMS adaptation rate (0.001 to 0.1)
            
        Returns:
            np.ndarray: Adaptively beamformed audio signal
        """
        if len(audio_signals) != self.num_mics:
            raise ValueError(f"Expected {self.num_mics} audio signals, got {len(audio_signals)}")
        
        signal_length = len(audio_signals[0])
        
        # Initialize weights (start with equal weighting)
        weights = np.ones(self.num_mics) / self.num_mics
        
        # Stack audio signals for processing
        signal_matrix = np.column_stack(audio_signals)
        
        beamformed = np.zeros(signal_length, dtype=np.float64)
        
        # Adaptive filtering using LMS algorithm
        for n in range(signal_length):
            # Current input vector
            input_vector = signal_matrix[n, :]
            
            # Beamformer output
            output = np.dot(weights, input_vector)
            beamformed[n] = output
            
            # Error calculation (if target signal provided)
            if n < len(target_signal):
                error = target_signal[n] - output
                
                # Update weights using LMS algorithm
                weights += adaptation_rate * error * input_vector
                
                # Normalize weights to prevent instability
                weights /= (np.linalg.norm(weights) + 1e-10)
        
        return beamformed
    
    def multi_frequency_beamformer(self, 
                                 audio_signals: List[np.ndarray],
                                 target_angle: float,
                                 frequency_bands: List[Tuple[float, float]] = None) -> np.ndarray:
        """
        Frequency-domain beamforming with different processing for each frequency band
        
        Args:
            audio_signals (List[np.ndarray]): Audio signals from each microphone
            target_angle (float): Target direction in degrees
            frequency_bands (List[Tuple[float, float]]): Frequency bands for processing
            
        Returns:
            np.ndarray: Multi-frequency beamformed audio signal
        """
        if frequency_bands is None:
            # Default frequency bands
            frequency_bands = [
                (80, 250),    # Low frequencies
                (250, 1000),  # Low-mid frequencies  
                (1000, 4000), # Mid frequencies
                (4000, 8000), # High-mid frequencies
                (8000, 20000) # High frequencies
            ]
        
        signal_length = len(audio_signals[0])
        beamformed_total = np.zeros(signal_length, dtype=np.float64)
        
        for low_freq, high_freq in frequency_bands:
            # Design bandpass filter for this frequency band
            nyquist = self.sample_rate / 2
            low_norm = low_freq / nyquist
            high_norm = min(high_freq / nyquist, 0.99)  # Avoid Nyquist frequency
            
            # Butterworth bandpass filter
            b, a = signal.butter(4, [low_norm, high_norm], btype='band')
            
            # Filter each microphone signal
            filtered_signals = []
            for audio_signal in audio_signals:
                filtered = signal.filtfilt(b, a, audio_signal)
                filtered_signals.append(filtered)
            
            # Apply beamforming to filtered signals
            beamformed_band = self.delay_and_sum_beamformer(filtered_signals, target_angle, 
                                                          frequency_weighting=True)
            
            # Add to total output
            beamformed_total += beamformed_band
        
        return beamformed_total
    
    def calculate_directivity_pattern(self, 
                                    audio_signals: List[np.ndarray],
                                    angle_resolution: int = 360) -> Tuple[np.ndarray, np.ndarray]:
        """
        Calculate directivity pattern of the microphone array
        
        Args:
            audio_signals (List[np.ndarray]): Audio signals from each microphone
            angle_resolution (int): Number of angle steps for pattern calculation
            
        Returns:
            Tuple[np.ndarray, np.ndarray]: (angles in degrees, response magnitudes)
        """
        angles = np.linspace(0, 359, angle_resolution)
        responses = np.zeros(len(angles))
        
        for i, angle in enumerate(angles):
            beamformed = self.delay_and_sum_beamformer(audio_signals, angle)
            # Calculate RMS response for this angle
            responses[i] = np.sqrt(np.mean(beamformed ** 2))
        
        # Normalize responses
        responses /= (np.max(responses) + 1e-10)
        
        return angles, responses
    
    def get_beam_width(self, 
                      audio_signals: List[np.ndarray], 
                      target_angle: float,
                      db_down: float = -3.0) -> float:
        """
        Calculate beam width at specified dB down point
        
        Args:
            audio_signals (List[np.ndarray]): Audio signals from each microphone
            target_angle (float): Main beam direction in degrees
            db_down (float): dB level for beam width measurement
            
        Returns:
            float: Beam width in degrees
        """
        # Calculate directivity pattern around target angle
        test_angles = np.linspace(target_angle - 90, target_angle + 90, 181)
        responses = np.zeros(len(test_angles))
        
        for i, angle in enumerate(test_angles):
            beamformed = self.delay_and_sum_beamformer(audio_signals, angle)
            responses[i] = np.sqrt(np.mean(beamformed ** 2))
        
        # Convert to dB
        responses_db = 20 * np.log10(responses / (np.max(responses) + 1e-10))
        
        # Find angles at db_down level
        threshold_indices = np.where(responses_db >= db_down)[0]
        
        if len(threshold_indices) > 0:
            beam_width = test_angles[threshold_indices[-1]] - test_angles[threshold_indices[0]]
        else:
            beam_width = 180.0  # No clear beam pattern
        
        return beam_width


# Example usage and testing
if __name__ == "__main__":
    # Define microphone array (linear array)
    mic_positions = [
        (-0.1, 0.0),  # Mic 1: 10cm to the left
        (-0.05, 0.0), # Mic 2: 5cm to the left  
        (0.0, 0.0),   # Mic 3: Center
        (0.05, 0.0),  # Mic 4: 5cm to the right
        (0.1, 0.0)    # Mic 5: 10cm to the right
    ]
    
    zoom_processor = AudioZoom(mic_positions, sample_rate=44100)
    
    print("Audio Zoom - Beamforming Test")
    print("=" * 40)
    print(f"Microphone array configuration:")
    print(f"  Number of microphones: {zoom_processor.num_mics}")
    print(f"  Array aperture: {zoom_processor.array_aperture*100:.1f} cm")
    print(f"  Maximum baseline: {zoom_processor.max_baseline*100:.1f} cm")
    
    # Create test signals with different sources at different angles
    duration = 1.0
    sample_rate = 44100
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Simulate audio sources at different angles
    source_angles = [0, 45, 90]  # degrees
    source_freqs = [440, 660, 880]  # Hz
    
    # Generate microphone signals (simplified simulation)
    audio_signals = []
    for mic_idx, mic_pos in enumerate(mic_positions):
        mic_signal = np.zeros_like(t)
        
        # Add each source with appropriate delay
        for src_angle, src_freq in zip(source_angles, source_freqs):
            # Calculate delay for this source-microphone combination
            src_angle_rad = math.radians(src_angle)
            src_direction = np.array([math.cos(src_angle_rad), math.sin(src_angle_rad)])
            
            delay_distance = np.dot(mic_pos, src_direction)
            delay_samples = int(delay_distance * sample_rate / 343.0)
            
            # Create source signal with delay
            source_signal = 0.3 * np.sin(2 * np.pi * src_freq * t)
            
            if delay_samples > 0 and delay_samples < len(t):
                # Apply delay
                delayed_source = np.concatenate([np.zeros(delay_samples), 
                                               source_signal[:-delay_samples]])
            else:
                delayed_source = source_signal
                
            mic_signal += delayed_source[:len(mic_signal)]
        
        # Add noise
        mic_signal += 0.05 * np.random.randn(len(mic_signal))
        audio_signals.append(mic_signal)
    
    # Test beamforming at different angles
    test_angles = [0, 45, 90]
    
    for angle in test_angles:
        beamformed = zoom_processor.delay_and_sum_beamformer(audio_signals, angle)
        
        # Calculate power in beamformed signal
        power = np.mean(beamformed ** 2)
        power_db = 10 * np.log10(power + 1e-10)
        
        print(f"\nBeamforming at {angle}° - Power: {power_db:.1f} dB")
        
        # Calculate beam width
        beam_width = zoom_processor.get_beam_width(audio_signals, angle)
        print(f"  3dB beam width: {beam_width:.1f}°")
    
    print("\nAudio zoom test completed successfully!")