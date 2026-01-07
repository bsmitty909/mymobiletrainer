#!/usr/bin/env python3
"""
Excel Workout Data Extractor

Parses trainingapp.xlsx and generates complete workout program JSON
"""

import pandas as pd
import json

def parse_excel_to_workout_program(excel_file):
    """Parse Excel file and convert to workout program JSON"""
    
    # Read all sheets
    xls = pd.ExcelFile(excel_file)
    
    print(f"Found {len(xls.sheet_names)} sheets\n")
    
    # Try to find data in Week 1 sheet
    for sheet_name in xls.sheet_names:
        if 'WEEK 1' in sheet_name.upper() and 'MASTER' in sheet_name.upper():
            print(f"\nAnalyzing sheet: {sheet_name}")
            df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
            
            # Print all non-empty rows
            for idx, row in df.iterrows():
                if row.notna().any():  # If row has any non-null values
                    print(f"Row {idx}: {row.tolist()[:10]}")  # First 10 columns
                    
                if idx > 50:  # Stop after 50 rows
                    break
            break
    
    return None

if __name__ == "__main__":
    try:
        parse_excel_to_workout_program("trainingapp.xlsx")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
