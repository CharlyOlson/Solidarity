# GitHub Copilot Instructions for Solidarity Platform

## Project Overview
The Solidarity Platform is a comprehensive system implementing the Henry 7 Step 14 Shoe Waltz numerological framework, featuring harmonic processing, temporal control, and mathematical precision. This is a mixed JavaScript/Python codebase with complex mathematical relationships.

## Code Style & Standards

### JavaScript
- Use ES6+ modules (`import`/`export`)
- Prefer `const` and `let` over `var`
- Use async/await for asynchronous operations
- Follow the existing class-based architecture
- Maintain mathematical precision in all calculations
- Include comprehensive JSDoc comments for complex mathematical functions

### Python
- Follow PEP 8 style guidelines
- Use type hints for function parameters and return values
- Maintain scientific precision in numerical calculations
- Use numpy for array operations and mathematical computations
- Include detailed docstrings for complex mathematical algorithms

### General Principles
- **Mathematical Accuracy**: All harmonic and numerical calculations must be mathematically precise
- **Documentation**: Complex mathematical concepts require clear explanations
- **Testing**: All new functionality must have corresponding tests
- **Backwards Compatibility**: Maintain compatibility with existing APIs
- **Performance**: Optimize for audio processing and real-time applications

## Architecture Guidelines

### Core Components
1. **Henry 7 Step 14 Shoe Waltz** - The foundational numerological system
2. **Harmonic Processing** - Audio analysis and harmonic series calculations
3. **Temporal Control** - Time-based processing with cog switching mechanisms
4. **Platform Integration** - Orchestrates all components together
5. **Cubit Calculation** - Sacred geometry and measurement systems

### Key Mathematical Relationships
- Base progression: 7 → 14 → 49
- Control ratio: 3.5 (49÷14)
- Source paths: 2+5=7 and 3+4=7
- Pythagorean verification: 7²+24²=25²
- Total cubits: ~697 (validated through ring calculations)

### Module Structure
- Keep mathematical logic separate from I/O operations
- Use dependency injection for configuration
- Implement proper error handling for edge cases
- Maintain state consistency across components

## Testing Guidelines

### Test Structure
- Use the existing test framework (`tests/run-tests.js`)
- Include both unit tests and integration tests
- Validate mathematical relationships and harmonic calculations
- Test edge cases and boundary conditions

### Mathematical Validation
- Verify all harmonic series calculations
- Test temporal control mechanisms
- Validate cubit allocation accuracy
- Ensure Pythagorean relationships hold

### Performance Testing
- Test audio processing performance
- Validate real-time processing capabilities
- Monitor memory usage for long-running processes

## Common Patterns

### Configuration Management
```javascript
// Use configuration objects with sensible defaults
constructor(config = {}) {
    this.config = {
        defaultValue: config.defaultValue ?? 'default',
        ...config
    };
}
```

### Error Handling
```javascript
// Provide meaningful error messages for mathematical failures
if (!this.validateMathematicalRelationship()) {
    throw new Error('Mathematical validation failed: 7→14→49 progression violated');
}
```

### Mathematical Operations
```python
# Use numpy for precision and performance
import numpy as np

def calculate_harmonic_series(fundamental: float, num_harmonics: int) -> np.ndarray:
    """Calculate harmonic series with mathematical precision."""
    return np.array([fundamental * (i + 1) for i in range(num_harmonics)])
```

## Integration Points

### Cross-Language Integration
- Python handles intensive mathematical computations
- JavaScript manages platform orchestration and I/O
- Use proper data serialization between components
- Maintain consistent APIs across languages

### Audio Processing
- Use standard sample rates (44100 Hz)
- Implement proper buffering for real-time processing
- Handle audio format conversions gracefully

### Temporal Control
- Respect the principle: "fiscal time always moves forward"
- Allow cogs to switch function, not direction
- Maintain synchronization across components

## Security Considerations
- Validate all input parameters
- Sanitize mathematical expressions
- Prevent buffer overflows in audio processing
- Secure configuration loading

## Performance Optimization
- Use efficient algorithms for harmonic calculations
- Implement caching for repeated calculations
- Optimize for CPU and memory usage
- Consider parallel processing for intensive operations

## Documentation Requirements
- Include mathematical proofs for complex algorithms
- Provide usage examples for all public APIs
- Document the philosophical and mathematical foundations
- Maintain changelog for mathematical formula updates

## Trademark and Licensing
- Respect the trademark by Scott Charles Olson
- Follow the licensing terms in LICENSE.md
- Acknowledge contributors: "Charly" (Scott Charles Olson) and "Hank" (Charles H. Dykes)

## When Writing New Code
1. Understand the mathematical context first
2. Validate relationships against the 7→14→49 progression
3. Include comprehensive tests
4. Document the mathematical reasoning
5. Ensure integration with existing components
6. Maintain performance standards for audio processing
7. Follow the established architectural patterns