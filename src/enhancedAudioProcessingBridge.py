#!/usr/bin/env python3
"""
Enhanced Solidarity Audio Processor Bridge
Bridges Python audio processing with JavaScript ZIP phrase system
Created by Scott Charles Olson (Charly)
"""

import json
import sys
import numpy as np
import asyncio
import threading
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import all audio processing classes
try:
    from solidarityAudioProcessor import (
        AudioTimeBuyer, AudioParameterController, AudioGradientTransferenceEngine,
        Audio3DPositionalEncoder, ProfessionalAudioProcessor, AdvancedSpatialAudioProcessor,
        SolidarityAudioProcessor, MasterSolidarityAudioSystem
    )
except ImportError as e:
    logger.error(f"Failed to import audio processors: {e}")
    # Create minimal implementations for testing
    class AudioTimeBuyer:
        def __init__(self, sample_rate=44100, pi_precision=16):
            self.sample_rate = sample_rate
            self.pi_precision = pi_precision
            
    class MasterSolidarityAudioSystem:
        def __init__(self):
            pass
            
        def process_complete_audio_pipeline(self, signal, config):
            return {"processed": True, "signal_length": len(signal)}

@dataclass
class AudioProcessingRequest:
    """Structured request for audio processing"""
    operation: str
    parameters: Dict[str, Any]
    timestamp: float
    request_id: str

@dataclass
class AudioProcessingResponse:
    """Structured response from audio processing"""
    success: bool
    result: Dict[str, Any]
    error: Optional[str]
    processing_time: float
    request_id: str

class EnhancedAudioProcessingBridge:
    """
    Enhanced bridge between JavaScript and Python audio systems
    Handles real-time audio processing with ZIP phrase integration
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
        self.audio_systems = self._initialize_audio_systems()
        self.processing_queue = asyncio.Queue()
        self.running = False
        self.stats = {
            'total_requests': 0,
            'successful_operations': 0,
            'failed_operations': 0,
            'average_processing_time': 0.0
        }
        
        logger.info(f"Enhanced Audio Processing Bridge initialized (Sample Rate: {sample_rate}Hz)")
    
    def _initialize_audio_systems(self) -> Dict[str, Any]:
        """Initialize all audio processing systems"""
        try:
            systems = {
                'time_buyer': AudioTimeBuyer(self.sample_rate),
                'parameter_controller': AudioParameterController(),
                'gradient_engine': AudioGradientTransferenceEngine(),
                'spatial_encoder': Audio3DPositionalEncoder(),
                'professional_processor': ProfessionalAudioProcessor(),
                'spatial_processor': AdvancedSpatialAudioProcessor(),
                'solidarity_processor': SolidarityAudioProcessor(),
                'master_system': MasterSolidarityAudioSystem()
            }
            
            logger.info("All audio systems initialized successfully")
            return systems
            
        except Exception as e:
            logger.error(f"Failed to initialize audio systems: {e}")
            return {}
    
    async def start_processing_loop(self):
        """Start the main processing loop"""
        self.running = True
        logger.info("Starting audio processing loop...")
        
        while self.running:
            try:
                # Listen for input from JavaScript
                await self._listen_for_requests()
                
            except Exception as e:
                logger.error(f"Error in processing loop: {e}")
                await asyncio.sleep(0.1)
    
    async def _listen_for_requests(self):
        """Listen for requests from JavaScript via stdin"""
        try:
            # Read from stdin (non-blocking)
            loop = asyncio.get_event_loop()
            line = await loop.run_in_executor(None, sys.stdin.readline)
            
            if line.strip():
                request_data = json.loads(line.strip())
                await self._process_request(request_data)
                
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON received: {e}")
        except Exception as e:
            logger.error(f"Error listening for requests: {e}")
    
    async def _process_request(self, request_data: Dict[str, Any]):
        """Process incoming audio request"""
        start_time = time.time()
        request_id = request_data.get('request_id', f'req_{int(time.time() * 1000)}')
        
        try:
            operation = request_data.get('operation', 'unknown')
            parameters = request_data.get('parameters', {})
            
            logger.info(f"Processing request {request_id}: {operation}")
            
            # Route to appropriate processing method
            result = await self._route_operation(operation, parameters)
            
            processing_time = time.time() - start_time
            
            response = AudioProcessingResponse(
                success=True,
                result=result,
                error=None,
                processing_time=processing_time,
                request_id=request_id
            )
            
            self.stats['successful_operations'] += 1
            self._update_processing_stats(processing_time)
            
        except Exception as e:
            processing_time = time.time() - start_time
            
            response = AudioProcessingResponse(
                success=False,
                result={},
                error=str(e),
                processing_time=processing_time,
                request_id=request_id
            )
            
            self.stats['failed_operations'] += 1
            logger.error(f"Request {request_id} failed: {e}")
        
        finally:
            self.stats['total_requests'] += 1
            
        # Send response back to JavaScript
        await self._send_response(response)
    
    async def _route_operation(self, operation: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Route operation to appropriate audio system"""
        
        if operation == 'process_zip_phrase':
            return await self._process_zip_phrase(parameters)
        elif operation == 'process_harmonic_series':
            return await self._process_harmonic_series(parameters)
        elif operation == 'spatial_audio_processing':
            return await self._process_spatial_audio(parameters)
        elif operation == 'gradient_transference':
            return await self._process_gradient_transference(parameters)
        elif operation == 'professional_audio_effects':
            return await self._process_professional_effects(parameters)
        elif operation == 'complete_audio_pipeline':
            return await self._process_complete_pipeline(parameters)
        elif operation == 'get_system_status':
            return self._get_system_status()
        else:
            raise ValueError(f"Unknown operation: {operation}")
    
    async def _process_zip_phrase(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Process ZIP phrase with audio"""
        phrase = params.get('phrase', 'Compression Wave')
        signal_data = params.get('signal', None)
        mode = params.get('mode', 'standard')
        
        # Generate or use provided signal
        if signal_data is None:
            signal = self._generate_test_signal(params.get('frequency', 440), params.get('duration', 1.0))
        else:
            signal = np.array(signal_data)
        
        # Process with Solidarity audio processor
        solidarity_processor = self.audio_systems.get('solidarity_processor')
        if solidarity_processor:
            result = solidarity_processor.process_zip_phrase_audio(phrase, signal, mode)
        else:
            # Fallback processing
            result = {
                'processed_signal': signal.tolist(),
                'phrase': phrase,
                'mode': mode,
                'rms': float(np.sqrt(np.mean(signal**2))),
                'length': len(signal)
            }
        
        return result
    
    async def _process_harmonic_series(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Process harmonic series"""
        harmonics = params.get('harmonics', [])
        duration = params.get('duration', 1.0)
        
        # Generate composite signal from harmonics
        signal = np.zeros(int(self.sample_rate * duration))
        t = np.linspace(0, duration, len(signal))
        
        for harmonic in harmonics:
            freq = harmonic.get('frequency', 440)
            amp = harmonic.get('amplitude', 1.0)
            signal += amp * np.sin(2 * np.pi * freq * t)
        
        # Normalize
        if np.max(np.abs(signal)) > 0:
            signal = signal / np.max(np.abs(signal))
        
        # Process with professional audio processor
        processor = self.audio_systems.get('professional_processor')
        if processor:
            # Apply harmonic analysis
            harmonic_analysis = processor.harmonic_analyzer(signal)
            processed_signal = processor.reverb_processor(signal)
        else:
            harmonic_analysis = {'harmonics': len(harmonics)}
            processed_signal = signal
        
        return {
            'original_signal': signal.tolist(),
            'processed_signal': processed_signal.tolist(),
            'harmonic_analysis': harmonic_analysis,
            'harmonics_count': len(harmonics),
            'duration': duration
        }
    
    async def _process_spatial_audio(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Process spatial audio"""
        signal_data = params.get('signal', None)
        
        if signal_data is None:
            signal = self._generate_test_signal(params.get('frequency', 440), params.get('duration', 1.0))
        else:
            signal = np.array(signal_data)
        
        # Process with spatial encoder
        spatial_encoder = self.audio_systems.get('spatial_encoder')
        if spatial_encoder:
            coords = spatial_encoder.encode_audio_to_3d_position(signal)
            decoded_signal = spatial_encoder.decode_3d_position_to_audio(coords)
        else:
            # Fallback spatial processing
            coords = {'x': 0.0, 'y': 0.0, 'z': 0.0}
            decoded_signal = signal
        
        return {
            'spatial_coordinates': coords,
            'original_signal': signal.tolist(),
            'spatially_processed': decoded_signal.tolist(),
            'processing_method': 'spatial_encoding'
        }
    
    async def _process_gradient_transference(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Process audio gradient transference"""
        source_signal = np.array(params.get('source_signal', []))
        target_signal = np.array(params.get('target_signal', []))
        
        if len(source_signal) == 0:
            source_signal = self._generate_test_signal(440, 0.5)
        if len(target_signal) == 0:
            target_signal = self._generate_test_signal(880, 0.5)
        
        # Process with gradient engine
        gradient_engine = self.audio_systems.get('gradient_engine')
        if gradient_engine:
            gradient = gradient_engine.calculate_audio_gradient(source_signal, target_signal)
            transferred = gradient_engine.apply_audio_gradient_transfer(source_signal, gradient)
        else:
            gradient = np.zeros_like(source_signal)
            transferred = source_signal
        
        return {
            'source_signal': source_signal.tolist(),
            'target_signal': target_signal.tolist(),
            'gradient': gradient.tolist(),
            'transferred_signal': transferred.tolist()
        }
    
    async def _process_professional_effects(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Process with professional audio effects"""
        signal_data = params.get('signal', None)
        effects = params.get('effects', ['reverb', 'compressor'])
        
        if signal_data is None:
            signal = self._generate_test_signal(params.get('frequency', 440), params.get('duration', 1.0))
        else:
            signal = np.array(signal_data)
        
        processor = self.audio_systems.get('professional_processor')
        processed_signal = signal.copy()
        
        if processor:
            for effect in effects:
                if effect == 'reverb':
                    processed_signal = processor.reverb_processor(processed_signal)
                elif effect == 'compressor':
                    processed_signal = processor.compressor(processed_signal)
                elif effect == 'delay':
                    processed_signal = processor.delay_processor(processed_signal)
                elif effect == 'limiter':
                    processed_signal = processor.limiter(processed_signal)
        
        return {
            'original_signal': signal.tolist(),
            'processed_signal': processed_signal.tolist(),
            'effects_applied': effects,
            'processing_chain': 'professional_audio_processor'
        }
    
    async def _process_complete_pipeline(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Process through complete audio pipeline"""
        config = params.get('config', {})
        signal_data = params.get('signal', None)
        
        if signal_data is None:
            signal = self._generate_test_signal(
                params.get('frequency', 440),
                params.get('duration', 1.0)
            )
        else:
            signal = np.array(signal_data)
        
        master_system = self.audio_systems.get('master_system')
        if master_system:
            result = master_system.process_complete_audio_pipeline(signal, config)
        else:
            result = {
                'processed': True,
                'signal': signal.tolist(),
                'pipeline_stages': ['input', 'processing', 'output']
            }
        
        return result
    
    def _generate_test_signal(self, frequency: float, duration: float) -> np.ndarray:
        """Generate test signal for processing"""
        t = np.linspace(0, duration, int(self.sample_rate * duration))
        return 0.5 * np.sin(2 * np.pi * frequency * t)
    
    def _get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        return {
            'audio_systems': {
                name: system is not None
                for name, system in self.audio_systems.items()
            },
            'processing_stats': self.stats,
            'sample_rate': self.sample_rate,
            'running': self.running,
            'systems_available': len([s for s in self.audio_systems.values() if s is not None])
        }
    
    async def _send_response(self, response: AudioProcessingResponse):
        """Send response back to JavaScript"""
        try:
            response_json = json.dumps({
                'success': response.success,
                'result': response.result,
                'error': response.error,
                'processing_time': response.processing_time,
                'request_id': response.request_id,
                'timestamp': time.time()
            })
            
            print(response_json, flush=True)
            
        except Exception as e:
            logger.error(f"Failed to send response: {e}")
    
    def _update_processing_stats(self, processing_time: float):
        """Update processing statistics"""
        total_ops = self.stats['successful_operations']
        if total_ops == 1:
            self.stats['average_processing_time'] = processing_time
        else:
            current_avg = self.stats['average_processing_time']
            self.stats['average_processing_time'] = (
                (current_avg * (total_ops - 1) + processing_time) / total_ops
            )
    
    def stop(self):
        """Stop the processing loop"""
        self.running = False
        logger.info("Audio processing bridge stopped")

# Main execution
async def main():
    """Main entry point for the audio processing bridge"""
    logger.info("Starting Enhanced Solidarity Audio Processing Bridge...")
    
    try:
        # Create and start the bridge
        bridge = EnhancedAudioProcessingBridge()
        
        # Send ready signal to JavaScript
        ready_message = {
            'status': 'ready',
            'message': 'Enhanced Audio Processing Bridge initialized',
            'timestamp': time.time()
        }
        print(json.dumps(ready_message), flush=True)
        
        # Start processing loop
        await bridge.start_processing_loop()
        
    except KeyboardInterrupt:
        logger.info("Received interrupt signal, shutting down...")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        error_message = {
            'status': 'error',
            'message': str(e),
            'timestamp': time.time()
        }
        print(json.dumps(error_message), flush=True)
    finally:
        logger.info("Audio processing bridge shutdown complete")

if __name__ == "__main__":
    # Handle different execution modes
    if len(sys.argv) > 1:
        if sys.argv[1] == 'test':
            # Run in test mode
            logger.info("Running in test mode...")
            bridge = EnhancedAudioProcessingBridge()
            status = bridge._get_system_status()
            print(json.dumps(status, indent=2))
        elif sys.argv[1] == 'demo':
            # Run demo
            logger.info("Running demo mode...")
            # Add demo functionality here
    else:
        # Normal operation mode
        asyncio.run(main())