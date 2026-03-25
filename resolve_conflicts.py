import sys
import os

def resolve_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    out_lines = []
    state = 'NORMAL' # NORMAL, IN_HEAD, IN_REMOTE
    conflict_count = 0
    
    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            state = 'IN_HEAD'
            conflict_count += 1
        elif line.startswith('======='):
            state = 'IN_REMOTE'
        elif line.startswith('>>>>>>>'):
            state = 'NORMAL'
        else:
            if state == 'NORMAL' or state == 'IN_HEAD':
                out_lines.append(line)
                
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(out_lines)
        
    print(f"Resolved {conflict_count} conflicts in {filepath}")

files_to_resolve = [
    r'c:\Pharmacy_Academy\pharmacy-academy\src\features\profile\components\UserProfileArea.tsx',
    r'c:\Pharmacy_Academy\pharmacy-academy\src\features\courses\components\CoursesDetailsArea.tsx'
]

for f in files_to_resolve:
    resolve_file(f)

