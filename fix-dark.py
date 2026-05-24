#!/usr/bin/env python3
"""Fix mockupshot dark mode CSS - flat selectors + emerald green theme"""
import re

path = "/home/wu/projects/mockupshot/css/style.css"
with open(path, "r") as f:
    content = f.read()

# ========== 1. Replace the nested :root block ==========
old_vars = """[data-theme="dark"] {
    :root {
        --text-color: #F9FAFB;
        --text-secondary: #D1D5DB;
        --border-color: #374151;
        --bg-color: #111827;
        --white: #1F2937;
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    }"""

new_vars = """html[data-theme="dark"] {
    --text-color: #ECFDF5;
    --text-secondary: #94A3B8;
    --border-color: #1a3a3a;
    --bg-color: #0B1920;
    --bg-secondary: #0F2328;
    --shadow-sm: 0 1px 2px 0 rgba(255, 255, 255, 0.03);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
    --primary-color: #34D399;
    --primary-dark: #10B981;
    --primary-light: #6EE7B7;
}"""

assert old_vars in content, "Can't find old variable block"
content = content.replace(old_vars, new_vars)

# ========== 2. Find the dark mode selector section and prefix with html ==========
# The structure now is:
# 1) html[data-theme="dark"] { ... }  (variables)
# 2) Blank lines and comments  
# 3) Indented .xxx { ... } selectors
# 4) }  (closing the original [data-theme="dark"] block
# 5) /* Theme Toggle Button */

# Strategy: use regex to find lines that start with indented . or # selectors
# between the end of variable block and "/* Theme Toggle Button */"

lines = content.split('\n')
result = []
i = 0
in_selector_section = False
found_var_end = False

while i < len(lines):
    line = lines[i]
    stripped = line.lstrip()
    
    # Detect end of variable block
    if 'html[data-theme="dark"] {' in stripped:
        in_selector_section = False  # This is the var block, not selectors
        result.append(line)
        i += 1
        continue
    
    if not found_var_end:
        if stripped == '}' and i > 0 and lines[i-1].strip().startswith('--'):
            found_var_end = True
            in_selector_section = True
            result.append(line)
            i += 1
            continue
    
    if in_selector_section:
        # End of dark mode section - before Theme Toggle
        if '/* Theme Toggle Button */' in stripped:
            in_selector_section = False
            result.append(line)
            i += 1
            continue
        
        # Skip the closing } of original [data-theme="dark"] block
        if stripped == '}':
            in_selector_section = False
            i += 1
            continue
        
        # Empty lines - keep
        if stripped == '':
            result.append(line)
            i += 1
            continue
        
        # Comments - keep
        if stripped.startswith('/*'):
            result.append(line)
            i += 1
            continue
        
        # Check if this is a selector (starts with . or #)
        indent = line[:len(line) - len(stripped)]
        if stripped[0] in ('.', '#', ':', '['):
            # Extract selector(s) before {
            # Handle multi-selector lines (with comma)
            if ',' in stripped and '{' not in stripped:
                # Continuation line or multi-selector without brace
                parts = [p.strip() for p in stripped.rstrip(',').split(',')]
                new_parts = [f'html[data-theme="dark"] {p}' for p in parts]
                result.append(indent + ','.join(new_parts))
            elif '{' in stripped:
                selector_part = stripped.split('{')[0].strip()
                # Handle multi-selector: .a, .b {
                if ',' in selector_part:
                    parts = [p.strip() for p in selector_part.split(',')]
                    new_parts = [f'html[data-theme="dark"] {p}' for p in parts]
                    result.append(indent + ', '.join(new_parts) + ' {')
                else:
                    result.append(indent + f'html[data-theme="dark"] {selector_part} {{')
            else:
                result.append(line)
        else:
            # CSS property or other content - keep as is
            result.append(line)
        
        i += 1
        continue
    
    result.append(line)
    i += 1

content = ''.join(result)

# ========== 3. Replace hardcoded color values in dark mode only ==========
# Only replace in lines containing html[data-theme="dark"]
lines = content.split('\n')
new_lines = []
for line in lines:
    if 'html[data-theme="dark"]' in line:
        # Header
        line = line.replace('background: #1F2937;', 'background: rgba(15, 35, 40, 0.85);')
        line = line.replace('border-bottom: 1px solid #374151;', 'border-bottom: 1px solid var(--border-color);')
        line = line.replace('backdrop-filter: blur(12px); /* was added */', 'backdrop-filter: blur(12px);')
        
        # Ad banner
        line = line.replace('background: linear-gradient(135deg, #1F2937 0%, #111827 100%);', 
                          'background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-color) 100%);')
        
        # Upload area
        line = line.replace('background: rgba(31, 41, 55, 0.5);', 'background: rgba(15, 35, 40, 0.6);')
        line = line.replace('border-color: #374151;', 'border-color: var(--border-color);')
        line = line.replace('border-bottom-color: #374151;', 'border-bottom-color: var(--border-color);')
        line = line.replace('border-top-color: #374151;', 'border-top-color: var(--border-color);')
        line = line.replace('border-color: #4B5563;', 'border-color: var(--border-color);')
        
        # Background colors
        line = line.replace('background: #1F2937;', 'background: var(--bg-secondary);')
        line = line.replace('background: #111827;', 'background: var(--bg-color);')
        line = line.replace('background: #111827', 'background: var(--bg-color);')
        
        # Text colors
        line = line.replace('color: #9CA3AF;', 'color: var(--text-secondary);')
        line = line.replace('color: #F9FAFB;', 'color: var(--text-color);')
        line = line.replace('color: #6B7280;', 'color: var(--text-secondary);')
        
        # rgba colors
        line = line.replace('rgba(16, 185, 129, 0.1)', 'rgba(52, 211, 153, 0.1)')
        line = line.replace('rgba(16, 185, 129, 0.2)', 'rgba(52, 211, 153, 0.2)')
        
        # Checkerboard
        line = line.replace('#374151 0% 25%, #1F2937 0% 50%', 
                          'var(--border-color) 0% 25%, var(--bg-secondary) 0% 50%')
    
    new_lines.append(line)

content = '\n'.join(new_lines)

# ========== 4. Fix specific blocks that need more context ==========
# Upload area hover
content = content.replace(
    'html[data-theme="dark"] .upload-area:hover {\n        background: var(--bg-secondary);\n        border-color: var(--primary-color);',
    'html[data-theme="dark"] .upload-area:hover {\n        background: rgba(52, 211, 153, 0.08);\n        border-color: var(--primary-color);'
)

# Feature card / step shadows  
content = content.replace(
    'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);',
    'box-shadow: var(--shadow-sm);'
)

# Add backdrop-filter to header
if 'backdrop-filter: blur(12px);' not in content:
    content = content.replace(
        'html[data-theme="dark"] .header {',
        'html[data-theme="dark"] .header {'
    )
    content = content.replace(
        'border-bottom: 1px solid var(--border-color);',
        'border-bottom: 1px solid var(--border-color);\n        backdrop-filter: blur(12px);'
    )

# ========== 5. Also fix theme-toggle hover ==========
# Find the [data-theme="dark"] .theme-toggle:hover rule
content = content.replace(
    '[data-theme="dark"] .theme-toggle:hover {',
    'html[data-theme="dark"] .theme-toggle:hover {'
)

with open(path, "w") as f:
    f.write(content)

# ========== Verification ==========
print("=== VERIFICATION ===")

# Check no nested :root
if ':root {' in content:
    # Check it's in the light mode section
    dark_section = content.split('html[data-theme="dark"]')[1] if 'html[data-theme="dark"]' in content else ''
    if ':root' in dark_section:
        print("FAIL: :root still exists in dark mode section!")
    else:
        print("OK: No nested :root in dark mode")
else:
    print("OK: No nested :root")

# Check selector prefix count
count = content.count('html[data-theme="dark"]')
print(f"html[data-theme='dark'] selectors: {count}")

# Check for remaining hardcoded colors in dark mode
remaining = []
for color in ['#1F2937', '#374151', '#9CA3AF', '#4B5563', '#6B7280']:
    for lineno, line in enumerate(content.split('\n'), 1):
        if 'html[data-theme="dark"]' in line and color in line:
            remaining.append(f"  L{lineno}: {line.strip()}")

if remaining:
    print(f"REMAINING HARDCODED ({len(remaining)}):")
    for r in remaining:
        print(r)
else:
    print("OK: No hardcoded colors in dark mode")

# Check no old [data-theme="dark"] { block
if '[data-theme="dark"] {' in content:
    print("WARN: [data-theme='dark'] { still exists")
else:
    print("OK: No old-style [data-theme='dark'] selector")

print("\nDone!")
