#!/usr/bin/env python3
"""
PRISM E-Commerce Dataset Generator CLI
"""

import sys
import os
import argparse
from pathlib import Path

# Add project root and apps/api to path
script_dir = Path(__file__).resolve().parent
api_dir = script_dir.parent
sys.path.insert(0, str(api_dir))

from src.data_generator.generator import DatasetGenerator


def main():
    parser = argparse.ArgumentParser(description="PRISM Deterministic E-Commerce Synthetic Dataset Generator")
    parser.add_argument("--seed", type=int, default=42, help="Deterministic random seed (default: 42)")
    parser.add_argument("--start-date", type=str, default="2025-05-01", help="Start date YYYY-MM-DD (default: 2025-05-01)")
    parser.add_argument("--end-date", type=str, default="2026-10-31", help="End date YYYY-MM-DD (default: 2026-10-31)")
    parser.add_argument("--customers", type=int, default=10000, help="Target customer count (default: 10,000)")
    parser.add_argument("--products", type=int, default=380, help="Target product count (default: 380)")
    parser.add_argument("--output-dir", type=str, default="data/generated", help="Output directory")

    args = parser.parse_args()

    print("==================================================")
    print("  PRISM — E-COMMERCE DATASET GENERATOR (Phase 02)")
    print("==================================================")
    print(f"Seed: {args.seed}")
    print(f"Date Range: {args.start_date} to {args.end_date} (~18 months)")
    print(f"Target Customers: {args.customers:,}")
    print(f"Target Products: {args.products:,}")
    print("--------------------------------------------------")

    generator = DatasetGenerator(
        seed=args.seed,
        start_date=args.start_date,
        end_date=args.end_date,
        target_customers=args.customers,
        target_products=args.products,
    )

    print("1. Generating product catalog...")
    generator.generate_products()

    print("2. Generating customer demographics...")
    generator.generate_customers()

    print("3. Generating marketing campaigns...")
    generator.generate_campaigns()

    print("4. Simulating sessions, funnels & order transactions...")
    generator.generate_sessions_and_orders()

    print("5. Exporting datasets...")
    generator.export_dataset(output_dir=args.output_dir)

    print("==================================================")
    print("  ✓ Dataset generation completed successfully!")
    print("==================================================")


if __name__ == "__main__":
    main()
