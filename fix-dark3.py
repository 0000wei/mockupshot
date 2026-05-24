#!/usr/bin/env python3
"""
MockupShot dark mode CSS rewrite.
Reads the entire file, rebuilds the dark mode section from scratch.
"""
import re

def replace_colors(text):
    """Replace hardcoded colors with CSS variables in dark mode rules"""
    replacements = [
        ('background: #1F2937;', 'background: var(--bg-secondary);'),
        ('background: #111827;', 'background: var(--bg-color);'),
        ('border-color: #374151;', 'border-color: var(--border-color);'),
        ('border-bottom-color: #374151;', 'border-bottom-color: var(--border-color);'),
        ('border-top-color: #374151;', 'border-top-color: var(--border-color);'),
        ('border-bottom: 1px solid #374151;', 'border-bottom: 1px solid var(--border-color);'),
        ('color: #9CA3AF;', 'color: var(--text-secondary);'),
        ('color: #F9FAFB;', 'color: var(--text-color);'),
        ('color: #6B7280;', 'color: var(--text-secondary);'),
        ('border-color: #4B5563;', 'border-color: var(--border-color);'),
        ('rgba(31, 41, 55, 0.5)', 'rgba(15, 35, 40, 0.6)'),
        ('rgba(16, 185, 129, 0.1)', 'rgba(52, 211, 153, 0.1)'),
        ('rgba(16, 185, 129, 0.2)', 'rgba(52, 211, 153, 0.2)'),
        ('#374151 0% 25%, #1F2937 0% 50%', 'var(--border-color) 0% 25%, var(--bg-secondary) 0% 50%'),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    
    # Header special case
    if 'html[data-theme="dark"] .header {' in text:
        text = text.replace(
            'background: var(--bg-secondary);',
            'background: rgba(15, 35, 40, 0.85);\n        backdrop-filter: blur(12px);'
        )
    
    # Upload area hover
    if 'html[data-theme="dark"] .upload-area:hover {' in text:
        text = text.replace(
            'background: var(--bg-secondary);',
            'background: rgba(52, 211, 153, 0.08);'
        )
    
    # Shadows
    text = text.replace(
        'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);',
        'box-shadow: var(--shadow-sm);'
    )
    
    return text

path = "/home/wu/projects/mockupshot/css/style.css"
with open(path, "r") as f:
    content = f.read()

# ========== 1. Split file into sections ==========
# Find exact boundaries
dark_start = content.index('[data-theme="dark"] {')
# Find the closing of the main [data-theme="dark"] block
# It's the '}' that appears just before "/* Theme Toggle Button */"
theme_toggle_pos = content.index('/* Theme Toggle Button */')
# Search backwards from theme_toggle_pos to find the closing }
dark_close = content.rindex('}', 0, theme_toggle_pos)

before = content[:dark_start]                    # All CSS before dark mode
dark_block = content[dark_start:dark_close + 1]  # The [data-theme="dark"] { ... } block
after = content[dark_close + 1:]                 # Everything after (Theme Toggle + rest)

print(f"Before: {len(before)} chars")
print(f"Dark block: {len(dark_block)} chars (lines {content[:dark_start].count(chr(10))+1}-{content[:dark_close].count(chr(10))+1})")
print(f"After: {len(after)} chars")

# ========== 2. Parse the dark block ==========
lines = content[dark_start:dark_close+1].split('\n')
# lines[0] = '[data-theme="dark"] {'
# lines[1] = '    :root {'
# ... variables ...
# lines[11] = '    }'  (closes :root)
# ... selectors ...
# lines[-1] = '}' (closes [data-theme="dark"])

# Extract variable definitions (from :root block)
var_lines = []
in_vars = False
for line in lines:
    stripped = line.strip()
    if stripped == ':root {':
        in_vars = True
        continue
    if in_vars:
        if stripped == '}':
            in_vars = False
            continue
        if stripped.startswith('--'):
            var_lines.append(stripped)

# Extract selector rules (between end of :root and closing })
selector_lines = []
in_selectors = False
for line in lines:
    stripped = line.strip()
    if stripped == '}' and ':root' in lines[max(0, lines.index(line)-2)] if False else False:
        pass  # Handled by in_vars logic
    
    if stripped == '}' and in_selectors:
        continue  # Skip old closing
    
    # Detect transition from :root to selectors
    if '.header' in stripped and '{' in stripped:
        in_selectors = True
    
    if in_selectors and stripped != '}':
        selector_lines.append(line)

# Actually, let's just rebuild from scratch more carefully
print(f"\nVariables found: {len(var_lines)}")
print(f"Selector lines found: {len(selector_lines)}")

# ========== 3. Build new dark mode section ==========
new_dark_parts = []

# New variable block
new_dark_parts.append('html[data-theme="dark"] {')
new_dark_parts.append('    --text-color: #ECFDF5;')
new_dark_parts.append('    --text-secondary: #94A3B8;')
new_dark_parts.append('    --border-color: #1a3a3a;')
new_dark_parts.append('    --bg-color: #0B1920;')
new_dark_parts.append('    --bg-secondary: #0F2328;')
new_dark_parts.append('    --shadow-sm: 0 1px 2px 0 rgba(255, 255, 255, 0.03);')
new_dark_parts.append('    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);')
new_dark_parts.append('    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.3);')
new_dark_parts.append('    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3);')
new_dark_parts.append('    --primary-color: #34D399;')
new_dark_parts.append('    --primary-dark: #10B981;')
new_dark_parts.append('    --primary-light: #6EE7B7;')
new_dark_parts.append('}\n')

# Now process each selector rule from the original
# We need to track brace depth per selector
i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    
    # Skip first few lines (opening, :root block)
    if i <= 11 and (stripped == '[data-theme="dark"] {' or stripped == ':root {' or stripped.startswith('--') or stripped == '}'):
        i += 1
        continue
    
    # Skip blank lines at the beginning of selectors section
    if stripped == '' and i < 15:
        i += 1
        continue
    
    # Skip comments that are just part of the transition
    if stripped == '}' and i == 11:  # closing :root
        i += 1
        continue
    
    if stripped == '}':  # closing the [data-theme="dark"] block
        break
    
    # Now we're in the selector section
    # Collect from this line until we find a line with '}' that closes this rule
    rule_lines = []
    brace_count = 0
    while i < len(lines):
        cl = lines[i]
        rule_lines.append(cl)
        brace_count += cl.count('{')
        brace_count -= cl.count('}')
        if brace_count == 0 and cl.strip() == '}':
            # End of this rule
            i += 1
            break
        i += 1
    
    if rule_lines:
        # Process the first line (selector)
        first = rule_lines[0]
        indent = first[:len(first) - len(first.lstrip())]
        sel_part = first.strip().split('{')[0].strip()
        
        # Prefix with html[data-theme="dark"]
        if ',' in sel_part:
            parts = [p.strip() for p in sel_part.split(',')]
            new_parts = [f'html[data-theme="dark"] {p}' for p in parts]
            new_selector = ', '.join(new_parts)
        else:
            new_selector = f'html[data-theme="dark"] {sel_part}'
        
        rule_lines[0] = indent + new_selector + ' {\n'
        
        # Check if rule_lines ends with '}'
        if rule_lines[-1].strip() == '}':
            # Add empty line after
            raw_rule = ''.join(rule_lines)
            # Now replace hardcoded colors
            raw_rule = replace_colors(raw_rule)
            new_dark_parts.append(raw_rule)
    
    continue

def replace_colors(text):
    """Replace hardcoded colors with CSS variables in dark mode rules"""
    replacements = [
        ('background: #1F2937;', 'background: var(--bg-secondary);'),
        ('background: #111827;', 'background: var(--bg-color);'),
        ('border-color: #374151;', 'border-color: var(--border-color);'),
        ('border-bottom-color: #374151;', 'border-bottom-color: var(--border-color);'),
        ('border-top-color: #374151;', 'border-top-color: var(--border-color);'),
        ('border-bottom: 1px solid #374151;', 'border-bottom: 1px solid var(--border-color);'),
        ('color: #9CA3AF;', 'color: var(--text-secondary);'),
        ('color: #F9FAFB;', 'color: var(--text-color);'),
        ('color: #6B7280;', 'color: var(--text-secondary);'),
        ('border-color: #4B5563;', 'border-color: var(--border-color);'),
        ('rgba(31, 41, 55, 0.5)', 'rgba(15, 35, 40, 0.6)'),
        ('rgba(16, 185, 129, 0.1)', 'rgba(52, 211, 153, 0.1)'),
        ('rgba(16, 185, 129, 0.2)', 'rgba(52, 211, 153, 0.2)'),
        ('#374151 0% 25%, #1F2937 0% 50%', 'var(--border-color) 0% 25%, var(--bg-secondary) 0% 50%'),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    
    # Special cases
    # Header
    if 'html[data-theme="dark"] .header {' in text:
        text = text.replace(
            'background: var(--bg-secondary);',
            'background: rgba(15, 35, 40, 0.85);\n        backdrop-filter: blur(12px);'
        )
    
    # Ad banner gradient
    text = text.replace(
        'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-color) 100%)',
        'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-color) 100%)'
    )
    # Actually the gradient was already replaced via the background replacements
    
    # Upload area hover - replace the specific rule
    if 'html[data-theme="dark"] .upload-area:hover {' in text:
        text = text.replace(
            'background: var(--bg-secondary);',
            'background: rgba(52, 211, 153, 0.08);'
        )
    
    # Feature card / step shadow
    text = text.replace(
        'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);',
        'box-shadow: var(--shadow-sm);'
    )
    
    return text

new_dark_section = '\n'.join(new_dark_parts)

# ========== 4. Also handle theme-toggle hover ==========
after = after.replace(
    '[data-theme="dark"] .theme-toggle:hover',
    'html[data-theme="dark"] .theme-toggle:hover'
)
after = after.replace(
    '[data-theme="dark"] .sun-icon',
    'html[data-theme="dark"] .sun-icon'
)
after = after.replace(
    '[data-theme="dark"] .moon-icon',
    'html[data-theme="dark"] .moon-icon'
)

# ========== 5. Write result ==========
result = before + new_dark_section + after

with open(path, "w") as f:
    f.write(result)

# ========== 6. Verify ==========
print("\n=== VERIFICATION ===")
count_html = result.count('html[data-theme="dark"]')
print(f"✅ html[data-theme='dark'] selectors: {count_html}")

if ':root {' in result.split('html[data-theme="dark"]')[1] if 'html[data-theme="dark"]' in result else False:
    print("❌ Nested :root still present!")
else:
    print("✅ No nested :root")

# Check remaining hardcoded
remaining = []
for color in ['#1F2937', '#374151', '#9CA3AF', '#4B5563', '#6B7280']:
    for lineno, line in enumerate(result.split('\n'), 1):
        if 'html[data-theme="dark"]' in line and color in line:
            remaining.append(f"  L{lineno}: {line.strip()}")
if remaining:
    print(f"⚠️  {len(remaining)} hardcoded colors remain:")
    for r in remaining[:15]:
        print(r)
else:
    print("✅ No hardcoded colors in dark mode")

# Check the variable values
if '--text-color: #ECFDF5' in result:
    print("✅ New emerald color scheme applied")
else:
    print("❌ New colors NOT applied")

print("\nDone!")
