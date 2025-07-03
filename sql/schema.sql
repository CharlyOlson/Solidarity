-- Solidarity Platform Database Schema
-- Created by Scott Charles Olson (Charly)
-- Version 2.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    kyc_verified BOOLEAN DEFAULT FALSE
);

-- Stability metrics table
CREATE TABLE stability_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_timestamp DATE NOT NULL,
    price DECIMAL(18, 8) NOT NULL,
    volume DECIMAL(18, 8) NOT NULL,
    liquidity_depth DECIMAL(18, 8) NOT NULL,
    stability_score DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(day_timestamp)
);

-- Treasury transactions table
CREATE TABLE treasury_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    community_pool_amount DECIMAL(18, 8) NOT NULL,
    payroll_treasury_amount DECIMAL(18, 8) NOT NULL,
    operational_reserve_amount DECIMAL(18, 8) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Governance proposals table
CREATE TABLE governance_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    proposer_id UUID REFERENCES users(id),
    voting_start TIMESTAMP WITH TIME ZONE NOT NULL,
    voting_end TIMESTAMP WITH TIME ZONE NOT NULL,
    yes_votes DECIMAL(18, 8) DEFAULT 0,
    no_votes DECIMAL(18, 8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'passed', 'failed', 'executed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User votes table
CREATE TABLE user_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES governance_proposals(id),
    user_id UUID REFERENCES users(id),
    vote_type VARCHAR(3) NOT NULL CHECK (vote_type IN ('yes', 'no')),
    voting_power DECIMAL(18, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, user_id)
);

-- Token balances table (for tracking off-chain balances)
CREATE TABLE token_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    token_address VARCHAR(42) NOT NULL,
    balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token_address)
);

-- COIL units hierarchy table (from whitepaper)
CREATE TABLE coil_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimals INTEGER NOT NULL,
    base_value DECIMAL(18, 8) NOT NULL,
    hierarchy_level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial COIL unit hierarchy
INSERT INTO coil_units (name, symbol, decimals, base_value, hierarchy_level) VALUES
('Soul', 'SOUL', 18, 1.0, 1),
('Spirit', 'SPRT', 12, 0.001, 2),
('Essence', 'ESS', 8, 0.000001, 3),
('Spark', 'SPK', 4, 0.000000001, 4);

-- Integration hub connections table
CREATE TABLE integration_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_name VARCHAR(100) NOT NULL,
    api_endpoint VARCHAR(255),
    status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Harmonic patterns table (from TIMBR compression feature)
CREATE TABLE harmonic_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_name VARCHAR(100) NOT NULL,
    frequency DECIMAL(10, 4) NOT NULL,
    amplitude DECIMAL(10, 4) NOT NULL,
    phase DECIMAL(10, 4) NOT NULL,
    compression_ratio DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Omega locks table
CREATE TABLE omega_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    locked_amount DECIMAL(18, 8) NOT NULL,
    lock_duration INTEGER NOT NULL, -- in days
    lock_start TIMESTAMP WITH TIME ZONE NOT NULL,
    lock_end TIMESTAMP WITH TIME ZONE NOT NULL,
    bonus_multiplier DECIMAL(3, 2) DEFAULT 1.0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_stability_metrics_day ON stability_metrics(day_timestamp);
CREATE INDEX idx_treasury_transactions_timestamp ON treasury_transactions(timestamp);
CREATE INDEX idx_governance_proposals_status ON governance_proposals(status);
CREATE INDEX idx_user_votes_proposal ON user_votes(proposal_id);
CREATE INDEX idx_token_balances_user_token ON token_balances(user_id, token_address);
CREATE INDEX idx_omega_locks_user_status ON omega_locks(user_id, status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
