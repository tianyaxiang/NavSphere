import os
import re

def find_unreferenced_images():
    image_dirs = [
        "/Users/tianya/IdeaProjects/NavSphere/public/assets/images",
        "/Users/tianya/IdeaProjects/NavSphere/public/assets/images/logos"
    ]
    
    images = []
    for d in image_dirs:
        if os.path.exists(d):
            for f in os.listdir(d):
                if os.path.isfile(os.path.join(d, f)) and not f.startswith('.'):
                    images.append(f)
    
    unreferenced = set(images)
    
    search_root = "/Users/tianya/IdeaProjects/NavSphere"
    exclude_dirs = [".next", "node_modules", ".git", ".idea", ".vercel", ".vscode", "scripts", "public"]
    
    for root, dirs, files in os.walk(search_root):
        # Prune exclude directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file.endswith(('.json', '.ts', '.tsx', '.js', '.jsx', '.md', '.css', '.html')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        for img in list(unreferenced):
                            if img in content:
                                unreferenced.remove(img)
                except Exception as e:
                    pass # Ignore read errors
    
    return sorted(list(unreferenced))

if __name__ == "__main__":
    result = find_unreferenced_images()
    print("Unreferenced images:")
    for img in result:
        print(img)
