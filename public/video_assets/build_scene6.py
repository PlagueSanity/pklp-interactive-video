import os
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
BASE_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\video_assets"
ARCHIVAL_DIR = os.path.join(BASE_DIR, "archival")
CLOSED_PATH = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5\trunk_frame_closed_1793633808943.jpg"
OPEN_PATH = os.path.join(BASE_DIR, "trunk_ref_open.jpg")
SUNRISE_PATH = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5\tinig_scene6_1793632054878.jpg"
AUDIO_SRC = os.path.join(BASE_DIR, "ang_mga_tinig_ng_nakaraan.mp3")

OUTPUT_MP4 = os.path.join(BASE_DIR, "scene6_reflection_dawn.mp4")
OUTPUT_GIF = os.path.join(BASE_DIR, "scene6_reflection_dawn.gif")
PUBLIC_MP4 = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\scene6_reflection_dawn.mp4"
PUBLIC_GIF = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\scene6_reflection_dawn.gif"
ARTIFACT_GIF = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5\scene6_reflection_dawn.gif"

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

def make_archival_card(src_path, target_max_w=980, target_max_h=640, label=None):
    im = Image.open(src_path).convert("RGB")
    scale = min(target_max_w / im.width, target_max_h / im.height)
    new_w, new_h = int(im.width * scale), int(im.height * scale)
    im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    border_px = 16
    bottom_extra = 36 if label else border_px
    card_w = new_w + border_px * 2
    card_h = new_h + border_px + bottom_extra
    
    card = Image.new("RGBA", (card_w, card_h), (242, 238, 228, 255))
    card.paste(im, (border_px, border_px))
    cdraw = ImageDraw.Draw(card)
    cdraw.rectangle([0, 0, card_w - 1, card_h - 1], outline=(180, 170, 150, 255), width=2)
    
    if label:
        try:
            lbl_font = ImageFont.truetype("C:/Windows/Fonts/georgiai.ttf", 20)
        except:
            lbl_font = ImageFont.load_default()
        lbbox = cdraw.textbbox((0,0), label, font=lbl_font)
        lw = lbbox[2] - lbbox[0]
        cdraw.text(((card_w - lw)//2, card_h - bottom_extra + 6), label, fill=(100, 85, 70), font=lbl_font)
    
    shadow_pad = 26
    full_w = card_w + shadow_pad * 2
    full_h = card_h + shadow_pad * 2
    full = Image.new("RGBA", (full_w, full_h), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(full)
    sdraw.rounded_rectangle([shadow_pad + 6, shadow_pad + 10, shadow_pad + card_w + 6, shadow_pad + card_h + 10], radius=12, fill=(0, 0, 0, 150))
    full = full.filter(ImageFilter.GaussianBlur(12))
    full.paste(card, (shadow_pad, shadow_pad), card)
    return full

def build_scene6_audio():
    print("Building Scene 6 audio with natural breathing pauses...")
    cmd = [FFMPEG, "-i", AUDIO_SRC, "-f", "s16le", "-ac", "1", "-ar", str(SAMPLE_RATE), "-"]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    raw = np.frombuffer(proc.stdout, dtype=np.int16)

    def get_slice(start_s, end_s):
        s_idx = int(start_s * SAMPLE_RATE)
        e_idx = int(end_s * SAMPLE_RATE)
        return raw[s_idx:e_idx]

    def make_pause(seconds):
        n_samples = int(seconds * SAMPLE_RATE)
        noise = (np.random.normal(0, 14, n_samples)).astype(np.int16)
        return noise

    # Lines 62 through 70 (227.0s to 269.32s)
    p62 = get_slice(227.0, 230.5)  # "Muling nagsara ang lumang kahon."
    p63 = get_slice(230.5, 234.5)  # "Ngunit ang mga kuwentong iniwan nito ay hindi natapos sa mga pahina."
    p64 = get_slice(234.5, 238.0)  # "Ang pakikibaka ay hindi lamang tungkol sa paglaban."
    p65 = get_slice(238.0, 241.5)  # "Ang pakikiangkop ay hindi rin nangangahulugang pagsuko."
    p66 = get_slice(241.5, 248.0)  # "Sa bawat panahon, may mga taong pumili, kumilos, at nagtiis..."
    p67 = get_slice(248.0, 254.5)  # "Ang mga karapatang tinatamasa ngayon ay may kasaysayan..."
    p68 = get_slice(254.5, 257.5)  # "At para sa bagong henerasyon, may naiiwang tanong:"
    p69 = get_slice(257.5, 262.5)  # "Kung ang mga nauna sa atin ay nagkaroon ng lakas ng loob..."
    p70 = get_slice(262.5, 269.32) # "paano naman natin gagamitin ang ating kalayaan..."

    pieces = [
        # Segment 1: Muling nagsara ang lumang kahon (Baul closes)
        p62, make_pause(1.5),
        # Segment 2: Kuwento... hindi natapos sa pahina
        p63, make_pause(1.0),
        # Segment 3: Pakikibaka & Pakikiangkop
        p64, make_pause(0.5),
        p65, make_pause(1.2),
        # Segment 4: Pamana ng Kasaysayan Card
        p66, make_pause(0.6),
        p67, make_pause(1.5),
        # Segment 5: Pagsikat ng Araw (Capiz Dawn) & Hamon sa Bagong Henerasyon
        p68, make_pause(0.8),
        p69, make_pause(0.4),
        p70, make_pause(3.5) # Grand hold on sunrise for students to reflect
    ]

    out_audio = np.concatenate(pieces)
    total_sec = len(out_audio) / SAMPLE_RATE
    print(f"Scene 6 audio assembled: {total_sec:.2f} seconds")

    temp_audio = os.path.join(BASE_DIR, "temp_scene6_audio.wav")
    cmd_save = [
        FFMPEG, "-y",
        "-f", "s16le", "-ac", "1", "-ar", str(SAMPLE_RATE),
        "-i", "-",
        temp_audio
    ]
    p_save = subprocess.Popen(cmd_save, stdin=subprocess.PIPE)
    p_save.stdin.write(out_audio.tobytes())
    p_save.stdin.close()
    p_save.wait()

    return temp_audio, total_sec

def render_scene6():
    audio_file, duration = build_scene6_audio()
    total_frames = int(duration * FPS)

    print("Loading base backgrounds & archival cards for Scene 6...")
    img_closed = load_and_fit(CLOSED_PATH)
    img_open = load_and_fit(OPEN_PATH)
    img_dawn = load_and_fit(SUNRISE_PATH)
    arr_closed = np.array(img_closed, dtype=np.float32)
    arr_open = np.array(img_open, dtype=np.float32)

    c_pamana = make_archival_card(os.path.join(ARCHIVAL_DIR, "card_pamana_ng_kasaysayan.jpg"), target_max_w=920, target_max_h=600)
    c_pamana_rot = c_pamana.rotate(0.0, resample=Image.Resampling.BICUBIC, expand=True)

    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 46)

    # Subtitle timeline calculated:
    # 0.0 -> 3.5: Muling nagsara ang lumang kahon.
    # 3.5 -> 8.5: Ngunit ang mga kuwentong iniwan nito\nay hindi natapos sa mga pahina.
    # 8.5 -> 12.0: Ang pakikibaka ay hindi lamang tungkol sa paglaban.
    # 12.0 -> 16.7: Ang pakikiangkop ay hindi rin nangangahulugang pagsuko.
    # 16.7 -> 23.8: Sa bawat panahon, may mga taong pumili, kumilos,\nat nagtiis ayon sa kanilang kalagayan.
    # 23.8 -> 31.8: Ang mga karapatang tinatamasa ngayon\nay may kasaysayan ng pagsisikap at sakripisyo.
    # 31.8 -> 35.6: At para sa bagong henerasyon, may naiiwang tanong:
    # 35.6 -> 41.0: Kung ang mga nauna sa atin ay nagkaroon ng lakas ng loob\nna humarap sa kanilang panahon,
    # 41.0 -> 52.0: paano naman natin gagamitin ang ating kalayaan, edukasyon,\nat karapatan upang maging responsable sa ating lipunan?

    def get_subtitle(t):
        if 0.0 <= t < 3.5:
            return "Muling nagsara ang lumang kahon."
        elif 3.5 <= t < 8.5:
            return "Ngunit ang mga kuwentong iniwan nito\nay hindi natapos sa mga pahina."
        elif 8.5 <= t < 12.0:
            return "Ang pakikibaka ay hindi lamang\ntungkol sa paglaban."
        elif 12.0 <= t < 16.7:
            return "Ang pakikiangkop ay hindi rin\nnangangahulugang pagsuko."
        elif 16.7 <= t < 23.8:
            return "Sa bawat panahon, may mga taong pumili, kumilos,\nat nagtiis ayon sa kanilang kalagayan."
        elif 23.8 <= t < 31.8:
            return "Ang mga karapatang tinatamasa ngayon\nay may kasaysayan ng pagsisikap at sakripisyo."
        elif 31.8 <= t < 35.6:
            return "At para sa bagong henerasyon,\nmay naiiwang tanong:"
        elif 35.6 <= t < 41.0:
            return "Kung ang mga nauna sa atin ay nagkaroon\nng lakas ng loob na humarap sa kanilang panahon,"
        elif 41.0 <= t < 51.5:
            return "paano naman natin gagamitin ang ating kalayaan,\nedukasyon, at karapatan upang maging responsable\nsa ating lipunan?"
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
    print(f"Rendering {total_frames} frames of Scene 6...")
    gif_frames = []

    for f_idx in range(total_frames):
        t = f_idx / FPS

        # --- Phase 1: Baul Closing (0.0 to 16.7s) ---
        if t < 16.7:
            # 0.0 to 1.0s: fully open
            # 1.0 to 5.0s: smoothly closing
            # 5.0+: fully closed
            if t < 1.0:
                p_close = 0.0
            elif t < 5.0:
                p = (t - 1.0) / 4.0
                p_close = p * p * (3 - 2 * p) # cubic ease
            else:
                p_close = 1.0

            blended_baul = (1.0 - p_close) * arr_open + p_close * arr_closed
            baul_img = Image.fromarray(blended_baul.astype(np.uint8))

            zoom = 1.0 + (t / 16.7) * 0.03
            cw = WIDTH / zoom
            ch = HEIGHT / zoom
            cx = (WIDTH - cw) / 2
            cy = (HEIGHT - ch) / 2
            frame = baul_img.crop((cx, cy, cx + cw, cy + ch)).resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)

            # Golden warm ambient sunlight overlay
            glow = Image.new("RGBA", (WIDTH, HEIGHT), (0,0,0,0))
            gdraw = ImageDraw.Draw(glow)
            alpha_glow = int(35 * p_close)
            gdraw.rectangle([0, 0, WIDTH, HEIGHT], fill=(255, 215, 140, alpha_glow))
            frame = Image.alpha_composite(frame.convert("RGBA"), glow).convert("RGB")

        # --- Phase 2: Pamana ng Kasaysayan Card (16.7 to 31.8s) ---
        elif t < 31.8:
            zoom = 1.0 + ((t - 16.7) / 15.1) * 0.03
            cw = WIDTH / zoom
            ch = HEIGHT / zoom
            cx = (WIDTH - cw) / 2
            cy = (HEIGHT - ch) / 2
            frame = img_closed.crop((cx, cy, cx + cw, cy + ch)).resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)
            dim = Image.new("RGB", (WIDTH, HEIGHT), (16, 14, 10))
            frame = Image.blend(frame, dim, 0.45)

            # Slide Pamana card in
            time_in = t - 16.7
            time_left = 31.8 - t
            slide_p = min(1.0, time_in / 0.8)
            ease = 1.0 - (1.0 - slide_p) ** 3
            target_x = (WIDTH - c_pamana_rot.width) // 2
            target_y = (HEIGHT - c_pamana_rot.height) // 2 - 25
            cur_y = int(HEIGHT + (target_y - HEIGHT) * ease)

            alpha = max(0.0, time_left / 0.5) if time_left < 0.5 else 1.0

            c_draw = c_pamana_rot.copy()
            a_arr = (np.array(c_draw.split()[-1], dtype=np.float32) * alpha).astype(np.uint8)
            c_draw.putalpha(Image.fromarray(a_arr, mode="L"))
            ov = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
            ov.alpha_composite(c_draw, (target_x, cur_y))
            frame = Image.alpha_composite(frame.convert("RGBA"), ov).convert("RGB")

        # --- Phase 3: Pagsikat ng Araw (Capiz Sunrise Dawn) (31.8s to end) ---
        else:
            time_dawn = t - 31.8
            dawn_in = min(1.0, time_dawn / 1.5)

            zoom = 1.0 + (time_dawn / (duration - 31.8)) * 0.04
            cw = WIDTH / zoom
            ch = HEIGHT / zoom
            cx = (WIDTH - cw) / 2
            cy = (HEIGHT - ch) / 2
            dawn_frame = img_dawn.crop((cx, cy, cx + cw, cy + ch)).resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)

            # Fade to black in final 2 seconds
            if t >= duration - 2.0:
                final_fade = max(0.0, (duration - t) / 2.0)
            else:
                final_fade = dawn_in

            frame = Image.blend(Image.new("RGB", (WIDTH, HEIGHT), (6, 5, 5)), dawn_frame, final_fade)

        # Subtitles
        sub = get_subtitle(t)
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

        if f_idx % 6 == 0:
            gif_frames.append(frame.resize((540, 304), Image.Resampling.BILINEAR))

    proc.stdin.close()
    proc.wait()
    print("Scene 6 Video rendered:", OUTPUT_MP4)

    import shutil
    shutil.copyfile(OUTPUT_MP4, PUBLIC_MP4)

    if gif_frames:
        print("Saving animated GIF preview for Scene 6...")
        gif_frames[0].save(
            OUTPUT_GIF,
            save_all=True,
            append_images=gif_frames[1:],
            duration=200,
            loop=0,
            optimize=True
        )
        shutil.copyfile(OUTPUT_GIF, PUBLIC_GIF)
        shutil.copyfile(OUTPUT_GIF, ARTIFACT_GIF)
        print("GIF preview saved:", OUTPUT_GIF)

if __name__ == "__main__":
    render_scene6()
