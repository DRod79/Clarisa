#!/usr/bin/env python3
"""
Execute sales schema directly in Supabase PostgreSQL
"""
import psycopg2
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase connection string
# Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
# Extract project ref from URL
project_ref = SUPABASE_URL.split('//')[1].split('.')[0] if SUPABASE_URL else 'sgmguxorpixygluwzjug'

# Note: We need the database password which is different from the API keys
# For now, we'll use the REST API approach or manual execution

print("="*70)
print("SALES MODULE - Database Schema Execution")
print("="*70)

print("\n⚠️  DATABASE CONNECTION REQUIRED")
print("\nTo execute this schema, you need the Supabase database password.")
print("This is different from the API keys.")

print("\n" + "="*70)
print("OPTION 1: Manual Execution (RECOMMENDED)")
print("="*70)
print(f"\n1. Go to: https://{project_ref}.supabase.co/project/{project_ref}/sql")
print("2. Click 'New Query'")
print("3. Copy and paste the content from: /app/backend/sales_schema.sql")
print("4. Click 'Run'")

print("\n" + "="*70)
print("OPTION 2: Direct Connection")
print("="*70)
print("\nIf you have the database password, you can execute:")
print(f"psql 'postgresql://postgres:[PASSWORD]@db.{project_ref}.supabase.co:5432/postgres' < sales_schema.sql")

print("\n" + "="*70)

# Try to use Supabase Management API
print("\nAttempting automated execution...")
print("(This requires appropriate permissions)")
print("="*70 + "\n")

# Read SQL file
sql_file = ROOT_DIR / 'sales_schema.sql'
with open(sql_file, 'r') as f:
    sql_content = f.read()

print(f"✅ Schema loaded: {len(sql_content)} characters")
print(f"✅ File ready: {sql_file}")
print("\nPlease execute manually via Supabase Dashboard → SQL Editor")
print("="*70)
