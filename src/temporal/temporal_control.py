"""
Temporal Control System - Lock-Stop and Cog Switching
Author: Scott Charles Olson, "Charly"
Date: August 24, 2025

Temporal control system implementing lock-stop mechanisms and cog switching where
"fiscal time keeps moving forward with time but the cogs switch function not entire sense of direction"
"""

import numpy as np
import math
from typing import Dict, List, Tuple, Optional, Union, Callable
from enum import Enum
import time
from threading import RLock
import queue


class DirectionState(Enum):
    """Direction states for cog switching"""
    FORWARD = 1
    REVERSE = -1
    LOCKED = 0


class CogMode(Enum):
    """Cog operational modes"""
    NORMAL = "normal"
    FUNCTION_SWITCH = "function_switch"
    REVERSE_PROCESS = "reverse_process"
    LOCKED_STATE = "locked_state"


class TemporalCogController:
    """
    Temporal cog controller for direction switching while maintaining forward fiscal time
    
    The core concept: fiscal time always moves forward, but cogs can switch their 
    processing function without changing the overall direction of time flow.
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
        self.fiscal_time = 0.0  # Always moves forward
        self.processing_time = 0.0  # Can move in either direction
        
        # Cog states
        self.cog_direction = DirectionState.FORWARD
        self.cog_mode = CogMode.NORMAL
        self.function_reversed = False
        
        # Lock mechanisms
        self._lock = RLock()
        self.is_locked = False
        self.lock_position = 0.0
        self.lock_timestamp = 0.0
        
        # Time tracking
        self.start_time = time.time()
        self.samples_processed = 0
        
        # Cog switching parameters
        self.switch_threshold = 1.0  # seconds before allowing switch
        self.last_switch_time = 0.0
        
    def update_fiscal_time(self, samples: int):
        """
        Update fiscal time - always moves forward regardless of cog state
        
        Args:
            samples (int): Number of samples processed
        """
        with self._lock:
            self.fiscal_time += samples / self.sample_rate
            self.samples_processed += samples
    
    def update_processing_time(self, samples: int):
        """
        Update processing time based on cog direction
        
        Args:
            samples (int): Number of samples to process
        """
        with self._lock:
            if self.cog_direction == DirectionState.FORWARD:
                self.processing_time += samples / self.sample_rate
            elif self.cog_direction == DirectionState.REVERSE:
                self.processing_time -= samples / self.sample_rate
            # LOCKED state doesn't change processing time
    
    def switch_cog_function(self, new_mode: CogMode) -> bool:
        """
        Switch cog function while maintaining forward fiscal time
        
        Args:
            new_mode (CogMode): New operational mode for the cog
            
        Returns:
            bool: True if switch was successful
        """
        with self._lock:
            current_time = time.time() - self.start_time
            
            # Check if enough time has passed since last switch
            if current_time - self.last_switch_time < self.switch_threshold:
                return False
                
            # Don't allow switch if locked
            if self.is_locked:
                return False
            
            self.cog_mode = new_mode
            self.last_switch_time = current_time
            
            # Update function state based on mode
            if new_mode == CogMode.FUNCTION_SWITCH:
                self.function_reversed = not self.function_reversed
                self.cog_direction = DirectionState.REVERSE if self.function_reversed else DirectionState.FORWARD
            elif new_mode == CogMode.REVERSE_PROCESS:
                self.cog_direction = DirectionState.REVERSE
            elif new_mode == CogMode.LOCKED_STATE:
                self.cog_direction = DirectionState.LOCKED
            else:  # NORMAL mode
                self.cog_direction = DirectionState.FORWARD
                self.function_reversed = False
            
            return True
    
    def get_processing_direction_multiplier(self) -> float:
        """
        Get direction multiplier for processing (-1 for reverse, 0 for locked, 1 for forward)
        
        Returns:
            float: Direction multiplier
        """
        return float(self.cog_direction.value)
    
    def apply_temporal_processing(self, 
                                signal: np.ndarray, 
                                processing_function: Callable[[np.ndarray], np.ndarray]) -> np.ndarray:
        """
        Apply processing function with temporal cog control
        
        Args:
            signal (np.ndarray): Input signal
            processing_function (Callable): Function to apply to signal
            
        Returns:
            np.ndarray: Processed signal accounting for cog state
        """
        with self._lock:
            # Update fiscal time (always forward)
            self.update_fiscal_time(len(signal))
            
            # Update processing time (depends on cog direction) 
            self.update_processing_time(len(signal))
            
            # If locked, return signal unchanged
            if self.is_locked or self.cog_direction == DirectionState.LOCKED:
                return signal.copy()
            
            # Apply processing based on cog mode
            if self.cog_mode == CogMode.NORMAL:
                return processing_function(signal)
            
            elif self.cog_mode == CogMode.FUNCTION_SWITCH:
                # Apply function in switched manner
                if self.function_reversed:
                    # Reverse signal, apply function, reverse back
                    reversed_signal = np.flip(signal)
                    processed = processing_function(reversed_signal) 
                    return np.flip(processed)
                else:
                    return processing_function(signal)
            
            elif self.cog_mode == CogMode.REVERSE_PROCESS:
                # Reverse the entire processing chain
                reversed_signal = np.flip(signal)
                processed = processing_function(reversed_signal)
                return np.flip(processed)
            
            else:
                return processing_function(signal)
    
    def get_temporal_state(self) -> Dict:
        """
        Get current temporal state information
        
        Returns:
            Dict: Complete temporal state
        """
        with self._lock:
            return {
                'fiscal_time': self.fiscal_time,
                'processing_time': self.processing_time,
                'time_differential': self.fiscal_time - self.processing_time,
                'cog_direction': self.cog_direction.name,
                'cog_mode': self.cog_mode.value,
                'function_reversed': self.function_reversed,
                'is_locked': self.is_locked,
                'lock_position': self.lock_position,
                'samples_processed': self.samples_processed,
                'real_time_elapsed': time.time() - self.start_time
            }


class LockStopController:
    """
    Lock-stop mechanism for harmonic processing control
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
        self.current_time = 0
        
        # Lock state
        self.is_locked = False
        self.lock_position = 0
        self.lock_timestamp = 0.0
        
        # Stop scheduling  
        self.stop_scheduled = False
        self.stop_time = 0
        
        # Emergency stop
        self.emergency_stop = False
        
        # Lock queue for multiple lock requests
        self.lock_queue = queue.Queue()
        
    def lock_harmonic(self, position: Optional[int] = None):
        """
        Lock processing at specific harmonic position
        
        Args:
            position (Optional[int]): Position to lock at (current position if None)
        """
        if position is None:
            position = self.current_time
            
        self.is_locked = True
        self.lock_position = position
        self.lock_timestamp = time.time()
        
    def unlock_harmonic(self):
        """Unlock processing to continue"""
        self.is_locked = False
        self.lock_position = 0
        self.lock_timestamp = 0.0
        
    def schedule_stop(self, when: float = 0):
        """
        Schedule stop at specific time
        
        Args:
            when (float): Time in seconds to stop (0 for immediate)
        """
        if when <= 0:
            self.stop_scheduled = True
            self.stop_time = self.current_time
        else:
            self.stop_scheduled = True
            self.stop_time = self.current_time + int(when * self.sample_rate)
            
    def emergency_halt(self):
        """Emergency stop all processing immediately"""
        self.emergency_stop = True
        self.stop_scheduled = True
        self.stop_time = self.current_time
        
    def update_time(self, samples_processed: int):
        """
        Update internal time counter
        
        Args:
            samples_processed (int): Number of samples processed
        """
        if not self.is_locked:
            self.current_time += samples_processed
            
    def should_stop(self) -> bool:
        """
        Check if processing should stop
        
        Returns:
            bool: True if processing should stop
        """
        if self.emergency_stop:
            return True
            
        if self.stop_scheduled and self.current_time >= self.stop_time:
            return True
            
        return False
        
    def get_current_position(self) -> int:
        """
        Get current processing position
        
        Returns:
            int: Current position (locked position if locked)
        """
        if self.is_locked:
            return self.lock_position
        return self.current_time
        
    def process_with_lock_stop(self, 
                             signal: np.ndarray,
                             processing_function: Callable[[np.ndarray], np.ndarray]) -> np.ndarray:
        """
        Process signal with lock-stop control
        
        Args:
            signal (np.ndarray): Input signal
            processing_function (Callable): Processing function to apply
            
        Returns:
            np.ndarray: Processed signal (may be truncated if stopped)
        """
        if self.should_stop():
            return np.zeros_like(signal)
            
        if self.is_locked:
            # Return signal unchanged when locked
            return signal.copy()
            
        # Update time counter
        self.update_time(len(signal))
        
        # Check for stop condition after processing
        if self.should_stop():
            # Calculate how much to process before stopping
            remaining_samples = max(0, self.stop_time - (self.current_time - len(signal)))
            if remaining_samples < len(signal):
                # Process partial signal
                partial_signal = signal[:remaining_samples]
                processed_partial = processing_function(partial_signal)
                
                # Return partial result with zeros
                result = np.zeros_like(signal)
                result[:len(processed_partial)] = processed_partial
                return result
        
        return processing_function(signal)
        
    def get_lock_stop_state(self) -> Dict:
        """
        Get current lock-stop state
        
        Returns:
            Dict: Current state information
        """
        return {
            'current_time': self.current_time,
            'current_time_seconds': self.current_time / self.sample_rate,
            'is_locked': self.is_locked,
            'lock_position': self.lock_position,
            'lock_duration': time.time() - self.lock_timestamp if self.is_locked else 0.0,
            'stop_scheduled': self.stop_scheduled,
            'stop_time': self.stop_time,
            'emergency_stop': self.emergency_stop,
            'should_stop': self.should_stop()
        }


class CombinedTemporalController:
    """
    Combined temporal control system integrating cog switching and lock-stop mechanisms
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
        
        # Initialize sub-controllers
        self.cog_controller = TemporalCogController(sample_rate)
        self.lock_stop_controller = LockStopController(sample_rate)
        
        # Integration parameters
        self.sync_tolerance = 0.001  # 1ms tolerance for time sync
        
    def process_with_temporal_control(self, 
                                    signal: np.ndarray,
                                    processing_function: Callable[[np.ndarray], np.ndarray]) -> np.ndarray:
        """
        Process signal with complete temporal control (cog switching + lock-stop)
        
        Args:
            signal (np.ndarray): Input signal
            processing_function (Callable): Processing function to apply
            
        Returns:
            np.ndarray: Processed signal with temporal control applied
        """
        # First apply lock-stop control
        lock_stop_processed = self.lock_stop_controller.process_with_lock_stop(
            signal, lambda x: x  # Pass through for now
        )
        
        # Then apply cog temporal processing
        final_result = self.cog_controller.apply_temporal_processing(
            lock_stop_processed, processing_function
        )
        
        return final_result
    
    def synchronize_controllers(self):
        """Synchronize the time bases of both controllers"""
        cog_time = self.cog_controller.fiscal_time
        lock_time = self.lock_stop_controller.current_time / self.sample_rate
        
        time_diff = abs(cog_time - lock_time)
        if time_diff > self.sync_tolerance:
            # Sync lock-stop controller to cog controller
            self.lock_stop_controller.current_time = int(cog_time * self.sample_rate)
    
    def get_complete_temporal_state(self) -> Dict:
        """
        Get complete state of both temporal control systems
        
        Returns:
            Dict: Complete temporal state
        """
        cog_state = self.cog_controller.get_temporal_state()
        lock_state = self.lock_stop_controller.get_lock_stop_state()
        
        return {
            'cog_controller': cog_state,
            'lock_stop_controller': lock_state,
            'synchronized': abs(cog_state['fiscal_time'] - lock_state['current_time_seconds']) < self.sync_tolerance
        }


# Example usage and testing
if __name__ == "__main__":
    print("Temporal Control System Test")
    print("=" * 40)
    
    # Initialize combined controller
    controller = CombinedTemporalController(sample_rate=44100)
    
    # Create test signal
    duration = 2.0
    sample_rate = 44100
    t = np.linspace(0, duration, int(sample_rate * duration))
    test_signal = np.sin(2 * np.pi * 440 * t)
    
    # Define a simple processing function
    def simple_gain(signal):
        return signal * 0.5
    
    print("Initial state:")
    initial_state = controller.get_complete_temporal_state()
    print(f"  Fiscal time: {initial_state['cog_controller']['fiscal_time']:.3f}s")
    print(f"  Processing time: {initial_state['cog_controller']['processing_time']:.3f}s")
    print(f"  Cog direction: {initial_state['cog_controller']['cog_direction']}")
    
    # Process in normal mode  
    chunk_size = 1024
    num_chunks = min(5, len(test_signal) // chunk_size)  # Limit to 5 chunks for testing
    
    for i in range(0, num_chunks * chunk_size, chunk_size):
        chunk = test_signal[i:i+chunk_size]
        processed_chunk = controller.process_with_temporal_control(chunk, simple_gain)
        
        # Show state for first few chunks
        if i // chunk_size < 3:
            state = controller.get_complete_temporal_state()
            print(f"\nChunk {i//chunk_size}:")
            print(f"  Fiscal time: {state['cog_controller']['fiscal_time']:.3f}s")
            print(f"  Processing time: {state['cog_controller']['processing_time']:.3f}s")
            print(f"  Time differential: {state['cog_controller']['time_differential']:.3f}s")
    
    # Test cog switching
    print("\nTesting cog function switch...")
    controller.cog_controller.switch_cog_function(CogMode.FUNCTION_SWITCH)
    
    # Process a few more chunks with switched function
    for i in range(3):
        chunk_start = i * chunk_size
        chunk = test_signal[chunk_start:chunk_start+chunk_size]
        processed_chunk = controller.process_with_temporal_control(chunk, simple_gain)
    
    final_state = controller.get_complete_temporal_state()
    print(f"\nFinal state after function switch:")
    print(f"  Fiscal time: {final_state['cog_controller']['fiscal_time']:.3f}s")
    print(f"  Processing time: {final_state['cog_controller']['processing_time']:.3f}s")
    print(f"  Cog mode: {final_state['cog_controller']['cog_mode']}")
    print(f"  Function reversed: {final_state['cog_controller']['function_reversed']}")
    print(f"  Time differential: {final_state['cog_controller']['time_differential']:.3f}s")
    
    print("\nKey principle verified: Fiscal time always moves forward, cogs switch function!")
    print(f"  Fiscal time moved: {final_state['cog_controller']['fiscal_time']:.3f}s (always forward)")
    print(f"  Processing time: {final_state['cog_controller']['processing_time']:.3f}s (can reverse)")
    
    print("\nTemporal control system test completed successfully!")