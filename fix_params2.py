#!/usr/bin/env python3
import os
import re
import glob

# Fix Next.js 16 async params usage in route handlers
for file_path in glob.glob("src/app/api/**/*.ts", recursive=True):
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        original_content = content
        
        # If params is Promise type, fix direct access like params.id to (await params).id
        if 'params: Promise<' in content:
            # Fix patterns like: params.id, params.slug, etc.
            # But avoid already awaited ones
            if 'await params' not in content and 'params.' in content:
                # Replace params.XXX with (await params).XXX
                content = re.sub(
                    r'params\.([a-zA-Z_][a-zA-Z0-9_]*)',
                    r'(await params).\1',
                    content
                )
        
        if content != original_content:
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"Fixed usage: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print("Done fixing params usage")


