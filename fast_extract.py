import os
import subprocess
import json
import imageio_ffmpeg

output_dir = 'frames'
os.makedirs(output_dir, exist_ok=True)

for f in os.listdir(output_dir):
    os.remove(os.path.join(output_dir, f))

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
video_path = 'Racket_floats_strikes_ball_202607220414.mp4'

# Extract 24fps WebP frames at optimized size (1280x720) with q=70
cmd = [
    ffmpeg_exe, '-y',
    '-i', video_path,
    '-vf', 'scale=1280:-1',
    '-vcodec', 'libwebp',
    '-q:v', '70',
    '-compression_level', '4',
    os.path.join(output_dir, 'frame_%04d.webp')
]

print("Re-extracting optimized WebP frames...")
res = subprocess.run(cmd, capture_output=True, text=True)

frames = sorted([f for f in os.listdir(output_dir) if f.endswith('.webp')])
print(f"Extracted {len(frames)} optimized WebP frames.")

if frames:
    sample_path = os.path.join(output_dir, frames[0])
    print(f"Sample frame 1 size: {os.path.getsize(sample_path) / 1024:.1f} KB")

manifest = {
    "count": len(frames),
    "pattern": "frames/frame_%04d.webp"
}

with open(os.path.join(output_dir, "frames.json"), "w") as f:
    json.dump(manifest, f, indent=2)

print("Saved frames/frames.json manifest successfully!")
