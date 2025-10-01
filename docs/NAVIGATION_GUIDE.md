# Solidarity Platform Navigation Guide

## Quick Navigation Map

### 🚀 Common Tasks

| Need to... | Go to... |
| :-- | :-- |
| Deploy smart contract | `/contracts/` + `/contracts/deployment/` |
| Update project metrics | `/analytics/config/project-analytics.json` |
| Check Scott's devices | `/network/devices/scotts-*.json` |
| Partner API docs | `/integration/partners/api-documentation.md` |
| Database schema changes | `/sql/schema/` |
| Risk assessment logic | `/src/services/riskAssessment.js` |
| Color/gradient system | `/src/utils/colorMapping.js` |
| Analytics reports | `/analytics/reports/` |

### 📱 Device Management (Kansas 66210-66204)

| Device | Config File | Status |
| :-- | :-- | :-- |
| Scott's PCC | `/network/devices/scotts-pcc.json` | Primary |
| Scott's iPhone | `/network/devices/scotts-iphone.json` | Mobile |
| Scott's iPad | `/network/devices/scotts-ipad.json` | Tablet |

### 🔧 Development Shortcuts

```bash
# Quick file access patterns:
contracts/[feature].sol           # Smart contract logic
sql/schema/[feature].sql          # Database structure  
src/services/[feature].js         # Business logic
analytics/config/[feature].json   # Configuration
integration/partners/[feature].md # Documentation
```

### 🎯 Project Types & Locations

| Project Type | Primary Location | Config Location |
| :-- | :-- | :-- |
| **Core Platform** | `/src/` | `/analytics/config/` |
| **Smart Contracts** | `/contracts/` | `/contracts/deployment/` |
| **Analytics** | `/analytics/` | `/analytics/config/` |
| **Partner Integration** | `/integration/` | `/integration/partners/` |
| **Network Management** | `/network/` | `/network/zones/` |

### 🔍 File Type Quick Reference

- `.sol` → Smart contracts (`/contracts/`)
- `.sql` → Database files (`/sql/`)
- `.js` → Application logic (`/src/`)
- `.json` → Configuration (`/analytics/config/`, `/network/`)
- `.md` → Documentation (`/docs/`, `/analytics/reports/`)

## Authentication System Overview

The Solidarity authentication system ("Hanko") follows a 7-step process:

1. **Initialize Session** (`/api/auth/hanko/init`)
2. **Collect User Inputs** (`/api/auth/hanko/inputs`) - 7 sacred inputs
3. **Generate Authentication Shape** (`/api/auth/hanko/shape`)
4. **Process Labyrinth Path** (`/api/auth/hanko/labyrinth`)
5. **Determine Color Landing** (`/api/auth/hanko/color`)
6. **Generate Legal Stamp** (`/api/auth/hanko/stamp`)
7. **Prepare Audit Trail** (`/api/auth/hanko/audit`)

This authentication flow aligns with the sacred number 7, representing the gateway to secure access.