import os
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
BASE_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\video_assets"
ARCHIVAL_DIR = os.path.join(BASE_DIR, "archival")
BG_PATH = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5\tinig_scene3_1793631975729.jpg"
AUDIO_SRC = os.path.join(BASE_DIR, "ang_mga_tinig_ng_nakaraan.mp3")

OUTPUT_MP4 = os.path.join(BASE_DIR, "scene3_propaganda_revolution.mp4")
OUTPUT_GIF = os.path.join(BASE_DIR, "scene3_propaganda_revolution.gif")
PUBLIC_MP4 = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\scene3_propaganda_revolution.mp4"
PUBLIC_GIF = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\scene3_propaganda_revolution.gif"
ARTIFACT_GIF = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5\scene3_propaganda_revolution.gif"

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
    dimmer = Image.new("RGB", (WIDTH, HEIGHT), (18, 14, 10))
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

def build_scene3_audio():
    print("Building Scene 3 audio with natural breathing pauses...")
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

    # Lines 32 through 42 (97.0s to 141.0s)
    p32 = get_slice(97.0, 101.0)   # "Hindi lahat ng pakikibaka ay nagsimula sa armas."
    p33 = get_slice(101.0, 103.5)  # "Sa Kilusang Propaganda,"
    p34 = get_slice(103.5, 107.0)  # "ginamit ang pagsusulat upang humiling ng pagbabago."
    p35 = get_slice(107.0, 111.0)  # "Naging daluyan ng mga panawagan ang pahayagang La Solidaridad."
    p36 = get_slice(111.0, 115.5)  # "Ngunit lumakas din ang paniniwalang hindi sapat ang reporma."
    p37 = get_slice(115.5, 123.0)  # "Noong 1892, itinatag ang Katipunan..."
    p38 = get_slice(123.0, 129.0)  # "Noong 1896, sumiklab ang Himagsikang Pilipino."
    p39 = get_slice(129.0, 131.5)  # "Kasabay ng mga ito,"
    p40 = get_slice(131.5, 135.5)  # "may mga kilusang agraryo na nakatuon sa lupa at kabuhayan."
    p41 = get_slice(135.5, 138.5)  # "Iba-iba ang kanilang paraan at layunin."
    p42 = get_slice(138.5, 141.0)  # "Ipinakita nilang maraming anyo ang pakikibaka."

    pieces = [
        # Segment 1: Hindi lahat ng pakikibaka...
        p32, make_pause(0.8),
        # Segment 2: Kilusang Propaganda & La Solidaridad
        p33, p34, make_pause(0.4),
        p35, make_pause(1.2),
        # Segment 3: Hindi sapat ang reporma
        p36, make_pause(0.8),
        # Segment 4: Katipunan 1892
        p37, make_pause(0.8),
        # Segment 5: Himagsikan 1896
        p38, make_pause(1.2),
        # Segment 6: Kilusang agraryo
        p39, p40, make_pause(1.0),
        # Segment 7: Maraming anyo ang pakikibaka
        p41, p42, make_pause(2.2)
    ]

    out_audio = np.concatenate(pieces)
    total_sec = len(out_audio) / SAMPLE_RATE
    print(f"Scene 3 audio assembled: {total_sec:.2f} seconds")

    temp_audio = os.path.join(BASE_DIR, "temp_scene3_audio.wav")
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

def render_scene3():
    audio_file, duration = build_scene3_audio()
    total_frames = int(duration * FPS)

    print("Loading base background & archival cards for Scene 3...")
    base_bg = load_and_fit(BG_PATH)

    # Cards preparation
    c_lasol = make_archival_card(os.path.join(ARCHIVAL_DIR, "La-solidaridad1.jpg"), target_max_w=680, target_max_h=640, label="Kilusang Propaganda: Pahayagang La Solidaridad (1889)")
    c_kkk = make_archival_card(os.path.join(ARCHIVAL_DIR, "card_katipunan_1892.jpg"), target_max_w=920, target_max_h=600)
    c_bonifacio = make_archival_card(os.path.join(ARCHIVAL_DIR, "Andres_Bonifacio_photo_(cropped).jpg"), target_max_w=640, target_max_h=620, label="Supremo Andres Bonifacio (Tagapagtatag ng Katipunan)")
    c_flags = make_archival_card(os.path.join(ARCHIVAL_DIR, "Flags_of_the_Philippine_Revolution.jpg"), target_max_w=880, target_max_h=580, label="1896 Himagsikan: Mga Bandila ng Rebolusyon")
    c_prisoners = make_archival_card(os.path.join(ARCHIVAL_DIR, "First_prisoners_of_the_Filipino_revolution_in_1896.JPG"), target_max_w=900, target_max_h=580, label="Kasaysayan: Mga Unang Bihag ng Himagsikang 1896")
    c_agrarian = make_archival_card(os.path.join(ARCHIVAL_DIR, "Plowing_land_for_cane_planting_on_Hacienda_Luisita,_Central_Tarlac,_P.I.jpg"), target_max_w=900, target_max_h=580, label="Kilusang Agraryo: Pakikibaka sa Lupa at Kabuhayan")
    c_anyo = make_archival_card(os.path.join(ARCHIVAL_DIR, "card_anyo_ng_pakikibaka.jpg"), target_max_w=920, target_max_h=600)

    cards = [
        c_lasol.rotate(-2.0, resample=Image.Resampling.BICUBIC, expand=True),
        c_kkk.rotate(0.0, resample=Image.Resampling.BICUBIC, expand=True),
        c_bonifacio.rotate(1.5, resample=Image.Resampling.BICUBIC, expand=True),
        c_flags.rotate(-1.5, resample=Image.Resampling.BICUBIC, expand=True),
        c_prisoners.rotate(1.0, resample=Image.Resampling.BICUBIC, expand=True),
        c_agrarian.rotate(-1.5, resample=Image.Resampling.BICUBIC, expand=True),
        c_anyo.rotate(0.0, resample=Image.Resampling.BICUBIC, expand=True)
    ]

    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 46)

    # Subtitle timeline calculated:
    # 0.0 -> 4.8: Hindi lahat ng pakikibaka ay nagsimula sa armas.
    # 4.8 -> 7.3: Sa Kilusang Propaganda,
    # 7.3 -> 11.2: ginamit ang pagsusulat upang humiling ng pagbabago.
    # 11.2 -> 16.4: Naging daluyan ng mga panawagan ang pahayagang La Solidaridad.
    # 16.4 -> 21.7: Ngunit lumakas din ang paniniwalang hindi sapat ang reporma.
    # 21.7 -> 30.0: Noong 1892, itinatag ang Katipunan,\nna nagtaguyod ng paglaya mula sa Espanya.
    # 30.0 -> 37.2: Noong 1896, sumiklab ang Himagsikang Pilipino.
    # 37.2 -> 39.7: Kasabay ng mga ito,
    # 39.7 -> 44.7: may mga kilusang agraryo na nakatuon sa lupa at kabuhayan.
    # 44.7 -> 47.7: Iba-iba ang kanilang paraan at layunin.
    # 47.7 -> 53.0: Ipinakita nilang maraming anyo ang pakikibaka.

    def get_subtitle(t):
        if 0.0 <= t < 4.8:
            return "Hindi lahat ng pakikibaka ay nagsimula sa armas."
        elif 4.8 <= t < 7.3:
            return "Sa Kilusang Propaganda,"
        elif 7.3 <= t < 11.2:
            return "ginamit ang pagsusulat upang humiling ng pagbabago."
        elif 11.2 <= t < 16.4:
            return "Naging daluyan ng mga panawagan\nang pahayagang La Solidaridad."
        elif 16.4 <= t < 21.7:
            return "Ngunit lumakas din ang paniniwalang hindi sapat ang reporma."
        elif 21.7 <= t < 30.0:
            return "Noong 1892, itinatag ang Katipunan,\nna nagtaguyod ng paglaya mula sa Espanya."
        elif 30.0 <= t < 37.2:
            return "Noong 1896, sumiklab ang Himagsikang Pilipino."
        elif 37.2 <= t < 39.7:
            return "Kasabay ng mga ito,"
        elif 39.7 <= t < 44.7:
            return "may mga kilusang agraryo na nakatuon\nsa lupa at kabuhayan."
        elif 44.7 <= t < 47.7:
            return "Iba-iba ang kanilang paraan at layunin."
        elif 47.7 <= t < 53.0:
            return "Ipinakita nilang maraming anyo ang pakikibaka."
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
    print(f"Rendering {total_frames} frames of Scene 3...")
    gif_frames = []

    # Timeline card slots:
    # 0.0 - 4.8s: Background only (pluma at mesa still life)
    # 4.8 - 16.4s: c_lasol (La Solidaridad front page)
    # 16.4 - 21.7s: c_bonifacio (Supremo Andres Bonifacio)
    # 21.7 - 30.0s: c_kkk (Katipunan 1892 Founding Document)
    # 30.0 - 37.2s: c_flags (Flags & 1896 Revolution)
    # 37.2 - 44.7s: c_agrarian (Agrarian struggle)
    # 44.7 - 53.0s: c_anyo (Mga Anyo ng Pakikibaka summary)

    slots = [
        (4.8, 16.4, cards[0]),
        (16.4, 21.7, cards[2]),
        (21.7, 30.0, cards[1]),
        (30.0, 37.2, cards[3]),
        (37.2, 44.7, cards[5]),
        (44.7, 53.0, cards[6])
    ]

    for f_idx in range(total_frames):
        t = f_idx / FPS

        # Subtle cinematic drift
        zoom = 1.0 + (t / duration) * 0.04
        cw = WIDTH / zoom
        ch = HEIGHT / zoom
        cx = (WIDTH - cw) / 2
        cy = (HEIGHT - ch) / 2
        frame = base_bg.crop((cx, cy, cx + cw, cy + ch)).resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)

        # Cross fade to black near end
        if t >= duration - 1.5:
            f_out = min(1.0, (t - (duration - 1.5)) / 1.5)
            frame = Image.blend(frame, Image.new("RGB", (WIDTH, HEIGHT), (6, 5, 5)), f_out)

        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))

        for start_t, end_t, card_img in slots:
            if start_t <= t < end_t:
                time_in = t - start_t
                time_left = end_t - t

                # Smooth slide-up ease
                slide_p = min(1.0, time_in / 0.8)
                ease = 1.0 - (1.0 - slide_p) ** 3
                target_x = (WIDTH - card_img.width) // 2
                target_y = (HEIGHT - card_img.height) // 2 - 25
                cur_y = int(HEIGHT + (target_y - HEIGHT) * ease)

                # Fade out in last 0.4s of slot
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
    print("Scene 3 Video rendered:", OUTPUT_MP4)

    import shutil
    shutil.copyfile(OUTPUT_MP4, PUBLIC_MP4)

    if gif_frames:
        print("Saving animated GIF preview for Scene 3...")
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
    render_scene3()
