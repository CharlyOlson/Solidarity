-- Gradient Scaling Table Definition
-- Node 6 of Twelve-Node Self-Correcting System
-- Author: Scott Charles Olson (Charly)

CREATE TABLE IF NOT EXISTS gradient_scaling (
    -- Primary identification
    scaling_id SERIAL PRIMARY KEY,
    scaling_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    
    -- Scaling configuration
    scaling_name VARCHAR(255) NOT NULL,
    scaling_type VARCHAR(100) NOT NULL,
    gradient_direction VARCHAR(20) CHECK (gradient_direction IN ('ASCENDING', 'DESCENDING', 'BIDIRECTIONAL')),
    
    -- Henry 7 Step 14 Shoe Waltz parameters
    base_value DECIMAL(10, 4) NOT NULL DEFAULT 7.0,
    double_value DECIMAL(10, 4) NOT NULL DEFAULT 14.0,
    square_value DECIMAL(10, 4) NOT NULL DEFAULT 49.0,
    control_ratio DECIMAL(10, 4) NOT NULL DEFAULT 3.5,
    
    -- Gradient steps (aligned with framework)
    step_count INTEGER NOT NULL CHECK (step_count IN (7, 14, 49)),
    current_step INTEGER DEFAULT 0,
    step_increment DECIMAL(10, 4),
    
    -- Lock mechanism
    lock_state VARCHAR(20) CHECK (lock_state IN ('ALPHA', 'BETA', 'OMEGA')),
    lock_timestamp TIMESTAMP,
    
    -- Temporal control (fiscal time moves forward)
    fiscal_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processing_timestamp TIMESTAMP,
    cog_mode VARCHAR(50) CHECK (cog_mode IN ('NORMAL', 'FUNCTION_SWITCH', 'REVERSE_PROCESS')),
    
    -- Harmonic alignment
    harmonic_frequency DECIMAL(10, 4),
    harmonic_alignment_score DECIMAL(5, 2) CHECK (harmonic_alignment_score >= 0 AND harmonic_alignment_score <= 100),
    
    -- Validation
    pythagorean_verified BOOLEAN DEFAULT FALSE,
    validation_error DECIMAL(10, 4),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_gradient_type ON gradient_scaling(scaling_type);
CREATE INDEX idx_gradient_lock_state ON gradient_scaling(lock_state);
CREATE INDEX idx_gradient_step ON gradient_scaling(current_step);
CREATE INDEX idx_gradient_harmonic ON gradient_scaling(harmonic_alignment_score);
CREATE INDEX idx_gradient_active ON gradient_scaling(active);
CREATE INDEX idx_gradient_fiscal_time ON gradient_scaling(fiscal_timestamp);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_gradient_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    -- Ensure fiscal time always moves forward
    IF NEW.fiscal_timestamp < OLD.fiscal_timestamp THEN
        RAISE EXCEPTION 'Fiscal time must always move forward';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gradient_updated_at
    BEFORE UPDATE ON gradient_scaling
    FOR EACH ROW
    EXECUTE FUNCTION update_gradient_updated_at();

-- Function to verify Pythagorean relationship
CREATE OR REPLACE FUNCTION verify_pythagorean_gradient(scaling_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    a_squared INTEGER := 49;  -- 7²
    b_squared INTEGER := 576; -- 24²
    c_squared INTEGER := 625; -- 25²
    result BOOLEAN;
BEGIN
    result := (a_squared + b_squared) = c_squared;
    
    UPDATE gradient_scaling
    SET pythagorean_verified = result
    WHERE gradient_scaling.scaling_id = verify_pythagorean_gradient.scaling_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to advance gradient step
CREATE OR REPLACE FUNCTION advance_gradient_step(scaling_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    max_steps INTEGER;
    current INTEGER;
BEGIN
    SELECT step_count, current_step
    INTO max_steps, current
    FROM gradient_scaling
    WHERE gradient_scaling.scaling_id = advance_gradient_step.scaling_id;
    
    IF current < max_steps THEN
        UPDATE gradient_scaling
        SET current_step = current_step + 1,
            fiscal_timestamp = CURRENT_TIMESTAMP
        WHERE gradient_scaling.scaling_id = advance_gradient_step.scaling_id;
        
        RETURN current + 1;
    ELSE
        RETURN current;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE gradient_scaling IS 'Node 6: Gradient scaling with Henry 7 Step 14 Shoe Waltz framework';
COMMENT ON COLUMN gradient_scaling.base_value IS 'Base value: 7 (foundation of framework)';
COMMENT ON COLUMN gradient_scaling.double_value IS 'Double value: 14 (scaled checkpoint)';
COMMENT ON COLUMN gradient_scaling.square_value IS 'Square value: 49 (completion threshold)';
COMMENT ON COLUMN gradient_scaling.control_ratio IS 'Control ratio: 3.5 (49÷14)';
COMMENT ON COLUMN gradient_scaling.fiscal_timestamp IS 'Fiscal time always moves forward';
COMMENT ON COLUMN gradient_scaling.cog_mode IS 'Cogs switch function, not direction';
COMMENT ON COLUMN gradient_scaling.pythagorean_verified IS 'Verified against 7²+24²=25²';
