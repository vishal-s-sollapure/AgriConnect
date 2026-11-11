import os
import struct

gallery_dir = r'C:\Users\VISHAL\OneDrive\Desktop\AgriConnect\demo-preparation\project-gallery'
files = sorted([f for f in os.listdir(gallery_dir) if f.endswith('.png')])

print(f"Total images: {len(files)}")
print("-" * 80)
print(f"{'Filename':<35} {'Dimensions':<14} {'Aspect Ratio':<16} {'Size (KB)':<12} {'Max 5MB Check'}")
print("-" * 80)

all_valid = True
for f in files:
    full_path = os.path.join(gallery_dir, f)
    size_kb = os.path.getsize(full_path) / 1024
    with open(full_path, 'rb') as img:
        img.seek(16)
        w, h = struct.unpack('>II', img.read(8))
    ratio = w / h
    is_3_2 = abs(ratio - 1.5) < 0.001
    is_under_5mb = size_kb < 5120
    if not (is_3_2 and is_under_5mb):
        all_valid = False
    ratio_str = f"3:2 ({ratio:.2f})" if is_3_2 else f"{ratio:.3f}"
    check_str = "PASS (<5MB)" if is_under_5mb else "FAIL (>5MB)"
    print(f"{f:<35} {str(w)+'x'+str(h):<14} {ratio_str:<16} {size_kb:<12.1f} {check_str}")

print("-" * 80)
print(f"All images meet 3:2 ratio and < 5MB criteria: {all_valid}")
