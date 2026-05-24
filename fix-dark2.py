"""Fix remaining selectors in mockupshot dark mode CSS"""
import re

path = "/home/wu/projects/mockupshot/css/style.css"
with open(path, "r") as f:
    lines = f.readlines()

# Current state: 
# 1021: html[data-theme="dark"] { (vars)
# 1034: } (end vars)
# 1036-1244: indented selectors .xxx { ... }
# 1244: } (old closing)
# Then Theme Toggle section

# We need to:
# 1. Find all selectors between the end of var block and "/* Theme Toggle Button */"
# 2. Prefix each selector with html[data-theme="dark"]
# 3. Remove the old closing }

i = 0
result = []
in_dark_selectors = False
var_block_ended = False

while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    
    # Detect start of dark mode
    if 'html[data-theme="dark"] {' in stripped:
        result.append(line)
        i += 1
        continue
    
    # Detect end of var block (a line with just '}' after var declarations)
    if not var_block_ended and stripped == '}':
        # Check if previous non-empty line starts with --
        j = i - 1
        while j >= 0 and lines[j].strip() == '':
            j -= 1
        if j >= 0 and lines[j].strip().startswith('--'):
            var_block_ended = True
            in_dark_selectors = True
            result.append(line)
            i += 1
            continue
    
    if in_dark_selectors:
        # End of dark mode section
        if '/* Theme Toggle Button */' in stripped:
            in_dark_selectors = False
            result.append(line)
            i += 1
            continue
        
        # The old closing } of [data-theme="dark"]
        if stripped == '}':
            in_dark_selectors = False
            i += 1  # Skip it
            continue
        
        # Empty lines
        if stripped == '':
            result.append(line)
            i += 1
            continue
        
        # Comments
        if stripped.startswith('/*'):
            result.append(line)
            i += 1
            continue
        
        # This should be a selector line
        indent = line[:len(line) - len(stripped)]
        
        if '{' in stripped:
            # Extract selector(s)
            sel_part = stripped.split('{')[0].strip()
            if ',' in sel_part:
                parts = [p.strip() for p in sel_part.split(',')]
                new_parts = [f'html[data-theme="dark"] {p}' for p in parts]
                result.append(indent + ', '.join(new_parts) + ' {\n')
            else:
                result.append(indent + f'html[data-theme="dark"] {sel_part} {{\n')
        elif stripped.endswith(','):
            # Multi-line selector
            parts = [p.strip() for p in stripped.rstrip(',').split(',')]
            new_parts = [f'html[data-theme="dark"] {p}' for p in parts]
            result.append(indent + ','.join(new_parts) + '\n')
        else:
            result.append(line)
        
        i += 1
        continue
    
    result.append(line)
    i += 1

output = ''.join(result)
with open(path, "w") as f:
    f.write(output)

print("Phase 1 done. Count html[data-theme]:", output.count('html[data-theme="dark"]'))
