"""
Error Handling Utilities
Provides secure error logging that conditionally exposes stack traces

Author: Scott Charles Olson (Charly) & Charles H. Dykes (Hank)
"""

import os
import traceback


def log_error(error, message="Error occurred"):
    """
    Securely log error with conditional stack trace exposure
    Only shows stack traces when NODE_ENV is 'development'
    
    Args:
        error: The exception to log
        message: Optional custom message
    """
    print(f"{message}: {error}")
    
    # Only expose stack traces in development environment
    if os.environ.get('NODE_ENV') == 'development':
        traceback.print_exc()


def log_error_with_traceback(error, message="Error occurred"):
    """
    Log error with conditional traceback based on NODE_ENV
    
    Args:
        error: The exception to log
        message: Optional custom message
    """
    log_error(error, message)