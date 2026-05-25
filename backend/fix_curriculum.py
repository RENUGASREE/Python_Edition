with open('curriculum_data.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove corrupted characters at the end
content = content.rstrip()
if content.endswith(']'):
    content = content[:-1]  # Remove the corrupted ]
    content = content.rstrip()
    content += ']\n'

with open('curriculum_data.py', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print("Fixed curriculum_data.py")
