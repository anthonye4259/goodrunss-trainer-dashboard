#!/usr/bin/env python3
import os
import re
import glob

# Fix Next.js 16 async params in route handlers
for file_path in glob.glob("src/app/api/**/*.ts", recursive=True):
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        original_content = content
        
        # Fix params type from { params: { ... } } to { params: Promise<{ ... }> }
        # Match patterns like: { params }: { params: { id: string } }
        content = re.sub(
            r'(\{ params \}: \{ params: )(\{[^}]+\})',
            r'\1Promise<\2>',
            content
        )
        
        # Fix params destructuring from const { id } = params to const { id } = await params
        # But only if params is used and not already awaited
        if 'const {' in content and '} = params' in content and 'await params' not in content:
            # Find lines like: const { id } = params
            content = re.sub(
                r'(const \{[^}]+\} = )params(?!\s*\.)',
                r'\1await params',
                content
            )
        
        if content != original_content:
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"Fixed: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print("Done fixing params")


