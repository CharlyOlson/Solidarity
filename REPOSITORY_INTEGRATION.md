# Repository Integration Guide

## Twin Repository Architecture

The Solidarity platform operates across two interlaced repositories for maximum efficiency and security:

### **Solidarity** (Production Repository)
- **Purpose**: Production-ready audio processing & financial commerce platform
- **Status**: ✅ Stable, deployed, frontend-ready
- **Contains**: 
  - Main application code
  - Production APIs
  - Financial integration
  - Security implementation

### **Coul-Curve** (Development Repository)
- **Purpose**: Advanced harmonic research & experimental features
- **Status**: 🧪 Research & Development
- **Contains**:
  - Enhanced harmonic zip system
  - Advanced audio processing algorithms
  - Experimental spatial features
  - Research implementations

## Integration Points

### 1. Shared Audio Engine
```bash
# Coul-Curve development feeds into Solidarity production
Coul-Curve/src/harmonicZipSystem.js → Solidarity/src/audio/
```

### 2. Cross-Repository Commands
```bash
# From Solidarity, pull latest Coul-Curve research
npm run sync:coul-curve

# From Coul-Curve, deploy to Solidarity
npm run deploy:solidarity
```

### 3. Unified Testing
```bash
# Test both repositories together
npm run test:cross-repo
```

## Development Workflow

1. **Research** new features in **Coul-Curve**
2. **Stabilize** features through testing
3. **Integrate** stable features into **Solidarity**
4. **Deploy** production updates

## Quick Cross-Repository Setup

```bash
# Clone both repositories
git clone https://github.com/yourusername/Solidarity.git
git clone https://github.com/yourusername/Coul-Curve.git

# Link repositories for development
cd Solidarity
npm run link:coul-curve ../Coul-Curve
```

This twin-repository approach ensures:
- **Stability** in production (Solidarity)
- **Innovation** in development (Coul-Curve)
- **Security** through separation of concerns
- **Efficiency** through focused development
