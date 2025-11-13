#!/usr/bin/env python3
"""
Execute sales schema in Supabase using direct PostgreSQL connection
"""
import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

print("="*70)
print("SALES MODULE - Database Schema")
print("="*70)

# Read SQL file
sql_file = ROOT_DIR / 'sales_schema.sql'
with open(sql_file, 'r') as f:
    sql_content = f.read()

print(f"\n✅ Schema SQL loaded from: {sql_file}")
print(f"   Size: {len(sql_content)} characters")

print("\n" + "="*70)
print("NEXT STEPS:")
print("="*70)
print("\n1. Go to Supabase Dashboard:")
print(f"   {SUPABASE_URL.replace('/rest/v1', '')}")
print("\n2. Navigate to: SQL Editor")
print("\n3. Create new query and paste the content from:")
print(f"   {sql_file}")
print("\n4. Run the query")

print("\n" + "="*70)
print("TABLES TO BE CREATED:")
print("="*70)
print("  • oportunidades - Sales opportunities")
print("  • actividades - Follow-up activities")
print("  • Function: calcular_prioridad() - Auto priority calculation")
print("  • RLS Policies - Admin-only access")
print("="*70)

# For development, we can also use requests to execute via HTTP
# but Supabase REST API doesn't support DDL directly
print("\nAlternatively, if you have psycopg2 installed:")
print("We can execute it directly via PostgreSQL connection.")
print("="*70)
