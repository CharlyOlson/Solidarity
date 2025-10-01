# Test Suites & Demos

This folder contains all test scripts and demo files for verifying system components and features of the Solidarity project.

## Available Tests

- **test_numpy_quick.py**: Tests NumPy installation and basic audio math capabilities
- **test_discovery.py**: Tests environment setup, Node.js availability, and essential file existence
- **test_advanced_audio.py**: Tests advanced audio processing modules and functionality

## Running Tests

### Run Individual Tests

```bash
# Run NumPy and basic tests
python tests/test_numpy_quick.py

# Run discovery system tests
python tests/test_discovery.py

# Run advanced audio tests
python tests/test_advanced_audio.py
```

### Run All Tests

You can run all tests using Python's unittest discovery:

```bash
python -m unittest discover -s tests
```

## Notes

- The original test files are backed up in the `_backup_tests` directory
- All tests use Python's unittest framework for consistent structure
- Tests that require external dependencies will be skipped if those dependencies are not available
