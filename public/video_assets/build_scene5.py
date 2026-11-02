import os
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
BASE_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\video_assets"
ARCHIVAL_DIR = os.path.join(BASE_DIR, "archival")
BG_PATH = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5\tinig_scene5_1793632024256.jpg"
AUDIO_SRC = os.path.join(BASE_DIR, "ang_mga_tinig_ng_nakaraan.mp3")

OUTPUT_MP4 = os.path.join(BASE_DIR, "scene5_japanese_guerrilla.mp4")
OUTPUT_GIF = os.path.join(BASE_DIR, "scene5_japanese_guerrilla.gif")
PUBLIC_MP4 = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\scene5_japanese_guerrilla.mp4"
PUBLIC_GIF = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\scene5_japanese_guerrilla.gif"
ARTIFACT_GIF = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5\scene5_japanese_guerrilla.gif"

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
    cropped = img.crop((left, top, left + WIDTH, top + HEIGHT))
    dimmer = Image.new("RGB", (WIDTH, HEIGHT), (20, 18, 16))
    return Image.blend(cropped, dimmer, 0.45)

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

def build_scene5_audio():
    print("Building Scene 5 audio with natural breathing pauses...")
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

    # Lines 53 through 61 (186.0s to 227.0s)
    p53 = get_slice(186.0, 191.5)  # "Dumating ang panibagong pagsubok sa panahon ng Okupasyong Hapones."
    p54 = get_slice(191.5, 198.5)  # "Nagdulot ang digmaan ng takot, kakulangan sa pagkain, sensura..."
    p55 = get_slice(198.5, 202.5)  # "Hindi lahat ng sibilyan ay may ligtas na pagpipilian."
    p56 = get_slice(202.5, 207.5)  # "May mga lumikas, nagtiis, at naghanap ng paraan upang mabuhay."
    p57 = get_slice(207.5, 210.5)  # "Mayroon ding mga sumapi sa kilusang gerilya."
    p58 = get_slice(210.5, 219.0)  # "Kabilang sa mga lumaban ang Hukbalahap at Hunters-ROTC..."
    p59 = get_slice(219.0, 221.5)  # "Sa gitna ng panganib,"
    p60 = get_slice(221.5, 224.5)  # "muling naging mahalagang tanong ang soberanya:"
    p61 = get_slice(224.5, 227.0)  # "Sino ang tunay na may kapangyarihang magpasya para sa bayan?"

    pieces = [
        # Segment 1: Okupasyong Hapones & Pearl Harbor
        p53, make_pause(0.8),
        # Segment 2: Pinsala ng Digmaan & Intramuros
        p54, make_pause(1.0),
        # Segment 3: Pagtitiis ng Sibilyan & Paglikas
        p55, p56, make_pause(1.0),
        # Segment 4: Kilusang Gerilya & Pajota
        p57, make_pause(0.6),
        # Segment 5: HUKBALAHAP, Hunters-ROTC & Nieves Fernandez
        p58, make_pause(1.2),
        # Segment 6: Tanong ng Soberanya
        p59, p60, make_pause(0.4),
        p61, make_pause(2.5)
    ]

    out_audio = np.concatenate(pieces)
    total_sec = len(out_audio) / SAMPLE_RATE
    print(f"Scene 5 audio assembled: {total_sec:.2f} seconds")

    temp_audio = os.path.join(BASE_DIR, "temp_scene5_audio.wav")
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

def render_scene5():
    audio_file, duration = build_scene5_audio()
    total_frames = int(duration * FPS)

    print("Loading base background & archival cards for Scene 5...")
    base_bg = load_and_fit(BG_PATH)

    # Cards preparation
    c_pearl = make_archival_card(os.path.join(ARCHIVAL_DIR, "The_USS_Arizona_(BB-39)_burning_after_the_Japanese_attack_on_Pearl_Harbor_-_NARA_195617_-_Edit.jpg"), target_max_w=900, target_max_h=580, label="Pagsiklab ng Digmaan sa Pasipiko (Disyembre 1941)")
    c_intramuros = make_archival_card(os.path.join(ARCHIVAL_DIR, "Manila_Walled_City_Destruction_May_1945.jpg"), target_max_w=920, target_max_h=580, label="Pinsala ng Digmaan: Pagkawasak ng Maynila at Intramuros (1945)")
    c_civilians = make_archival_card(os.path.join(ARCHIVAL_DIR, "card_wartime_civilians.jpg"), target_max_w=920, target_max_h=600)
    c_pajota = make_archival_card(os.path.join(ARCHIVAL_DIR, "Pajotas_Guerrillas.jpg"), target_max_w=640, target_max_h=620, label="Kilusang Gerilya: Pwersa ni Kapitan Juan Pajota")
    c_nieves = make_archival_card(os.path.join(ARCHIVAL_DIR, "CaptainNievesFernandez.jpg"), target_max_w=780, target_max_h=580, label="Kapitan Nieves Fernandez (Kumander ng Gerilya sa Leyte)")
    c_soberanya = make_archival_card(os.path.join(ARCHIVAL_DIR, "card_soberanya_question.jpg"), target_max_w=920, target_max_h=600)

    cards = [
        c_pearl.rotate(-1.5, resample=Image.Resampling.BICUBIC, expand=True),
        c_intramuros.rotate(1.5, resample=Image.Resampling.BICUBIC, expand=True),
        c_civilians.rotate(0.0, resample=Image.Resampling.BICUBIC, expand=True),
        c_pajota.rotate(-1.5, resample=Image.Resampling.BICUBIC, expand=True),
        c_nieves.rotate(1.5, resample=Image.Resampling.BICUBIC, expand=True),
        c_soberanya.rotate(0.0, resample=Image.Resampling.BICUBIC, expand=True)
    ]

    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 46)

    # Subtitle timeline calculated:
    # 0.0 -> 6.3: Dumating ang panibagong pagsubok\nsa panahon ng Okupasyong Hapones.
    # 6.3 -> 14.3: Nagdulot ang digmaan ng takot, kakulangan sa pagkain,\nsensura, at pagkawala ng maraming kalayaan.
    # 14.3 -> 18.3: Hindi lahat ng sibilyan ay may ligtas na pagpipilian.
    # 18.3 -> 24.3: May mga lumikas, nagtiis,\nat naghanap ng paraan upang mabuhay.
    # 24.3 -> 27.9: Mayroon ding mga sumapi sa kilusang gerilya.
    # 27.9 -> 37.6: Kabilang sa mga lumaban ang Hukbalahap at Hunters-ROTC,\nna gumamit ng organisadong paglaban at intelihensiya.
    # 37.6 -> 40.1: Sa gitna ng panganib,
    # 40.1 -> 43.5: muling naging mahalagang tanong ang soberanya:
    # 43.5 -> 48.5: Sino ang tunay na may kapangyarihang\nmagpasya para sa bayan?

    def get_subtitle(t):
        if 0.0 <= t < 6.3:
            return "Dumating ang panibagong pagsubok\nsa panahon ng Okupasyong Hapones."
        elif 6.3 <= t < 14.3:
            return "Nagdulot ang digmaan ng takot, kakulangan sa pagkain,\nsensura, at pagkawala ng maraming kalayaan."
        elif 14.3 <= t < 18.3:
            return "Hindi lahat ng sibilyan ay may ligtas na pagpipilian."
        elif 18.3 <= t < 24.3:
            return "May mga lumikas, nagtiis,\nat naghanap ng paraan upang mabuhay."
        elif 24.3 <= t < 27.9:
            return "Mayroon ding mga sumapi sa kilusang gerilya."
        elif 27.9 <= t < 37.6:
            return "Kabilang sa mga lumaban ang Hukbalahap at Hunters-ROTC,\nna gumamit ng organisadong paglaban at intelihensiya."
        elif 37.6 <= t < 40.1:
            return "Sa gitna ng panganib,"
        elif 40.1 <= t < 43.5:
            return "muling naging mahalagang tanong ang soberanya:"
        elif 43.5 <= t < 48.5:
            return "Sino ang tunay na may kapangyarihang\nmagpasya para sa bayan?"
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
    print(f"Rendering {total_frames} frames of Scene 5...")
    gif_frames = []

    # Slots:
    # 0.0 - 6.3s: c_pearl (Pearl Harbor / WWII Outbreak)
    # 6.3 - 14.3s: c_intramuros (Ruins of Manila / Intramuros 1945)
    # 14.3 - 24.3s: c_civilians (Buhay-Sibilyan card)
    # 24.3 - 27.9s: c_pajota (Captain Pajota's Guerillas)
    # 27.9 - 37.6s: c_nieves (Captain Nieves Fernandez / HUKBALAHAP / Hunters)
    # 37.6 - 48.5s: c_soberanya (Soberanya Question card)

    slots = [
        (0.0, 6.3, cards[0]),
        (6.3, 14.3, cards[1]),
        (14.3, 24.3, cards[2]),
        (24.3, 27.9, cards[3]),
        (27.9, 37.6, cards[4]),
        (37.6, 48.5, cards[5])
    ]

    for f_idx in range(total_frames):
        t = f_idx / FPS

        zoom = 1.0 + (t / duration) * 0.04
        cw = WIDTH / zoom
        ch = HEIGHT / zoom
        cx = (WIDTH - cw) / 2
        cy = (HEIGHT - ch) / 2
        frame = base_bg.crop((cx, cy, cx + cw, cy + ch)).resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)

        if t >= duration - 1.5:
            f_out = min(1.0, (t - (duration - 1.5)) / 1.5)
            frame = Image.blend(frame, Image.new("RGB", (WIDTH, HEIGHT), (6, 5, 5)), f_out)

        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))

        for start_t, end_t, card_img in slots:
            if start_t <= t < end_t:
                time_in = t - start_t
                time_left = end_t - t

                slide_p = min(1.0, time_in / 0.8)
                ease = 1.0 - (1.0 - slide_p) ** 3
                target_x = (WIDTH - card_img.width) // 2
                target_y = (HEIGHT - card_img.height) // 2 - 25
                cur_y = int(HEIGHT + (target_y - HEIGHT) * ease)

                if time_left < 0.4:
                    alpha = max(0.0, time_left / 0.4)
                else:
                    alpha = 1.0

                c_draw = card_img.copy()
                a_arr = (np.array(c_draw.split()[-1], dtype=np.float32) * alpha).astype(np.uint8)
                c_draw.putalpha(Image.fromarray(a_arr, mode="L"))
                overlay.alpha_composite(c_draw, (target_x, cur_y))
                break

        frame = Image.alpha_composite(frame.convert("RGBA"), overlay).convert("RGB")

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
    print("Scene 5 Video rendered:", OUTPUT_MP4)

    import shutil
    shutil.copyfile(OUTPUT_MP4, PUBLIC_MP4)

    if gif_frames:
        print("Saving animated GIF preview for Scene 5...")
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
    render_scene5()
