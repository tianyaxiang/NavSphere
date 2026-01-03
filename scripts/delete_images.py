import os

def delete_unreferenced_images():
    image_dirs = [
        "/Users/tianya/IdeaProjects/NavSphere/public/assets/images",
        "/Users/tianya/IdeaProjects/NavSphere/public/assets/images/logos"
    ]
    
    images_to_delete = []
    with open("/Users/tianya/IdeaProjects/NavSphere/unreferenced_images.txt", "r") as f:
        # Skip the first line "Unreferenced images:"
        next(f)
        for line in f:
            img = line.strip()
            if img:
                images_to_delete.append(img)
    
    deleted_count = 0
    for img in images_to_delete:
        for d in image_dirs:
            path = os.path.join(d, img)
            if os.path.exists(path):
                try:
                    os.remove(path)
                    print(f"Deleted: {path}")
                    deleted_count += 1
                except Exception as e:
                    print(f"Error deleting {path}: {e}")
    
    print(f"\nTotal images deleted: {deleted_count}")

if __name__ == "__main__":
    delete_unreferenced_images()
