#!/usr/bin/env python3
"""Generate minimal placeholder PNG assets for Expo."""
import struct
import zlib
from pathlib import Path

ASSETS = Path(__file__).resolve().parent.parent / "assets"
FILES = {
    "icon.png": (1024, 1024, (0, 122, 255, 255)),
    "favicon.png": (48, 48, (0, 122, 255, 255)),
    "android-icon-foreground.png": (432, 432, (0, 122, 255, 255)),
    "android-icon-background.png": (432, 432, (230, 244, 254, 255)),
    "android-icon-monochrome.png": (432, 432, (0, 80, 180, 255)),
}


def png_chunk(tag: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(tag + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)


def write_png(path: Path, width: int, height: int, rgba: tuple[int, int, int, int]) -> None:
    row = bytes(rgba) * width
    raw = b"".join(b"\x00" + row for _ in range(height))
    compressed = zlib.compress(raw, 9)
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", ihdr)
        + png_chunk(b"IDAT", compressed)
        + png_chunk(b"IEND", b"")
    )
    path.write_bytes(png)


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    for name, (w, h, color) in FILES.items():
        write_png(ASSETS / name, w, h, color)
        print(f"Created {ASSETS / name}")


if __name__ == "__main__":
    main()
