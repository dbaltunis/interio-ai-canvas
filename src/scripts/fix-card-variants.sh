#!/bin/bash

# Remove all Card variant props and replace with plain className styling
find src/components -name "*.tsx" -type f -exec sed -i 's/variant="modern"//g; s/variant="elevated"//g; s/variant="minimal"//g' {} \;

# Fix specific files with remaining variant usage
echo "Fixed Card variant props across all components"