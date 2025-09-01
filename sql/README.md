# Database Scripts

This directory contains database scripts and queries for the Solidarity platform.

## Structure

- `schema/` - Database schema definitions
- `migrations/` - Database migration scripts
- `seeds/` - Seed data for development
- `queries/` - Common SQL queries
- `procedures/` - Stored procedures and functions

## Database Setup

1. Create database: `createdb solidarity_db`
2. Run migrations: `npm run migrate`
3. Seed development data: `npm run seed`

## Supported Databases

- PostgreSQL (recommended)
- MySQL
- SQLite (development only)

## Schema Overview

- `users` - User accounts and profiles
- `transactions` - Financial transactions
- `contracts` - Smart contract interactions
- `exchanges` - Exchange operations
- `audit_logs` - Security and compliance logging