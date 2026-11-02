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

OUTPUT_MP4 = os.path.join(BASE_DIR, "collage_opening_demo.mp4")
OUTPUT_GIF = os.path.join(BASE_DIR, "collage_opening_demo.gif")
PUBLIC_MP4 = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\collage_opening_demo.mp4"
PUBLIC_GIF = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\collage_opening_demo.gif"

WIDTH, HEIGHT = 1920, 1080
FPS = 30
SAMPLE_RATE = 44100

def load_and_fit(path):
    img = Image.open(path).convert("RGB")
    scale = max(WIDTH / img.width, HEIGHT / img.height)
    new_w, new_h = int(img.width * scale), int(img.height * scale)
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - WIDTH) // 2
    top = (new_h - HEIGHT) // 2
    return img.crop((left, top, left + WIDTH, top + HEIGHT))

def build_expanded_audio():
    print("Extracting raw audio samples...")
    cmd = [FFMPEG, "-i", AUDIO_SRC, "-f", "s16le", "-ac", "1", "-ar", str(SAMPLE_RATE), "-"]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    raw = np.frombuffer(proc.stdout, dtype=np.int16)

    def get_slice(start_s, end_s):
        s_idx = int(start_s * SAMPLE_RATE)
        e_idx = int(end_s * SAMPLE_RATE)
        return raw[s_idx:e_idx]

    def make_pause(seconds):
        n_samples = int(seconds * SAMPLE_RATE)
        # Gentle analog room tone noise (-55dB)
        noise = (np.random.normal(0, 15, n_samples)).astype(np.int16)
        return noise

    # Original phrase time slices:
    p1 = get_slice(0.0, 2.8)    # "Ang mga Tinig ng Nakaraan."
    p2 = get_slice(2.8, 5.5)    # "Sa isang lumang tahanan sa probinsya,"
    p3 = get_slice(5.5, 8.5)    # "may natagpuang kahong matagal nang hindi nabubuksan."
    p4 = get_slice(8.5, 11.0)   # "Sa loob nito ay mga larawan,"
    p5 = get_slice(11.0, 13.0)  # "kupas na papel,"
    p6 = get_slice(13.0, 17.0)  # "at mga tala tungkol sa buhay ng mga Pilipino sa iba't ibang panahon."
    p7 = get_slice(17.0, 21.0)  # "Sa bawat pahina, mababakas ang isang tanong:"
    p8 = get_slice(21.0, 25.0)  # "Paano nabuhay ang mga taong humarap sa kawalan ng katarungan?"

    pieces = [
        p1, make_pause(1.5),
        p2, make_pause(0.5),
        p3, make_pause(2.5),
        p4, make_pause(2.0),
        p5, make_pause(2.0),
        p6, make_pause(2.5),
        p7, make_pause(1.2),
        p8, make_pause(2.8)
    ]

    out_audio = np.concatenate(pieces)
    total_sec = len(out_audio) / SAMPLE_RATE
    print(f"Expanded audio generated: {total_sec:.2f} seconds")

    out_audio_file = os.path.join(BASE_DIR, "temp_collage_audio.wav")
    cmd_save = [
        FFMPEG, "-y",
        "-f", "s16le", "-ac", "1", "-ar", str(SAMPLE_RATE),
        "-i", "-",
        out_audio_file
    ]
    p_save = subprocess.Popen(cmd_save, stdin=subprocess.PIPE)
    p_save.stdin.write(out_audio.tobytes())
    p_save.stdin.close()
    p_save.wait()

    return out_audio_file, total_sec

def render_collage_video():
    audio_file, duration = build_expanded_audio()
    total_frames = int(duration * FPS)

    print("Loading closed & open base frames...")
    img_closed = load_and_fit(CLOSED_PATH)
    img_open = load_and_fit(OPEN_PATH)
    arr_closed = np.array(img_closed, dtype=np.float32)
    arr_open = np.array(img_open, dtype=np.float32)

    # Load collage cards
    card1 = Image.open(os.path.join(BASE_DIR, "collage_item1.png")).convert("RGBA")
    card2 = Image.open(os.path.join(BASE_DIR, "collage_item2.png")).convert("RGBA")
    card3 = Image.open(os.path.join(BASE_DIR, "collage_item3.png")).convert("RGBA")

    # Resize cards to ideal collage scale
    scale_factor = 1.35
    c1 = card1.resize((int(card1.width * scale_factor), int(card1.height * scale_factor)), Image.Resampling.LANCZOS)
    c2 = card2.resize((int(card2.width * scale_factor), int(card2.height * scale_factor)), Image.Resampling.LANCZOS)
    c3 = card3.resize((int(card3.width * scale_factor), int(card3.height * scale_factor)), Image.Resampling.LANCZOS)

    # Pre-rotate cards slightly like real photos on a table
    c1_rot = c1.rotate(-4.5, resample=Image.Resampling.BICUBIC, expand=True)
    c2_rot = c2.rotate(2.5, resample=Image.Resampling.BICUBIC, expand=True)
    c3_rot = c3.rotate(-1.5, resample=Image.Resampling.BICUBIC, expand=True)

    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 46)

    # Subtitle timeline matching our expanded audio pieces:
    # 0.0 - 2.8: "Ang mga Tinig ng Nakaraan."
    # 2.8 - 4.3: [Pause]
    # 4.3 - 7.0: "Sa isang lumang tahanan sa probinsya,"
    # 7.0 - 7.5: [Pause]
    # 7.5 - 10.5: "may natagpuang kahong matagal nang hindi nabubuksan."
    # 10.5 - 13.0: [Pause]
    # 13.0 - 15.5: "Sa loob nito ay mga larawan,"
    # 15.5 - 17.5: [Pause]
    # 17.5 - 19.5: "kupas na papel,"
    # 19.5 - 21.5: [Pause]
    # 21.5 - 25.5: "at mga tala tungkol sa buhay ng mga Pilipino sa iba't ibang panahon."
    # 25.5 - 28.0: [Pause]
    # 28.0 - 32.0: "Sa bawat pahina, mababakas ang isang tanong:"
    # 32.0 - 33.2: [Pause]
    # 33.2 - 37.2: "Paano nabuhay ang mga taong humarap sa kawalan ng katarungan?"
    def get_sub(t):
        if t < 2.8:
            return "Ang mga Tinig ng Nakaraan."
        elif 4.3 <= t < 7.0:
            return "Sa isang lumang tahanan sa probinsya,"
        elif 7.5 <= t < 10.5:
            return "may natagpuang kahong matagal nang hindi nabubuksan."
        elif 13.0 <= t < 16.5:
            return "Sa loob nito ay mga larawan,"
        elif 17.5 <= t < 20.5:
            return "kupas na papel,"
        elif 21.5 <= t < 26.5:
            return "at mga tala tungkol sa buhay ng mga Pilipino\nsa iba't ibang panahon."
        elif 28.0 <= t < 32.0:
            return "Sa bawat pahina, mababakas ang isang tanong:"
        elif 33.2 <= t < 37.5:
            return "Paano nabuhay ang mga taong\nhumarap sa kawalan ng katarungan?"
        return ""

    cmd_ffmpeg = [
        FFMPEG, "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-i", audio_file,
        "-c:v", "libx264",
        "-preset", "faster",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        OUTPUT_MP4
    ]
    proc = subprocess.Popen(cmd_ffmpeg, stdin=subprocess.PIPE)

    print(f"Rendering {total_frames} frames of collage motion video...")
    gif_frames = []

    # Final resting positions for the 3 collage cards:
    # Card 1 (Students photo): left side
    target_pos1 = (int(WIDTH * 0.18), int(HEIGHT * 0.28))
    # Card 2 (Handwritten letters): center
    target_pos2 = (int(WIDTH * 0.40), int(HEIGHT * 0.34))
    # Card 3 (Colonial building & records): right side
    target_pos3 = (int(WIDTH * 0.62), int(HEIGHT * 0.26))

    # Origin (inside the trunk):
    origin_pos = (int(WIDTH * 0.32), int(HEIGHT * 0.55))

    for f_idx in range(total_frames):
        t = f_idx / FPS

        # --- Base Trunk Opening Animation ---
        # 0.0 to 6.5s: Closed
        # 6.5 to 10.5s: Smoothly opening
        # 10.5s+: Fully open
        if t < 6.5:
            trunk_alpha = 0.0
        elif t < 10.5:
            p = (t - 6.5) / 4.0
            trunk_alpha = p * p * (3 - 2 * p) # cubic ease
        else:
            trunk_alpha = 1.0

        blended_bg = (1.0 - trunk_alpha) * arr_closed + trunk_alpha * arr_open
        bg_img = Image.fromarray(blended_bg.astype(np.uint8))

        # Gentle cinematic camera float (zoom 1.0 to 1.04)
        zoom = 1.0 + (t / duration) * 0.04
        cw = WIDTH / zoom
        ch = HEIGHT / zoom
        cx = (WIDTH - cw) / 2
        cy = (HEIGHT - ch) / 2
        frame = bg_img.crop((cx, cy, cx + cw, cy + ch)).resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)

        # Collage Overlay Canvas
        collage_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))

        # Overall fade out of all cards between 32.5s and 35.5s
        if t >= 35.5:
            master_card_alpha = 0.0
        elif t >= 32.5:
            master_card_alpha = 1.0 - (t - 32.5) / 3.0
        else:
            master_card_alpha = 1.0

        # --- Card 1 Animation (Starts at 13.5s) ---
        if t >= 13.5 and master_card_alpha > 0:
            slide_dur = 1.4
            p1 = min(1.0, (t - 13.5) / slide_dur)
            ease1 = 1.0 - (1.0 - p1) ** 3 # cubic ease out
            cur_x = int(origin_pos[0] + (target_pos1[0] - origin_pos[0]) * ease1)
            cur_y = int(origin_pos[1] + (target_pos1[1] - origin_pos[1]) * ease1)

            card_alpha = min(1.0, p1 * 1.5) * master_card_alpha
            c1_draw = c1_rot.copy()
            a1 = (np.array(c1_draw.split()[-1], dtype=np.float32) * card_alpha).astype(np.uint8)
            c1_draw.putalpha(Image.fromarray(a1, mode="L"))
            collage_layer.alpha_composite(c1_draw, (cur_x, cur_y))

        # --- Card 2 Animation (Starts at 17.5s) ---
        if t >= 17.5 and master_card_alpha > 0:
            slide_dur = 1.4
            p2 = min(1.0, (t - 17.5) / slide_dur)
            ease2 = 1.0 - (1.0 - p2) ** 3
            cur_x = int(origin_pos[0] + (target_pos2[0] - origin_pos[0]) * ease2)
            cur_y = int(origin_pos[1] + (target_pos2[1] - origin_pos[1]) * ease2)

            card_alpha = min(1.0, p2 * 1.5) * master_card_alpha
            c2_draw = c2_rot.copy()
            a2 = (np.array(c2_draw.split()[-1], dtype=np.float32) * card_alpha).astype(np.uint8)
            c2_draw.putalpha(Image.fromarray(a2, mode="L"))
            collage_layer.alpha_composite(c2_draw, (cur_x, cur_y))

        # --- Card 3 Animation (Starts at 21.8s) ---
        if t >= 21.8 and master_card_alpha > 0:
            slide_dur = 1.4
            p3 = min(1.0, (t - 21.8) / slide_dur)
            ease3 = 1.0 - (1.0 - p3) ** 3
            cur_x = int(origin_pos[0] + (target_pos3[0] - origin_pos[0]) * ease3)
            cur_y = int(origin_pos[1] + (target_pos3[1] - origin_pos[1]) * ease3)

            card_alpha = min(1.0, p3 * 1.5) * master_card_alpha
            c3_draw = c3_rot.copy()
            a3 = (np.array(c3_draw.split()[-1], dtype=np.float32) * card_alpha).astype(np.uint8)
            c3_draw.putalpha(Image.fromarray(a3, mode="L"))
            collage_layer.alpha_composite(c3_draw, (cur_x, cur_y))

        # Merge collage layer onto frame
        frame = Image.alpha_composite(frame.convert("RGBA"), collage_layer).convert("RGB")

        # --- Draw Clean Large Subtitles ---
        sub = get_sub(t)
        if sub:
            draw = ImageDraw.Draw(frame)
            bbox = draw.multiline_textbbox((0, 0), sub, font=font_sub, align="center")
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
            tx = (WIDTH - tw) // 2
            ty = HEIGHT - th - 55

            padding = 18
            pill_box = [tx - padding, ty - padding, tx + tw + padding, ty + th + padding]
            ov = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
            draw_ov = ImageDraw.Draw(ov)
            draw_ov.rounded_rectangle(pill_box, radius=12, fill=(10, 15, 25, 205), outline=(250, 204, 21, 160), width=2)
            frame = Image.alpha_composite(frame.convert("RGBA"), ov).convert("RGB")

            draw = ImageDraw.Draw(frame)
            draw.multiline_text((tx + 2, ty + 2), sub, fill=(0, 0, 0), font=font_sub, align="center")
            draw.multiline_text((tx, ty), sub, fill=(255, 255, 255), font=font_sub, align="center")

        proc.stdin.write(frame.tobytes())

        # Collect preview frames for GIF (every 6th frame = 5 fps)
        if f_idx % 6 == 0:
            gif_frames.append(frame.resize((540, 304), Image.Resampling.BILINEAR))

    proc.stdin.close()
    proc.wait()
    print("MP4 Video created:", OUTPUT_MP4)

    # Copy to public
    import shutil
    shutil.copyfile(OUTPUT_MP4, PUBLIC_MP4)

    if gif_frames:
        print(f"Saving animated GIF preview ({len(gif_frames)} frames)...")
        # Save every other frame if too long to make it quick to load, or save at 5 fps
        gif_frames[0].save(
            OUTPUT_GIF,
            save_all=True,
            append_images=gif_frames[1:],
            duration=200, # 5 fps
            loop=0,
            optimize=True
        )
        shutil.copyfile(OUTPUT_GIF, PUBLIC_GIF)
        print("GIF preview created:", OUTPUT_GIF)

if __name__ == "__main__":
    render_collage_video()
