with open('curriculum_data.py', 'rb') as f:
    content = f.read()

# Find the last valid closing bracket
content_str = content.decode('utf-8', errors='ignore')
# Remove any trailing characters after the last ]
last_bracket = content_str.rfind(']')
if last_bracket != -1:
    content_str = content_str[:last_bracket + 1]

with open('curriculum_data.py', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content_str + '\n')

print("Fixed curriculum_data.py")
