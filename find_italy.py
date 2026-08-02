import os

def search_drive(drive):
    print(f"Searching {drive}...")
    for root, dirs, files in os.walk(drive):
        # limit search depth to 3 to be fast
        depth = root.replace(drive, "").count(os.sep)
        if depth > 3:
            continue
        for d in dirs:
            if "Italy" in d or "Trip" in d:
                print(f"Found Dir: {os.path.join(root, d)}")
        for f in files:
            if "Italy" in f or "Trip" in f:
                print(f"Found File: {os.path.join(root, f)}")

search_drive("d:\\")
