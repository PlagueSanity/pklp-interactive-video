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
BOOK_PATH = os.path.join(ARCHIVAL_DIR, "book_question_journal.jpg")
AUDIO_SRC = os.path.join(BASE_DIR, "ang_mga_tinig_ng_nakaraan.mp3")

OUTPUT_MP4 = os.path.join(BASE_DIR, "scene1_opening.mp4")
OUTPUT_GIF = os.path.join(BASE_DIR, "scene1_opening.gif")
PUBLIC_MP4 = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\scene1_opening.mp4"
PUBLIC_GIF = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\scene1_opening.gif"
ARTIFACT_GIF = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5\scene1_opening.gif"

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
    
    # Soft drop shadow
    shadow_pad = 26
    full_w = card_w + shadow_pad * 2
    full_h = card_h + shadow_pad * 2
    full = Image.new("RGBA", (full_w, full_h), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(full)
    sdraw.rounded_rectangle([shadow_pad + 6, shadow_pad + 10, shadow_pad + card_w + 6, shadow_pad + card_h + 10], radius=12, fill=(0, 0, 0, 150))
    full = full.filter(ImageFilter.GaussianBlur(12))
    full.paste(card, (shadow_pad, shadow_pad), card)
    return full

def build_scene1_audio():
    print("Building Scene 1 audio with natural breathing pauses...")
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

    # Slices from master narration:
    p0 = get_slice(0.0, 2.8)    # "Ang mga Tinig ng Nakaraan."
    p1 = get_slice(2.8, 5.5)    # "Sa isang lumang tahanan sa probinsya,"
    p2 = get_slice(5.5, 8.5)    # "may natagpuang kahong matagal nang hindi nabubuksan."
    p3 = get_slice(8.5, 11.0)   # "Sa loob nito ay mga larawan,"
    p4 = get_slice(11.0, 13.0)  # "kupas na papel,"
    p5 = get_slice(13.0, 17.0)  # "at mga tala tungkol sa buhay ng mga Pilipino sa iba't ibang panahon."
    p6 = get_slice(17.0, 21.0)  # "Sa bawat pahina, mababakas ang isang tanong:"
    p7 = get_slice(21.0, 25.0)  # "Paano nabuhay ang mga taong humarap sa kawalan ng katarungan?"

    pieces = [
        # Segment 0: Title on Black (0.0 to 4.2s)
        p0, make_pause(1.4),
        # Segment 1: Rustic Room (4.2 to 7.4s)
        p1, make_pause(0.5),
        # Segment 2: Baul Opens (7.4 to 12.8s)
        p2, make_pause(2.4),
        # Segment 3: "Sa loob nito ay mga larawan" (Card 1 slides in) (12.8 to 17.2s)
        p3, make_pause(1.9),
        # Segment 4: "kupas na papel" (Card 2 slides in) (17.2 to 21.2s)
        p4, make_pause(2.0),
        # Segment 5: "at mga tala..." (Card 3 slides in) (21.2 to 27.5s)
        p5, make_pause(2.3),
        # Black transition + 0.5s pause as requested (27.5 to 30.5s)
        make_pause(3.0),
        # Segment 6: Book Question Intro (30.5 to 35.5s)
        p6, make_pause(1.0),
        # Segment 7: The Question Calligraphy (35.5 to 42.0s)
        p7, make_pause(2.5)
    ]

    out_audio = np.concatenate(pieces)
    total_sec = len(out_audio) / SAMPLE_RATE
    print(f"Scene 1 audio assembled: {total_sec:.2f} seconds")

    temp_audio = os.path.join(BASE_DIR, "temp_scene1_audio.wav")
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

def render_scene1():
    audio_file, duration = build_scene1_audio()
    total_frames = int(duration * FPS)

    print("Loading base backgrounds & archival cards...")
    img_closed = load_and_fit(CLOSED_PATH)
    img_open = load_and_fit(OPEN_PATH)
    img_book = load_and_fit(BOOK_PATH)
    arr_closed = np.array(img_closed, dtype=np.float32)
    arr_open = np.array(img_open, dtype=np.float32)

    # Make the 3 large prominent archival cards
    c1 = make_archival_card(os.path.join(ARCHIVAL_DIR, "Surigaonon_schoolgirls_1901.jpg"), target_max_w=850, target_max_h=580, label="Larawan: Mga Pilipino sa Panimula ng Siglo")
    c2 = make_archival_card(os.path.join(ARCHIVAL_DIR, "declaration_of_independence_page4.jpg"), target_max_w=680, target_max_h=620, label="Kupas na Papel: Kasulatan ng Kasaysayan (1898)")
    c3 = make_archival_card(os.path.join(ARCHIVAL_DIR, "First_prisoners_of_the_Filipino_revolution_in_1896.JPG"), target_max_w=850, target_max_h=580, label="Tala: Mga Rebolusyonaryo ng 1896")

    c1_rot = c1.rotate(-3.5, resample=Image.Resampling.BICUBIC, expand=True)
    c2_rot = c2.rotate(2.0, resample=Image.Resampling.BICUBIC, expand=True)
    c3_rot = c3.rotate(-1.0, resample=Image.Resampling.BICUBIC, expand=True)

    font_title = ImageFont.truetype("C:/Windows/Fonts/georgiab.ttf", 64)
    font_sub_title = ImageFont.truetype("C:/Windows/Fonts/georgiai.ttf", 34)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 46)

    def get_subtitle(t):
        if 0.0 <= t < 2.8:
            return "Ang mga Tinig ng Nakaraan."
        elif 4.2 <= t < 6.9:
            return "Sa isang lumang tahanan sa probinsya,"
        elif 7.4 <= t < 10.4:
            return "may natagpuang kahong matagal nang hindi nabubuksan."
        elif 12.8 <= t < 15.3:
            return "Sa loob nito ay mga larawan,"
        elif 17.2 <= t < 19.2:
            return "kupas na papel,"
        elif 21.2 <= t < 25.5:
            return "at mga tala tungkol sa buhay ng mga Pilipino\nsa iba't ibang panahon."
        elif 30.5 <= t < 34.5:
            return "Sa bawat pahina, mababakas ang isang tanong:"
        elif 35.5 <= t < 39.8:
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
    print(f"Rendering {total_frames} frames of Scene 1...")
    gif_frames = []

    # Position definitions
    # Single center resting position for prominent cards:
    card1_pos = ((WIDTH - c1_rot.width) // 2, (HEIGHT - c1_rot.height) // 2 - 25)
    card2_pos = ((WIDTH - c2_rot.width) // 2, (HEIGHT - c2_rot.height) // 2 - 25)
    card3_pos = ((WIDTH - c3_rot.width) // 2, (HEIGHT - c3_rot.height) // 2 - 25)

    for f_idx in range(total_frames):
        t = f_idx / FPS

        # --- Phase A: Title Screen on Pure Black (0.0 to 4.2s) ---
        if t < 4.2:
            frame = Image.new("RGB", (WIDTH, HEIGHT), (6, 5, 5))
            # Fade in 0..1s, hold 1..3.2s, fade out 3.2..4.2s
            if t < 1.0:
                t_alpha = t / 1.0
            elif t < 3.2:
                t_alpha = 1.0
            else:
                t_alpha = max(0.0, 1.0 - (t - 3.2) / 1.0)

            if t_alpha > 0:
                draw = ImageDraw.Draw(frame)
                t1 = "Ang mga Tinig ng Nakaraan"
                b1 = draw.textbbox((0, 0), t1, font=font_title)
                w1 = b1[2] - b1[0]
                tx = (WIDTH - w1) // 2
                ty = HEIGHT // 2 - 60
                
                # Gold/cream title with shadow
                col_shadow = (int(30 * t_alpha), int(20 * t_alpha), int(10 * t_alpha))
                col_text = (int(250 * t_alpha), int(230 * t_alpha), int(190 * t_alpha))
                draw.text((tx + 2, ty + 2), t1, fill=col_shadow, font=font_title)
                draw.text((tx, ty), t1, fill=col_text, font=font_title)

                t2 = "~ Pagsusuri sa Kasaysayan at Kamalayan ~"
                b2 = draw.textbbox((0, 0), t2, font=font_sub_title)
                w2 = b2[2] - b2[0]
                draw.text(((WIDTH - w2) // 2, ty + 90), t2, fill=(int(180 * t_alpha), int(160 * t_alpha), int(120 * t_alpha)), font=font_sub_title)

        # --- Phase B: The Baul & Archival Cards (4.2 to 29.5s) ---
        elif t < 29.5:
            # Trunk opening animation:
            # 4.2 to 7.4s: Closed
            # 7.4 to 12.0s: Opening smoothly
            # 12.0+: Open
            if t < 7.4:
                trunk_alpha = 0.0
            elif t < 12.0:
                p = (t - 7.4) / 4.6
                trunk_alpha = p * p * (3 - 2 * p)
            else:
                trunk_alpha = 1.0

            blended_bg = (1.0 - trunk_alpha) * arr_closed + trunk_alpha * arr_open
            bg_img = Image.fromarray(blended_bg.astype(np.uint8))

            # Subtle camera drift
            zoom = 1.0 + ((t - 4.2) / 25.3) * 0.035
            cw = WIDTH / zoom
            ch = HEIGHT / zoom
            cx = (WIDTH - cw) / 2
            cy = (HEIGHT - ch) / 2
            frame = bg_img.crop((cx, cy, cx + cw, cy + ch)).resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)

            # Fade to black between 27.5s and 29.5s
            if t >= 27.5:
                black_fade = min(1.0, (t - 27.5) / 1.5)
                frame = Image.blend(frame, Image.new("RGB", (WIDTH, HEIGHT), (6, 5, 5)), black_fade)

            # Collage Overlay
            overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))

            # Card 1 ("Larawan") active from 12.8s to 17.2s
            if 12.8 <= t < 17.5:
                dur = t - 12.8
                # Slide in from bottom
                slide_p = min(1.0, dur / 1.2)
                ease = 1.0 - (1.0 - slide_p) ** 3
                cur_y = int(HEIGHT + (card1_pos[1] - HEIGHT) * ease)
                # Fade out slightly near end of slot
                alpha = 1.0 if t < 16.5 else max(0.0, 1.0 - (t - 16.5) / 0.8)
                c_img = c1_rot.copy()
                a_arr = (np.array(c_img.split()[-1], dtype=np.float32) * alpha).astype(np.uint8)
                c_img.putalpha(Image.fromarray(a_arr, mode="L"))
                overlay.alpha_composite(c_img, (card1_pos[0], cur_y))

            # Card 2 ("Kupas na papel") active from 17.2s to 21.2s
            elif 17.2 <= t < 21.5:
                dur = t - 17.2
                slide_p = min(1.0, dur / 1.2)
                ease = 1.0 - (1.0 - slide_p) ** 3
                cur_y = int(HEIGHT + (card2_pos[1] - HEIGHT) * ease)
                alpha = 1.0 if t < 20.5 else max(0.0, 1.0 - (t - 20.5) / 0.8)
                c_img = c2_rot.copy()
                a_arr = (np.array(c_img.split()[-1], dtype=np.float32) * alpha).astype(np.uint8)
                c_img.putalpha(Image.fromarray(a_arr, mode="L"))
                overlay.alpha_composite(c_img, (card2_pos[0], cur_y))

            # Card 3 ("Tala ng mga Pilipino...") active from 21.2s to 27.5s
            elif 21.2 <= t < 28.0:
                dur = t - 21.2
                slide_p = min(1.0, dur / 1.2)
                ease = 1.0 - (1.0 - slide_p) ** 3
                cur_y = int(HEIGHT + (card3_pos[1] - HEIGHT) * ease)
                alpha = 1.0 if t < 26.5 else max(0.0, 1.0 - (t - 26.5) / 1.0)
                c_img = c3_rot.copy()
                a_arr = (np.array(c_img.split()[-1], dtype=np.float32) * alpha).astype(np.uint8)
                c_img.putalpha(Image.fromarray(a_arr, mode="L"))
                overlay.alpha_composite(c_img, (card3_pos[0], cur_y))

            frame = Image.alpha_composite(frame.convert("RGBA"), overlay).convert("RGB")

        # --- Phase C: The Question Journal on Black (29.5s to end) ---
        else:
            # 29.5 to 30.5s: Pure black pause
            if t < 30.5:
                frame = Image.new("RGB", (WIDTH, HEIGHT), (6, 5, 5))
            else:
                # Fade in book from 30.5 to 32.0s
                book_in = min(1.0, (t - 30.5) / 1.5)
                # Subtle zoom on book
                zoom = 1.0 + ((t - 30.5) / (duration - 30.5)) * 0.03
                cw = WIDTH / zoom
                ch = HEIGHT / zoom
                cx = (WIDTH - cw) / 2
                cy = (HEIGHT - ch) / 2
                cropped_book = img_book.crop((cx, cy, cx + cw, cy + ch)).resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)
                
                # Fade out near final second
                if t >= duration - 1.2:
                    book_alpha = max(0.0, (duration - t) / 1.2)
                else:
                    book_alpha = book_in

                frame = Image.blend(Image.new("RGB", (WIDTH, HEIGHT), (6, 5, 5)), cropped_book, book_alpha)

        # --- Large Clean Subtitles ---
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

        # Collect preview frames for GIF (every 6th frame = 5 fps)
        if f_idx % 6 == 0:
            gif_frames.append(frame.resize((540, 304), Image.Resampling.BILINEAR))

    proc.stdin.close()
    proc.wait()
    print("Scene 1 Video rendered:", OUTPUT_MP4)

    import shutil
    shutil.copyfile(OUTPUT_MP4, PUBLIC_MP4)

    if gif_frames:
        print("Saving animated GIF preview for Scene 1...")
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
    render_scene1()
