#!/usr/bin/env python3
"""Builds the Gap QuickFit demo's 3D assets from the source files in tools/models-src/ (not deployed).

  python3 tools/build-gap-models.py

- OBJ text meshes -> one compact binary per model (.bin): indexed triangles, positions quantised to uint16 over
  the mesh's bounding box, normals to int8, UVs to uint16. The body ships positions only; the page computes its
  (smooth) normals. js/case-demos.js reads the format (see loadModel there).
- 2048px textures -> 1024px WebP (the avatar never renders more than ~400px tall).

Binary layout: "GQM1", uint32 header length, UTF-8 JSON header, padding to 4 bytes, then the buffers the header
points at (each 4-byte aligned). Bump the version in the output names when the assets change, so the long cache
on /assets/models/ never serves a stale copy.
"""
import json, os, struct
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "models-src")
OUT = os.path.join(ROOT, "assets", "models", "gap")
VERSION = "v1"


def read_obj(path, keep_uv_normals):
    v, vt, vn, objects, cur = [], [], [], [], None
    with open(path) as f:
        for line in f:
            if line.startswith("v "): v.append([float(x) for x in line.split()[1:4]])
            elif line.startswith("vt "): vt.append([float(x) for x in line.split()[1:3]])
            elif line.startswith("vn "): vn.append([float(x) for x in line.split()[1:4]])
            elif line.startswith("o "): cur = {"name": line.split(maxsplit=1)[1].strip(), "faces": []}; objects.append(cur)
            elif line.startswith("f "):
                if cur is None: cur = {"name": "mesh", "faces": []}; objects.append(cur)
                corners = []
                for t in line.split()[1:]:
                    p = (t.split("/") + ["", ""])[:3]
                    corners.append((int(p[0]) - 1, int(p[1]) - 1 if p[1] and keep_uv_normals else -1, int(p[2]) - 1 if p[2] and keep_uv_normals else -1))
                for i in range(1, len(corners) - 1): cur["faces"].append((corners[0], corners[i], corners[i + 1]))
    meshes = []
    for o in objects:
        remap, pos, nrm, uv, idx = {}, [], [], [], []
        for tri in o["faces"]:
            for c in tri:
                if c not in remap:
                    remap[c] = len(pos); pos.append(v[c[0]])
                    if keep_uv_normals: nrm.append(vn[c[2]] if c[2] >= 0 else [0, 1, 0]); uv.append(vt[c[1]] if c[1] >= 0 else [0, 0])
                idx.append(remap[c])
        meshes.append({"name": o["name"], "pos": pos, "nrm": nrm if keep_uv_normals else None, "uv": uv if keep_uv_normals else None, "idx": idx})
    return meshes


def write_bin(meshes, path):
    blobs, header, offset = [], {"meshes": []}, 0

    def add(data):
        nonlocal offset
        pad = (-len(data)) % 4
        blobs.append(data + b"\0" * pad); at = offset; offset += len(data) + pad
        return at

    for m in meshes:
        lo = [min(p[k] for p in m["pos"]) for k in range(3)]; hi = [max(p[k] for p in m["pos"]) for k in range(3)]
        q = lambda x, k: round((x - lo[k]) / ((hi[k] - lo[k]) or 1) * 65535)
        e = {"name": m["name"], "count": len(m["pos"]), "min": lo, "max": hi,
             "pos": add(struct.pack(f"<{len(m['pos']) * 3}H", *[q(p[k], k) for p in m["pos"] for k in range(3)]))}
        if m["nrm"]:
            e["nrm"] = add(struct.pack(f"<{len(m['nrm']) * 3}b", *[max(-127, min(127, round(n[k] * 127))) for n in m["nrm"] for k in range(3)]))
            ulo = [min(u[k] for u in m["uv"]) for k in range(2)]; uhi = [max(u[k] for u in m["uv"]) for k in range(2)]
            e["uvMin"], e["uvMax"] = ulo, uhi
            e["uv"] = add(struct.pack(f"<{len(m['uv']) * 2}H", *[round((u[k] - ulo[k]) / ((uhi[k] - ulo[k]) or 1) * 65535) for u in m["uv"] for k in range(2)]))
        big = len(m["pos"]) > 65535
        e["idx32"] = big; e["indices"] = len(m["idx"])
        e["idx"] = add(struct.pack(f"<{len(m['idx'])}{'I' if big else 'H'}", *m["idx"]))
        header["meshes"].append(e)
    hj = json.dumps(header, separators=(",", ":")).encode()
    hj += b" " * ((-(8 + len(hj))) % 4)
    with open(path, "wb") as f:
        f.write(b"GQM1" + struct.pack("<I", len(hj)) + hj + b"".join(blobs))
    return os.path.getsize(path)


def texture(name, out, size, quality, lossless=False):
    im = Image.open(os.path.join(SRC, name)).convert("RGB").resize((size, size), Image.LANCZOS)
    im.save(os.path.join(OUT, out), "WEBP", quality=quality, method=6, lossless=lossless)
    return os.path.getsize(os.path.join(OUT, out))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    built = {
        f"body.{VERSION}.bin": write_bin(read_obj(os.path.join(SRC, "body.obj"), False), os.path.join(OUT, f"body.{VERSION}.bin")),
        f"jeans.{VERSION}.bin": write_bin(read_obj(os.path.join(SRC, "jeans.obj"), True), os.path.join(OUT, f"jeans.{VERSION}.bin")),
        f"jeans-albedo.{VERSION}.webp": texture("jeans_albedo.jpg", f"jeans-albedo.{VERSION}.webp", 1024, 82),
        f"jeans-normal.{VERSION}.webp": texture("jeans_normal.png", f"jeans-normal.{VERSION}.webp", 1024, 90),
        f"jeans-roughness.{VERSION}.webp": texture("jeans_roughness.jpg", f"jeans-roughness.{VERSION}.webp", 512, 75),
    }
    for k, n in built.items(): print(f"{k:28} {n / 1024:7.0f} KB")
    print(f"{'total':28} {sum(built.values()) / 1024:7.0f} KB")
