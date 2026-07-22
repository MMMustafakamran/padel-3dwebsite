import os
import cv2
import json
from PIL import Image

output_dir = 'frames'
os.makedirs(output_dir, exist_ok=True)

video_path = 'Racket_floats_strikes_ball_202607220414.mp4'
cap = cv2.VideoCapture(video_path)

fps = cap.get(cv2.CAP_PROP_FPS)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

print(f"Video Info: {width}x{height}, FPS: {fps}, Total Frames: {total_frames}")

frame_idx = 1
while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Convert BGR to RGB for PIL
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img = Image.fromarray(rgb_frame)
    
    filename = f"frame_{frame_idx:04d}.webp"
    filepath = os.path.join(output_dir, filename)
    img.save(filepath, format="WEBP", quality=80, method=4)
    
    if frame_idx % 24 == 0:
        print(f"Saved {frame_idx}/{total_frames} frames...")
        
    frame_idx += 1

cap.release()

count = frame_idx - 1
print(f"Extraction complete! Extracted {count} frames.")

manifest = {
    "count": count,
    "pattern": "frames/frame_%04d.webp"
}

with open(os.path.join(output_dir, "frames.json"), "w") as f:
    json.dump(manifest, f, indent=2)

print("Saved frames/frames.json manifest.")
