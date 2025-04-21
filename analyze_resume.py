import sys
import json

def analyze_resume(file_path):
    # Mock analysis result
    result = {
        "name": "John Doe",
        "skills": ["Python", "JavaScript", "Node.js"],
        "experience": 5
    }
    return result

if __name__ == "__main__":
    file_path = sys.argv[1]
    result = analyze_resume(file_path)
    print(json.dumps(result))
