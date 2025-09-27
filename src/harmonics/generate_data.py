"""
Generate Harmonic Data Files
Author: Scott Charles Olson, "Charly"
Date: August 24, 2025

Generate CSV files containing complete harmonic series data for verification and reference.
"""

import csv
import math
import sys
import os

# Add the harmonics module to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'harmonics'))
from core_harmonics import HarmonicProcessor

# Add the parent directory to path for error_utils
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from error_utils import log_error


def generate_complete_harmonic_series_csv():
    """Generate complete harmonic series CSV file"""
    processor = HarmonicProcessor()
    
    # Generate harmonic series for C (261.63 Hz) - good reference frequency
    fundamental = 261.63  # Middle C
    harmonics = processor.generate_harmonic_series(fundamental, 32)
    
    # Write to CSV
    csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'complete_harmonic_series.csv')
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)
    
    with open(csv_path, 'w', newline='') as csvfile:
        fieldnames = [
            'Harmonic_Number', 
            'Frequency_Hz', 
            'Ratio', 
            'Ratio_Decimal',
            'Cents_From_Fundamental', 
            'Octave',
            'Musical_Interval',
            'Mathematical_Harmonic_Hn'
        ]
        
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        # Musical intervals for first 32 harmonics
        intervals = [
            'Unison', 'Octave', 'Perfect 5th', '2nd Octave', 'Major 3rd', 'Perfect 5th',
            'Minor 7th (flat)', '3rd Octave', 'Major 2nd', 'Major 3rd', 'Augmented 4th',
            'Perfect 5th', 'Major 6th (sharp)', 'Minor 7th', 'Major 7th', '4th Octave',
            'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th',
            'Augmented 4th', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th',
            'Major 7th', 'Major 7th', '5th Octave', 'Minor 2nd', 'Major 2nd', 'Major 2nd'
        ]
        
        for n in range(1, 33):
            h = harmonics[n]
            writer.writerow({
                'Harmonic_Number': n,
                'Frequency_Hz': round(h['frequency'], 3),
                'Ratio': h['ratio'],
                'Ratio_Decimal': h['ratio_decimal'],
                'Cents_From_Fundamental': round(h['cents_from_fundamental'], 2),
                'Octave': h['octave'],
                'Musical_Interval': intervals[n-1] if n <= len(intervals) else f'Harmonic {n}',
                'Mathematical_Harmonic_Hn': h['mathematical_harmonic']
            })
    
    print(f"Generated complete harmonic series CSV: {csv_path}")
    return csv_path


def generate_harmonic_verification_backup_csv():
    """Generate harmonic verification backup CSV for data integrity checking"""
    processor = HarmonicProcessor()
    
    # Test with A440 for verification
    fundamental = 440.0
    harmonics = processor.generate_harmonic_series(fundamental, 32)
    
    csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'harmonic_verification_backup.csv')
    
    with open(csv_path, 'w', newline='') as csvfile:
        fieldnames = [
            'Harmonic',
            'Frequency',
            'Ratio',
            'Note',
            'Octave',
            'Musical_Interval',
            'Cents_Deviation',
            'Mathematical_Harmonic',
            'Verification_Checksum'
        ]
        
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        # Note approximations for A440 harmonics
        notes = [
            'A', 'A', 'E', 'A', 'C#', 'E', 'G', 'A', 'B', 'C#', 'D#', 'E',
            'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F',
            'F#', 'G', 'G#', 'G#', 'A', 'A#', 'B', 'B'
        ]
        
        intervals = [
            'Unison', 'Octave', 'Perfect 5th', '2nd Octave', 'Major 3rd',
            'Perfect 5th', 'Minor 7th', '3rd Octave', 'Major 2nd', 'Major 3rd',
            'Augmented 4th', 'Perfect 5th', 'Major 6th', 'Minor 7th', 'Major 7th',
            '4th Octave', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd',
            'Perfect 4th', 'Augmented 4th', 'Perfect 5th', 'Minor 6th', 'Major 6th',
            'Minor 7th', 'Major 7th', 'Major 7th', '5th Octave', 'Minor 2nd',
            'Major 2nd', 'Major 2nd'
        ]
        
        for n in range(1, 33):
            h = harmonics[n]
            
            # Calculate verification checksum (simple hash of key values)
            checksum = hash(f"{n}{h['frequency']}{h['ratio']}")
            
            writer.writerow({
                'Harmonic': n,
                'Frequency': round(h['frequency'], 2),
                'Ratio': h['ratio'],
                'Note': notes[n-1] if n <= len(notes) else 'X',
                'Octave': h['octave'],
                'Musical_Interval': intervals[n-1] if n <= len(intervals) else f'H{n}',
                'Cents_Deviation': round(h['cents_from_fundamental'] % 1200, 1),  # Within octave
                'Mathematical_Harmonic': h['mathematical_harmonic'],
                'Verification_Checksum': checksum
            })
    
    print(f"Generated harmonic verification backup CSV: {csv_path}")
    return csv_path


def generate_just_intonation_intervals_csv():
    """Generate just intonation intervals CSV"""
    processor = HarmonicProcessor()
    intervals = processor.get_just_intonation_intervals()
    
    csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'just_intonation_intervals.csv')
    
    with open(csv_path, 'w', newline='') as csvfile:
        fieldnames = [
            'Interval_Name',
            'Ratio',
            'Ratio_Decimal', 
            'Cents',
            'Mathematical_Description'
        ]
        
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        descriptions = {
            'unison': 'Perfect unison - same frequency',
            'minor_2nd': 'Minor second - small half-step',
            'major_2nd': 'Major second - whole tone',
            'minor_3rd': 'Minor third - small third',
            'major_3rd': 'Major third - pure third from 5th harmonic',
            'perfect_4th': 'Perfect fourth - fourth harmonic ratio',
            'tritone': 'Tritone - augmented fourth from 11th harmonic',
            'perfect_5th': 'Perfect fifth - third harmonic ratio',
            'minor_6th': 'Minor sixth - inverted major third',
            'major_6th': 'Major sixth - fifth harmonic compound',
            'minor_7th': 'Minor seventh - seventh harmonic',
            'major_7th': 'Major seventh - compound interval',
            'octave': 'Perfect octave - frequency doubling'
        }
        
        for name, data in intervals.items():
            writer.writerow({
                'Interval_Name': name.replace('_', ' ').title(),
                'Ratio': data['ratio'],
                'Ratio_Decimal': f"{data['decimal']:.4f}",
                'Cents': f"{data['cents']:.1f}",
                'Mathematical_Description': descriptions[name]
            })
    
    print(f"Generated just intonation intervals CSV: {csv_path}")
    return csv_path


def generate_prime_harmonics_csv():
    """Generate prime harmonics CSV for microtonal analysis"""
    processor = HarmonicProcessor()
    prime_harmonics = processor.get_prime_harmonics(31)  # Up to 31st harmonic
    
    csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'prime_harmonics.csv')
    
    with open(csv_path, 'w', newline='') as csvfile:
        fieldnames = [
            'Prime_Harmonic',
            'Frequency_Ratio',
            'Cents_Deviation_From_Equal_Temperament',
            'Microtonal_Interval_Name',
            'Musical_Application'
        ]
        
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        interval_names = {
            2: 'Octave',
            3: 'Perfect Fifth',
            5: 'Major Third', 
            7: 'Harmonic Seventh',
            11: 'Harmonic Eleventh',
            13: 'Harmonic Thirteenth',
            17: 'Harmonic Seventeenth',
            19: 'Harmonic Nineteenth',
            23: 'Harmonic Twenty-Third',
            29: 'Harmonic Twenty-Ninth',
            31: 'Harmonic Thirty-First'
        }
        
        applications = {
            2: 'Standard octave in all music systems',
            3: 'Perfect fifth - foundation of harmony',
            5: 'Pure major third - just intonation',
            7: 'Blues seventh, barbershop harmony',
            11: 'Quartertone music, microtonal composition',
            13: 'Extended jazz harmony, xenharmonic music',
            17: 'Persian and Arabic maqam systems',
            19: 'Indian classical music, complex polyrhythms',
            23: 'Experimental microtonal composition',
            29: 'Highly dissonant, used in spectral music',
            31: 'Extended just intonation systems'
        }
        
        for harmonic, data in prime_harmonics.items():
            writer.writerow({
                'Prime_Harmonic': harmonic,
                'Frequency_Ratio': f"{harmonic}:1",
                'Cents_Deviation_From_Equal_Temperament': data['cents_deviation_from_equal_temp'],
                'Microtonal_Interval_Name': interval_names.get(harmonic, f'Prime {harmonic}'),
                'Musical_Application': applications.get(harmonic, 'Experimental/theoretical use')
            })
    
    print(f"Generated prime harmonics CSV: {csv_path}")
    return csv_path


if __name__ == "__main__":
    print("Generating Harmonic Data Files")
    print("=" * 40)
    
    # Generate all CSV files
    files_generated = []
    
    try:
        files_generated.append(generate_complete_harmonic_series_csv())
        files_generated.append(generate_harmonic_verification_backup_csv())
        files_generated.append(generate_just_intonation_intervals_csv())
        files_generated.append(generate_prime_harmonics_csv())
        
        print(f"\nSuccessfully generated {len(files_generated)} data files:")
        for file_path in files_generated:
            print(f"  - {file_path}")
            
    except Exception as e:
        log_error(e, "Error generating data files")