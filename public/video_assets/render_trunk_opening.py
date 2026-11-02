import os
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
BASE_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\video_assets"
CLOSED_PATH = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5\trunk_frame_closed_1793633808943.jpg"
OPEN_PATH = os.path.join(BASE_DIR, "trunk_ref_open.jpg")
AUDIO_SRC = os.path.join(BASE_DIR, "ang_mga_tinig_ng_nakaraan.mp3")

OUTPUT_MP4 = os.path.join(BASE_DIR, "trunk_opening_demo.mp4")
OUTPUT_GIF = os.path.join(BASE_DIR, "trunk_opening_demo.gif")

WIDTH, HEIGHT = 1920, 1080
FPS = 30
DURATION = 7.0 # 7 seconds opening
TOTAL_FRAMES = int(DURATION * FPS)

def load_and_fit(path):
    img = Image.open(path).convert("RGB")
    scale = max(WIDTH / img.width, HEIGHT / img.height)
    new_w, new_h = int(img.width * scale), int(img.height * scale)
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - WIDTH) // 2
    top = (new_h - HEIGHT) // 2
    return img.crop((left, top, left + WIDTH, top + HEIGHT))

def render_animation():
    print("Loading closed and open images...")
    img_closed = load_and_fit(CLOSED_PATH)
    img_open = load_and_fit(OPEN_PATH)

    arr_closed = np.array(img_closed, dtype=np.float32)
    arr_open = np.array(img_open, dtype=np.float32)

    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 46)

    # Subtitle timeline for first 7 seconds:
    # 0.0 - 2.8: "Ang mga Tinig ng Nakaraan."
    # 2.8 - 7.0: "Sa isang lumang tahanan sa probinsya, may natagpuang kahong matagal nang hindi nabubuksan."
    def get_subtitle(t):
        if t < 2.6:
            return "Ang mga Tinig ng Nakaraan."
        elif t < 7.0:
            return "Sa isang lumang tahanan sa probinsya,\nmay natagpuang kahong matagal nang hindi nabubuksan."
        return ""

    # Setup ffmpeg rawvideo pipe
    cmd_ffmpeg = [
        FFMPEG, "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-ss", "0.0", "-t", str(DURATION),
        "-i", AUDIO_SRC,
        "-c:v", "libx264",
        "-preset", "faster",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        OUTPUT_MP4
    ]

    proc = subprocess.Popen(cmd_ffmpeg, stdin=subprocess.PIPE)

    print(f"Rendering {TOTAL_FRAMES} frames of slow trunk opening...")
    gif_frames = []

    for f_idx in range(TOTAL_FRAMES):
        t = f_idx / FPS

        # Opening timeline:
        # 0.0 - 1.5s: Closed, atmospheric still with subtle drift
        # 1.5 - 5.0s: Slow, progressive opening (creaking open)
        # 5.0 - 7.0s: Sits fully open, revealing photos and letters
        if t < 1.5:
            alpha = 0.0
        elif t < 5.0:
            # Smooth S-curve (cubic ease-in-out)
            progress = (t - 1.5) / 3.5
            alpha = progress * progress * (3 - 2 * progress)
        else:
            alpha = 1.0

        # Morph / blend arrays
        blended = (1.0 - alpha) * arr_closed + alpha * arr_open

        # Subtle cinematic float/drift (camera slowly pushes in by 4%, smooth floating point crop)
        zoom = 1.0 + (t / DURATION) * 0.05
        cw = WIDTH / zoom
        ch = HEIGHT / zoom
        cx = (WIDTH - cw) / 2
        cy = (HEIGHT - ch) / 2

        frame_img = Image.fromarray(blended.astype(np.uint8))
        frame_img = frame_img.crop((cx, cy, cx + cw, cy + ch)).resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)

        # Draw Clean, Timed, Large Subtitles (No clunky 2D textbook box)
        sub_text = get_subtitle(t)
        if sub_text:
            draw = ImageDraw.Draw(frame_img)
            # Measure text size
            bbox = draw.multiline_textbbox((0, 0), sub_text, font=font_sub, align="center")
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]

            tx = (WIDTH - tw) // 2
            ty = HEIGHT - th - 55

            # Translucent dark pill background
            padding = 18
            pill_box = [tx - padding, ty - padding, tx + tw + padding, ty + th + padding]
            
            overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
            draw_ov = ImageDraw.Draw(overlay)
            draw_ov.rounded_rectangle(pill_box, radius=12, fill=(10, 15, 25, 205), outline=(250, 204, 21, 160), width=2)
            frame_img = Image.alpha_composite(frame_img.convert("RGBA"), overlay).convert("RGB")

            # Draw crisp bold text
            draw = ImageDraw.Draw(frame_img)
            # Subtle drop shadow
            draw.multiline_text((tx + 2, ty + 2), sub_text, fill=(0, 0, 0), font=font_sub, align="center")
            draw.multiline_text((tx, ty), sub_text, fill=(255, 255, 255), font=font_sub, align="center")

        # Write to ffmpeg pipe
        proc.stdin.write(frame_img.tobytes())

        # Collect downscaled frames for GIF preview (10 fps)
        if f_idx % 3 == 0:
            gif_frames.append(frame_img.resize((640, 360), Image.Resampling.BILINEAR))

    proc.stdin.close()
    proc.wait()
    print("MP4 Video created:", OUTPUT_MP4)

    # Save animated GIF for quick instant preview
    print("Saving animated GIF...")
    if gif_frames:
        gif_frames[0].save(
            OUTPUT_GIF,
            save_all=True,
            append_images=gif_frames[1:],
            duration=100, # 10 fps
            loop=0
        )
        print("GIF created:", OUTPUT_GIF)

if __name__ == "__main__":
    render_animation()
