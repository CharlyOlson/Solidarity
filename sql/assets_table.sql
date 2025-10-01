-- Assets Table Definition
-- Node 1 of Twelve-Node Self-Correcting System
-- Author: Scott Charles Olson (Charly)

CREATE TABLE IF NOT EXISTS assets (
    -- Primary identification
    asset_id SERIAL PRIMARY KEY,
    asset_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    
    -- Asset details
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    asset_category VARCHAR(100),
    
    -- Ownership and tracking
    owner_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Henry 7 Step 14 Shoe Waltz alignment
    harmonic_value INTEGER CHECK (harmonic_value IN (7, 14, 49)),
    progression_stage VARCHAR(20) CHECK (progression_stage IN ('BASE', 'DOUBLE', 'SQUARE')),
    
    -- Lock mechanism for twelve-node system
    lock_state VARCHAR(20) CHECK (lock_state IN ('ALPHA', 'BETA', 'OMEGA')),
    lock_timestamp TIMESTAMP,
    
    -- Cubit allocation
    cubit_allocation DECIMAL(10, 2),
    cubit_ring VARCHAR(20) CHECK (cubit_ring IN ('INNER', 'MIDDLE', 'OUTER', 'VERIFICATION')),
    
    -- Validation and integrity
    pythagorean_verified BOOLEAN DEFAULT FALSE,
    validation_score DECIMAL(5, 2) CHECK (validation_score >= 0 AND validation_score <= 100),
    
    -- Metadata
    metadata JSONB,
    active BOOLEAN DEFAULT TRUE,
    
    -- Indexes for performance
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX idx_assets_owner ON assets(owner_id);
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_harmonic ON assets(harmonic_value);
CREATE INDEX idx_assets_lock_state ON assets(lock_state);
CREATE INDEX idx_assets_active ON assets(active);
CREATE INDEX idx_assets_created ON assets(created_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_assets_updated_at();

-- Comments for documentation
COMMENT ON TABLE assets IS 'Node 1: Asset tracking with Henry 7 Step 14 Shoe Waltz alignment';
COMMENT ON COLUMN assets.harmonic_value IS 'Must be 7, 14, or 49 per framework';
COMMENT ON COLUMN assets.lock_state IS 'Alpha, Beta, or Omega lock for self-correction';
COMMENT ON COLUMN assets.cubit_allocation IS 'Sacred geometry cubit allocation (~697 total system)';
COMMENT ON COLUMN assets.pythagorean_verified IS 'Verified against 7²+24²=25² relationship';
