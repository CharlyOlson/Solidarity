# Solidarity SQL Database Schemas

This directory contains PostgreSQL database schemas for the Solidarity Platform's twelve-node self-correcting system.

## Overview

These schemas implement the Henry 7 Step 14 Shoe Waltz framework (7→14→49 progression) with temporal control and harmonic alignment.

## Tables

### Node 1: assets_table.sql
Asset tracking with harmonic alignment and cubit allocation.

**Key Features:**
- UUID-based identification
- Henry 7 Step framework alignment (7, 14, 49)
- Alpha/Beta/Omega lock states
- Cubit ring allocation (Inner, Middle, Outer, Verification)
- Pythagorean verification
- Automatic timestamp updates

**Columns:**
```sql
asset_id              -- Primary key
asset_uuid            -- Unique identifier
asset_name            -- Asset name
asset_type            -- Type classification
harmonic_value        -- Must be 7, 14, or 49
progression_stage     -- BASE, DOUBLE, or SQUARE
lock_state           -- ALPHA, BETA, or OMEGA
cubit_allocation     -- Sacred geometry allocation
cubit_ring           -- Ring position
pythagorean_verified -- 7²+24²=25² verification
validation_score     -- 0-100 score
```

**Usage:**
```sql
-- Insert asset with harmonic alignment
INSERT INTO assets (
    asset_name, asset_type, harmonic_value, 
    progression_stage, lock_state
) VALUES (
    'Primary Asset', 'digital', 49, 
    'SQUARE', 'BETA'
);

-- Query by harmonic value
SELECT * FROM assets WHERE harmonic_value = 7;

-- Verify Pythagorean relationship
SELECT * FROM assets WHERE pythagorean_verified = TRUE;
```

### Node 6: gradient_scaling.sql
Gradient scaling with temporal control and harmonic progression.

**Key Features:**
- Henry 7 Step framework parameters (7, 14, 49, 3.5)
- Temporal control (fiscal time always forward)
- Cog mode switching (function, not direction)
- Harmonic frequency tracking
- Pythagorean verification functions
- Step advancement automation

**Columns:**
```sql
scaling_id              -- Primary key
scaling_name            -- Scaling configuration name
base_value              -- 7 (framework foundation)
double_value            -- 14 (scaled checkpoint)
square_value            -- 49 (completion threshold)
control_ratio           -- 3.5 (49÷14)
step_count              -- Must be 7, 14, or 49
current_step            -- Progress tracker
fiscal_timestamp        -- Always moves forward
processing_timestamp    -- Can reverse for processing
cog_mode               -- NORMAL, FUNCTION_SWITCH, REVERSE_PROCESS
harmonic_alignment_score -- 0-100 alignment score
pythagorean_verified    -- Verification status
```

**Functions:**
```sql
-- Verify Pythagorean relationship
SELECT verify_pythagorean_gradient(scaling_id);

-- Advance to next step
SELECT advance_gradient_step(scaling_id);
```

**Usage:**
```sql
-- Create gradient scaling
INSERT INTO gradient_scaling (
    scaling_name, scaling_type, gradient_direction,
    step_count, lock_state, cog_mode
) VALUES (
    'Audio Harmonic Scale', 'harmonic', 'ASCENDING',
    49, 'BETA', 'NORMAL'
);

-- Update with temporal validation (fiscal time must advance)
UPDATE gradient_scaling 
SET current_step = current_step + 1,
    fiscal_timestamp = CURRENT_TIMESTAMP
WHERE scaling_id = 1;

-- Query active scalings with high alignment
SELECT * FROM gradient_scaling 
WHERE active = TRUE 
  AND harmonic_alignment_score > 80;
```

## Key Principles

### Temporal Control
The database enforces the principle: **"Fiscal time always moves forward"**

- `fiscal_timestamp` can only increase
- Triggers prevent backward time movement
- `processing_timestamp` can reverse for processing
- `cog_mode` tracks function switching

### Harmonic Alignment
All tables align with the Henry 7 Step 14 Shoe Waltz framework:

```
Base:    7
Double:  14 (7 × 2)
Square:  49 (7²)
Control: 3.5 (49 ÷ 14)
```

### Pythagorean Verification
Mathematical relationship: **7² + 24² = 25²**

```
49 + 576 = 625 ✓
```

Verification ensures harmonic integrity across the system.

## Database Setup

### PostgreSQL Installation

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Start service
sudo service postgresql start
```

### Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE solidarity;

# Create user
CREATE USER solidarity_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE solidarity TO solidarity_user;
```

### Run Migrations

```bash
# Execute schema files
psql -U solidarity_user -d solidarity -f sql/assets_table.sql
psql -U solidarity_user -d solidarity -f sql/gradient_scaling.sql
```

## Integration with Application

### Node.js Example

```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    host: 'localhost',
    database: 'solidarity',
    user: 'solidarity_user',
    password: 'your_password',
    port: 5432
});

// Insert asset
const result = await pool.query(
    'INSERT INTO assets (asset_name, harmonic_value) VALUES ($1, $2) RETURNING asset_id',
    ['Test Asset', 7]
);

// Query with harmonic alignment
const assets = await pool.query(
    'SELECT * FROM assets WHERE harmonic_value = $1 AND active = TRUE',
    [49]
);
```

### Python Example

```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="solidarity",
    user="solidarity_user",
    password="your_password"
)

cur = conn.cursor()

# Insert gradient scaling
cur.execute("""
    INSERT INTO gradient_scaling (scaling_name, step_count)
    VALUES (%s, %s) RETURNING scaling_id
""", ('Audio Scale', 49))

scaling_id = cur.fetchone()[0]

# Verify Pythagorean relationship
cur.execute("SELECT verify_pythagorean_gradient(%s)", (scaling_id,))
is_verified = cur.fetchone()[0]

conn.commit()
cur.close()
conn.close()
```

## Twelve-Node System Integration

These schemas form nodes 1 and 6 of the twelve-node self-correcting system. They integrate with:

- **Smart Contracts** (Solidity): Blockchain-based verification
- **JavaScript Modules**: Application logic and orchestration
- **Python Modules**: Harmonic processing and analysis
- **Other Nodes**: Complete system harmony

## Maintenance

### Backup

```bash
# Backup database
pg_dump -U solidarity_user solidarity > solidarity_backup.sql

# Restore
psql -U solidarity_user -d solidarity < solidarity_backup.sql
```

### Monitoring

```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public';

-- Check active connections
SELECT * FROM pg_stat_activity WHERE datname = 'solidarity';
```

## License

MIT License - See LICENSE file

## Authors

- Scott Charles Olson ("Charly") - Architect
- Charles H. Dykes ("Hank") - Framework Designer

---

© 2025 Scott Charles Olson. All rights reserved.  
TRADEMARKED BY SCOTT CHARLES OLSON
