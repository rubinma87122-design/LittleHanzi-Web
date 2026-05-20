#!/bin/bash
# 构建后修复 GitHub Pages 路径

# 替换绝对路径为相对路径
sed -i '' 's|src="/_expo/|src="./_expo/|g' dist/index.html
sed -i '' 's|href="/_expo/|href="./_expo/|g' dist/index.html

echo "Path fixed for GitHub Pages"