# Usage: python3 to-webp.py <pngDir> <outDir>  — every PNG becomes <outDir>/<name>.webp (RGB, q86)
import sys, pathlib
from PIL import Image
src, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
for p in sorted(src.glob("*.png")):
    Image.open(p).convert("RGB").save(out / (p.stem + ".webp"), quality=86, method=6)
    print(p.stem, (out / (p.stem + ".webp")).stat().st_size // 1024, "KB")
