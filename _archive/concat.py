import os

root_dir = r"c:\Users\Jai Shree Krishna\Desktop\55\801-main"
output_file = os.path.join(root_dir, "all_project_code.txt")

exclude_dirs = {".git", "node_modules", ".next", ".emergent", "memory", "test_reports"}
exclude_extensions = {".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".lock"}
exclude_files = {"package-lock.json", "yarn.lock", "all_project_code.txt", "concat.py"}

with open(output_file, "w", encoding="utf-8") as outfile:
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Modify dirnames in-place to skip excluded directories
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        
        for filename in filenames:
            if filename in exclude_files:
                continue
            
            ext = os.path.splitext(filename)[1].lower()
            if ext in exclude_extensions:
                continue
                
            filepath = os.path.join(dirpath, filename)
            
            # Try reading the file
            try:
                with open(filepath, "r", encoding="utf-8") as infile:
                    content = infile.read()
                    
                outfile.write(f"\n\n{'='*80}\n")
                outfile.write(f"File: {os.path.relpath(filepath, root_dir)}\n")
                outfile.write(f"{'='*80}\n\n")
                outfile.write(content)
            except Exception as e:
                print(f"Skipping {filepath}: {e}")

print("Done!")
