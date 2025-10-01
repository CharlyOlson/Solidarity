#!/usr/bin/env python3
"""
error_utils.py - Comprehensive Error Handling Utilities for Solidarity Platform

This module provides specialized error handling for the Solidarity platform,
integrating with the harmonic framework, audio processing, blockchain operations,
and Node.js communication layers.

The error system follows the φ-based principles of the platform, implementing
error codes and recovery mechanisms that align with the 6 primary nodes
(1, 3, 4, 7, 14, 21) representing different system aspects.
"""

import os
import sys
import json
import logging
import traceback
import math
from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional, Union, Callable, List, Tuple


# Configure logging
LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

# Setup logging format with harmonic timestamps
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [φ:%(phi_time)s] [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(LOG_DIR, f'solidarity_{datetime.now().strftime("%Y%m%d")}.log')),
        logging.StreamHandler()
    ]
)

# Custom filter to add φ-based timestamp
class PhiTimeFilter(logging.Filter):
    def filter(self, record):
        # Calculate φ-based timestamp using golden ratio (1.618033988749895)
        phi = (1 + math.sqrt(5)) / 2
        unix_time = record.created
        record.phi_time = f"{unix_time % phi:.6f}"
        return True

# Add the filter to the root logger
logging.getLogger().addFilter(PhiTimeFilter())


# Node-based error classification
class ErrorNode(Enum):
    """Error classification based on Solidarity's 6 primary nodes"""
    CORE = 1       # Core system errors
    AUDIO = 3      # Audio processing errors
    FINANCIAL = 4  # Financial transaction errors
    BLOCKCHAIN = 7 # Blockchain interaction errors
    HARMONIC = 14  # Harmonic framework errors
    INTEGRATION = 21  # Cross-system integration errors


class SolidarityErrorCode(Enum):
    """Error codes for the Solidarity platform"""
    # Core System (100-199)
    SYSTEM_INITIALIZATION_FAILED = 101
    CONFIGURATION_ERROR = 102
    ENVIRONMENT_ERROR = 103
    FILE_SYSTEM_ERROR = 104
    SECURITY_VIOLATION = 105
    
    # Audio Processing (300-399)
    AUDIO_PROCESSING_ERROR = 301
    NUMPY_IMPORT_ERROR = 302
    SCIPY_IMPORT_ERROR = 303
    AUDIO_FILE_NOT_FOUND = 304
    INVALID_AUDIO_FORMAT = 305
    HARMONIC_CALCULATION_ERROR = 306
    
    # Financial (400-499)
    TRANSACTION_FAILED = 401
    INSUFFICIENT_FUNDS = 402
    INVALID_AMOUNT = 403
    PAYMENT_PROCESSOR_ERROR = 404
    CURRENCY_CONVERSION_ERROR = 405
    
    # Blockchain (700-799)
    CONTRACT_EXECUTION_FAILED = 701
    WALLET_CONNECTION_ERROR = 702
    BLOCKCHAIN_SYNC_ERROR = 703
    GAS_ESTIMATION_FAILED = 704
    SMART_CONTRACT_ERROR = 705
    
    # Harmonic Framework (1400-1499)
    ZIP_PHRASE_PARSE_ERROR = 1401
    NODE_CALCULATION_ERROR = 1402
    GOLDEN_RATIO_ERROR = 1403
    HARMONIC_INTEGRITY_VIOLATION = 1404
    PHRASE_SYSTEM_ERROR = 1405
    
    # Integration (2100-2199)
    NODE_PYTHON_COMMUNICATION_ERROR = 2101
    CROSS_REPO_INTEGRATION_ERROR = 2102
    MOBILE_SYNC_ERROR = 2103
    API_COMMUNICATION_ERROR = 2104
    WEBSOCKET_ERROR = 2105


class SolidarityError(Exception):
    """Base exception class for all Solidarity errors"""
    
    def __init__(self, 
                message: str, 
                error_code: SolidarityErrorCode, 
                node: ErrorNode,
                details: Optional[Dict[str, Any]] = None,
                recovery_options: Optional[List[str]] = None,
                phi_factor: float = 0.0):
        """
        Initialize a Solidarity error
        
        Args:
            message: Human-readable error message
            error_code: Specific error code from SolidarityErrorCode enum
            node: Error classification node from ErrorNode enum
            details: Additional contextual information about the error
            recovery_options: Suggested recovery actions for this error
            phi_factor: Harmonic impact factor (0.0-1.0) - higher means more system impact
        """
        self.error_code = error_code
        self.node = node
        self.details = details or {}
        self.recovery_options = recovery_options or []
        self.phi_factor = phi_factor
        self.timestamp = datetime.now()
        
        # Format for Node.js integration
        self.error_dict = {
            "error_code": self.error_code.value,
            "error_name": self.error_code.name,
            "message": message,
            "node": self.node.value,
            "node_name": self.node.name,
            "details": self.details,
            "recovery_options": self.recovery_options,
            "phi_factor": self.phi_factor,
            "timestamp": self.timestamp.isoformat(),
            "traceback": traceback.format_exc()
        }
        
        # Prepare the message for Python exception
        formatted_message = (
            f"[{self.error_code.value}:{self.error_code.name}] {message} "
            f"(Node: {self.node.name}, φ-factor: {self.phi_factor:.4f})"
        )
        super().__init__(formatted_message)
        
        # Log the error immediately
        self._log_error()
    
    def _log_error(self) -> None:
        """Log the error with appropriate level based on φ-factor"""
        log_data = {
            "error_code": self.error_code.value,
            "error_name": self.error_code.name,
            "message": str(self),
            "node": self.node.value,
            "node_name": self.node.name,
            "details": self.details,
            "phi_factor": self.phi_factor,
        }
        
        # Determine log level based on phi factor
        if self.phi_factor >= 0.8:
            logging.critical(f"CRITICAL ERROR: {self}", extra={"error_data": log_data})
        elif self.phi_factor >= 0.5:
            logging.error(f"ERROR: {self}", extra={"error_data": log_data})
        elif self.phi_factor >= 0.3:
            logging.warning(f"WARNING: {self}", extra={"error_data": log_data})
        else:
            logging.info(f"ERROR INFO: {self}", extra={"error_data": log_data})
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary for JSON serialization"""
        return self.error_dict
    
    def to_json(self) -> str:
        """Convert error to JSON string for cross-language communication"""
        return json.dumps(self.error_dict)
    
    def get_recovery_action(self) -> Optional[str]:
        """Return the first recommended recovery action if available"""
        return self.recovery_options[0] if self.recovery_options else None


# Specific Exception Classes
class AudioProcessingError(SolidarityError):
    """Exception raised for errors in audio processing"""
    
    def __init__(self, message: str, error_code: SolidarityErrorCode = SolidarityErrorCode.AUDIO_PROCESSING_ERROR, 
                 details: Optional[Dict[str, Any]] = None, **kwargs):
        super().__init__(
            message, 
            error_code, 
            ErrorNode.AUDIO,
            details=details,
            **kwargs
        )


class HarmonicFrameworkError(SolidarityError):
    """Exception raised for errors in the harmonic framework"""
    
    def __init__(self, message: str, error_code: SolidarityErrorCode = SolidarityErrorCode.HARMONIC_INTEGRITY_VIOLATION, 
                 details: Optional[Dict[str, Any]] = None, **kwargs):
        super().__init__(
            message, 
            error_code, 
            ErrorNode.HARMONIC,
            details=details,
            **kwargs
        )


class BlockchainError(SolidarityError):
    """Exception raised for blockchain interaction errors"""
    
    def __init__(self, message: str, error_code: SolidarityErrorCode = SolidarityErrorCode.CONTRACT_EXECUTION_FAILED, 
                 details: Optional[Dict[str, Any]] = None, **kwargs):
        super().__init__(
            message, 
            error_code, 
            ErrorNode.BLOCKCHAIN,
            details=details,
            **kwargs
        )


class FinancialError(SolidarityError):
    """Exception raised for financial transaction errors"""
    
    def __init__(self, message: str, error_code: SolidarityErrorCode = SolidarityErrorCode.TRANSACTION_FAILED, 
                 details: Optional[Dict[str, Any]] = None, **kwargs):
        super().__init__(
            message, 
            error_code, 
            ErrorNode.FINANCIAL,
            details=details,
            **kwargs
        )


class IntegrationError(SolidarityError):
    """Exception raised for cross-system integration errors"""
    
    def __init__(self, message: str, error_code: SolidarityErrorCode = SolidarityErrorCode.NODE_PYTHON_COMMUNICATION_ERROR, 
                 details: Optional[Dict[str, Any]] = None, **kwargs):
        super().__init__(
            message, 
            error_code, 
            ErrorNode.INTEGRATION,
            details=details,
            **kwargs
        )


class SystemError(SolidarityError):
    """Exception raised for core system errors"""
    
    def __init__(self, message: str, error_code: SolidarityErrorCode = SolidarityErrorCode.SYSTEM_INITIALIZATION_FAILED, 
                 details: Optional[Dict[str, Any]] = None, **kwargs):
        super().__init__(
            message, 
            error_code, 
            ErrorNode.CORE,
            details=details,
            **kwargs
        )


# Error recovery system
class ErrorRecoverySystem:
    """System for attempting automatic recovery from errors"""
    
    @staticmethod
    def attempt_recovery(error: SolidarityError) -> Tuple[bool, str]:
        """
        Attempt to recover from the given error
        
        Args:
            error: The SolidarityError to recover from
            
        Returns:
            Tuple of (success: bool, message: str)
        """
        recovery_handlers = {
            ErrorNode.AUDIO: ErrorRecoverySystem._recover_audio_error,
            ErrorNode.BLOCKCHAIN: ErrorRecoverySystem._recover_blockchain_error,
            ErrorNode.FINANCIAL: ErrorRecoverySystem._recover_financial_error,
            ErrorNode.HARMONIC: ErrorRecoverySystem._recover_harmonic_error,
            ErrorNode.INTEGRATION: ErrorRecoverySystem._recover_integration_error,
            ErrorNode.CORE: ErrorRecoverySystem._recover_system_error
        }
        
        handler = recovery_handlers.get(error.node)
        if handler:
            return handler(error)
        
        return False, "No recovery handler available for this error type"
    
    @staticmethod
    def _recover_audio_error(error: SolidarityError) -> Tuple[bool, str]:
        """Attempt to recover from audio processing errors"""
        if error.error_code == SolidarityErrorCode.NUMPY_IMPORT_ERROR:
            try:
                # Try to install numpy if missing
                import pip
                pip.main(['install', 'numpy'])
                import numpy
                return True, "Successfully installed numpy"
            except Exception as e:
                return False, f"Failed to install numpy: {str(e)}"
        
        # Handle other audio errors
        return False, "Automatic recovery not available for this audio error"
    
    @staticmethod
    def _recover_blockchain_error(error: SolidarityError) -> Tuple[bool, str]:
        """Attempt to recover from blockchain errors"""
        if error.error_code == SolidarityErrorCode.WALLET_CONNECTION_ERROR:
            # Could implement wallet reconnection logic
            return False, "Wallet reconnection not implemented yet"
        
        return False, "Automatic recovery not available for this blockchain error"
    
    @staticmethod
    def _recover_financial_error(error: SolidarityError) -> Tuple[bool, str]:
        """Attempt to recover from financial errors"""
        return False, "Automatic recovery not available for financial errors"
    
    @staticmethod
    def _recover_harmonic_error(error: SolidarityError) -> Tuple[bool, str]:
        """Attempt to recover from harmonic framework errors"""
        # Could implement phrase system reset or recalibration
        return False, "Automatic recovery not available for harmonic framework errors"
    
    @staticmethod
    def _recover_integration_error(error: SolidarityError) -> Tuple[bool, str]:
        """Attempt to recover from integration errors"""
        # Could implement retry logic for Node-Python communication
        if error.error_code == SolidarityErrorCode.NODE_PYTHON_COMMUNICATION_ERROR:
            return False, "Communication retry not implemented yet"
        
        return False, "Automatic recovery not available for integration errors"
    
    @staticmethod
    def _recover_system_error(error: SolidarityError) -> Tuple[bool, str]:
        """Attempt to recover from system errors"""
        # Could implement environment verification
        if error.error_code == SolidarityErrorCode.ENVIRONMENT_ERROR:
            # Verify environment and try to fix
            return False, "Environment verification not implemented yet"
        
        return False, "Automatic recovery not available for system errors"


# Node.js integration utilities
def error_to_node_format(error: Union[SolidarityError, Exception]) -> Dict[str, Any]:
    """
    Convert any Python exception to a format consumable by Node.js
    
    Args:
        error: A SolidarityError or standard Exception
        
    Returns:
        Dictionary formatted for Node.js error handling
    """
    if isinstance(error, SolidarityError):
        return error.to_dict()
    
    # Handle standard Python exceptions
    return {
        "error_code": -1,
        "error_name": error.__class__.__name__,
        "message": str(error),
        "node": ErrorNode.CORE.value,
        "node_name": ErrorNode.CORE.name,
        "details": {},
        "recovery_options": [],
        "phi_factor": 0.5,  # Default medium impact
        "timestamp": datetime.now().isoformat(),
        "traceback": traceback.format_exc()
    }


# Error decorator for functions
def handle_solidarity_errors(error_node: ErrorNode = ErrorNode.CORE, 
                           default_phi_factor: float = 0.3):
    """
    Decorator to handle exceptions in Solidarity functions
    
    Args:
        error_node: The node classification for errors in this function
        default_phi_factor: Default harmonic impact factor
    
    Returns:
        Decorated function with error handling
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except SolidarityError as e:
                # Pass through Solidarity errors
                raise
            except ImportError as e:
                # Handle import errors specially
                if 'numpy' in str(e).lower():
                    raise AudioProcessingError(
                        f"NumPy import error in {func.__name__}: {str(e)}",
                        error_code=SolidarityErrorCode.NUMPY_IMPORT_ERROR,
                        phi_factor=default_phi_factor,
                        details={"function": func.__name__}
                    )
                elif 'scipy' in str(e).lower():
                    raise AudioProcessingError(
                        f"SciPy import error in {func.__name__}: {str(e)}",
                        error_code=SolidarityErrorCode.SCIPY_IMPORT_ERROR,
                        phi_factor=default_phi_factor,
                        details={"function": func.__name__}
                    )
                else:
                    raise SystemError(
                        f"Import error in {func.__name__}: {str(e)}",
                        error_code=SolidarityErrorCode.ENVIRONMENT_ERROR,
                        phi_factor=default_phi_factor,
                        details={"function": func.__name__, "import": str(e)}
                    )
            except Exception as e:
                # Map general exceptions to Solidarity exceptions
                error_mapping = {
                    ErrorNode.AUDIO: AudioProcessingError,
                    ErrorNode.BLOCKCHAIN: BlockchainError,
                    ErrorNode.FINANCIAL: FinancialError,
                    ErrorNode.HARMONIC: HarmonicFrameworkError,
                    ErrorNode.INTEGRATION: IntegrationError,
                    ErrorNode.CORE: SystemError
                }
                
                error_class = error_mapping.get(error_node, SystemError)
                raise error_class(
                    f"Error in {func.__name__}: {str(e)}",
                    phi_factor=default_phi_factor,
                    details={
                        "function": func.__name__,
                        "args": str(args),
                        "kwargs": str(kwargs)
                    }
                )
        
        return wrapper
    
    return decorator


# Context manager for error handling
class SolidarityErrorContext:
    """
    Context manager for Solidarity error handling
    
    Example:
        with SolidarityErrorContext(ErrorNode.AUDIO) as error_ctx:
            # code that might raise errors
            process_audio_file(filename)
            
        if error_ctx.has_error():
            # Handle the error
            print(f"Error occurred: {error_ctx.error}")
    """
    
    def __init__(self, error_node: ErrorNode = ErrorNode.CORE, 
                 raise_on_error: bool = False,
                 default_phi_factor: float = 0.3):
        """
        Initialize error context
        
        Args:
            error_node: The node classification for errors in this context
            raise_on_error: Whether to re-raise errors after context exits
            default_phi_factor: Default harmonic impact factor
        """
        self.error_node = error_node
        self.raise_on_error = raise_on_error
        self.default_phi_factor = default_phi_factor
        self.error = None
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type is not None:
            if isinstance(exc_value, SolidarityError):
                # Already a Solidarity error
                self.error = exc_value
            else:
                # Convert to Solidarity error
                error_mapping = {
                    ErrorNode.AUDIO: AudioProcessingError,
                    ErrorNode.BLOCKCHAIN: BlockchainError,
                    ErrorNode.FINANCIAL: FinancialError,
                    ErrorNode.HARMONIC: HarmonicFrameworkError,
                    ErrorNode.INTEGRATION: IntegrationError,
                    ErrorNode.CORE: SystemError
                }
                
                error_class = error_mapping.get(self.error_node, SystemError)
                self.error = error_class(
                    str(exc_value),
                    phi_factor=self.default_phi_factor,
                    details={"exception_type": exc_type.__name__}
                )
            
            # Attempt recovery if applicable
            if self.error:
                success, message = ErrorRecoverySystem.attempt_recovery(self.error)
                if success:
                    logging.info(f"Successfully recovered from error: {message}")
                    return True  # Suppress the exception
            
            return not self.raise_on_error  # Suppress the exception if not raising
        
        return True
    
    def has_error(self) -> bool:
        """Check if an error occurred in the context"""
        return self.error is not None


# Usage examples
if __name__ == "__main__":
    # Example 1: Basic error raising
    try:
        raise AudioProcessingError(
            "Failed to process audio file: sample rate mismatch",
            error_code=SolidarityErrorCode.INVALID_AUDIO_FORMAT,
            phi_factor=0.7,
            details={"expected_rate": 44100, "actual_rate": 48000, "file": "audio.wav"},
            recovery_options=["Resample the audio file to 44100Hz"]
        )
    except SolidarityError as e:
        print(f"Error caught: {e}")
        print(f"Recovery suggestion: {e.get_recovery_action()}")
    
    # Example 2: Using the decorator
    @handle_solidarity_errors(error_node=ErrorNode.AUDIO)
    def process_audio(filename):
        # Simulate error
        if not filename.endswith('.wav'):
            raise ValueError("Unsupported audio format")
        # Process audio...
        return True
    
    try:
        process_audio("test.mp3")
    except SolidarityError as e:
        print(f"Decorated function error: {e}")
    
    # Example 3: Using the context manager
    with SolidarityErrorContext(ErrorNode.HARMONIC, raise_on_error=False) as ctx:
        # Simulate error
        x = 1 / 0  # Will raise ZeroDivisionError
    
    if ctx.has_error():
        print(f"Context manager caught: {ctx.error}")