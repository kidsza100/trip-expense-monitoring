import os
import shutil

src_dir = r"d:\Trip expense monitoring\Italy 19-28 Sep 2026\Ticket"
dest_dir = r"d:\Trip expense monitoring\public\tickets"

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

files_copied = 0
for filename in os.listdir(src_dir):
    src_file = os.path.join(src_dir, filename)
    dest_file = os.path.join(dest_dir, filename)
    if os.path.isfile(src_file):
        shutil.copy2(src_file, dest_file)
        files_copied += 1

print(f"Copied {files_copied} files to public/tickets")
