import os

file_path = "src/App.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    "duration-[1200ms]": "duration-700",
    "transitionDelay: '300ms'": "transitionDelay: '200ms'",
    "transitionDelay: '500ms'": "transitionDelay: '300ms'",
    "transitionDelay: '700ms'": "transitionDelay: '400ms'",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Speed updated successfully!")
