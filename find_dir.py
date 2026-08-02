import os

base_dir = r"d:\Trip expense monitoring"
print("Root items:")
for item in os.listdir(base_dir):
    print(f"- {repr(item)}")
    full_path = os.path.join(base_dir, item)
    if os.path.isdir(full_path):
        print(f"  Sub items of {item}:")
        for sub in os.listdir(full_path):
            print(f"    - {repr(sub)}")
