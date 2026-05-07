const fs = require('fs');
const path = 'c:/Users/AASHI JAIN/OneDrive/Documents/mindguard/mindguard-ai/src/components/icons/index.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /export function (\w+)\(\{\s*size\s*=\s*24,\s*className\s*=\s*\"\"\s*\}\)/g,
  'export function $1({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any })'
);

content = content.replace(/stroke="currentColor"/g, 'stroke={color} style={style}');

fs.writeFileSync(path, content);
