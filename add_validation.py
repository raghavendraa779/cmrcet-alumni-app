import os
import re

files_to_update = [
    r"server\src\controllers\newsController.js",
    r"server\src\controllers\eventController.js",
    r"server\src\controllers\jobController.js"
]

for file in files_to_update:
    with open(file, 'r', encoding='utf8') as f:
        content = f.read()

    # Find functions taking req, res and having try { and req.params.id
    pattern = r'(const \w+ = async \(req, res\) => \{\s*try \{)([\s\S]*?req\.params\.id)'
    
    def replacer(match):
        start = match.group(1)
        rest = match.group(2)
        # Avoid double inserting
        if "isValidObjectId" in rest:
            return match.group(0)
        
        insert = "\n    if (!require('mongoose').isValidObjectId(req.params.id)) {\n      return res.status(400).json({ message: 'Invalid ID format' });\n    }"
        return start + insert + rest
        
    new_content = re.sub(pattern, replacer, content)
    
    with open(file, 'w', encoding='utf8') as f:
        f.write(new_content)
        
print("Validation added!")
