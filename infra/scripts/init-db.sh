#!/bin/bash
# Initialize database with migrations and seed data

echo "🔄 Running database migrations..."
cd /app
alembic upgrade head

echo "🌱 Seeding database..."
python -m app.seed

echo "✅ Database initialization complete!"
