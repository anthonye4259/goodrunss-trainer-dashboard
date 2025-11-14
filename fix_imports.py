#!/usr/bin/env python3
import os
import re
import glob

# Fix Prisma imports
for file_path in glob.glob("src/app/api/**/*.ts", recursive=True):
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Fix Prisma default import to named import
        content = re.sub(
            r"import prisma from '@/lib/prisma'",
            r"import { prisma } from '@/lib/prisma'",
            content
        )
        
        with open(file_path, 'w') as f:
            f.write(content)
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print("Fixed Prisma imports")



