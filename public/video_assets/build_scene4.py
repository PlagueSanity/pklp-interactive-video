import os
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
BASE_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\video_assets"
ARCHIVAL_DIR = os.path.join(BASE_DIR, "archival")
BG_PATH = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5\tinig_scene4_1793631999197.jpg"
AUDIO_SRC = os.path.join(BASE_DIR, "ang_mga_tinig_ng_nakaraan.mp3")

OUTPUT_MP4 = os.path.join(BASE_DIR, "scene4_american_suffrage.mp4")
OUTPUT_GIF = os.path.join(BASE_DIR, "scene4_american_suffrage.gif")
PUBLIC_MP4 = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\scene4_american_suffrage.mp4"
PUBLIC_GIF = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\scene4_american_suffrage.gif"
ARTIFACT_GIF = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5\scene4_american_suffrage.gif"

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
    dimmer = Image.new("RGB", (WIDTH, HEIGHT), (16, 16, 20))
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

def build_scene4_audio():
    print("Building Scene 4 audio with natural breathing pauses...")
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

    # Master narration lines 43 through 52 (141.0s to 186.0s)
    p43 = get_slice(141.0, 143.5)  # "Sa pagdating ng mga Amerikano,"
    p44 = get_slice(143.5, 146.0)  # "lumawak ang edukasyong pampubliko."
    p45 = get_slice(146.0, 151.0)  # "Naging bahagi ng pagpapalawak nito ang mga gurong tinawag na Thomasites."
    p46 = get_slice(151.0, 155.0)  # "Mas maraming babae ang nagkaroon ng pagkakataong makapag-aral."
    p47 = get_slice(155.0, 160.0)  # "Ngunit nanatili ang patriyarkiya at ang mga hadlang sa kanilang pakikilahok."
    p48 = get_slice(160.0, 165.5)  # "Kaya may mga kababaihang nagsulong ng feminismo at pagkakapantay-pantay."
    p49 = get_slice(165.5, 171.5)  # "Ang mga sufragista ay nag-organisa at nangampanya para sa sufrahiyo, o karapatang bumoto."
    p50 = get_slice(171.5, 180.0)  # "Noong 1937, sa pamamagitan ng isang plebisito, pinagtibay ang karapatang bumoto ng kababaihang Pilipino."
    p51 = get_slice(180.0, 182.5)  # "Hindi ito basta ipinagkaloob."
    p52 = get_slice(182.5, 186.0)  # "Bunga ito ng mahabang pagkilos at sama-samang paninindigan."

    pieces = [
        # Segment 1: Thomasites & USAT Thomas
        p43, p44, p45, make_pause(1.0),
        # Segment 2: Kababaihan sa edukasyon & Patriyarkiya
        p46, p47, make_pause(0.8),
        # Segment 3: Feminismo & Sofia de Veyra
        p48, make_pause(0.6),
        # Segment 4: Sufragista & Kampanya
        p49, make_pause(1.2),
        # Segment 5: 1937 Plebisito & Pagboto ng Kababaihan
        p50, make_pause(1.2),
        # Segment 6: Sama-samang paninindigan
        p51, p52, make_pause(2.2)
    ]

    out_audio = np.concatenate(pieces)
    total_sec = len(out_audio) / SAMPLE_RATE
    print(f"Scene 4 audio assembled: {total_sec:.2f} seconds")

    temp_audio = os.path.join(BASE_DIR, "temp_scene4_audio.wav")
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

def render_scene4():
    audio_file, duration = build_scene4_audio()
    total_frames = int(duration * FPS)

    print("Loading base background & archival cards for Scene 4...")
    base_bg = load_and_fit(BG_PATH)

    # Cards preparation
    c_thomas = make_archival_card(os.path.join(ARCHIVAL_DIR, "USAT_Thomas_1920_Terst_Italy_CsOL.jpg"), target_max_w=900, target_max_h=580, label="Barkong USAT Thomas (Dinaungan ng mga Gurong Thomasites, 1901)")
    c_schoolgirls = make_archival_card(os.path.join(ARCHIVAL_DIR, "Surigaonon_schoolgirls_1901.jpg"), target_max_w=880, target_max_h=580, label="Edukasyon: Mga Unang Mag-aaral na Kababaihan (1901)")
    c_deveyra = make_archival_card(os.path.join(ARCHIVAL_DIR, "Madame_J._C._De_Veyra_158001v.jpg"), target_max_w=620, target_max_h=620, label="Sofia Reyes de Veyra (Pangulo, National Federation of Women's Clubs)")
    c_campaign = make_archival_card(os.path.join(ARCHIVAL_DIR, "card_suffrage_campaign.jpg"), target_max_w=920, target_max_h=600)
    c_signing = make_archival_card(os.path.join(ARCHIVAL_DIR, "President_Quezon_signing_the_Womens_Suffrage_Bill.jpg"), target_max_w=920, target_max_h=600, label="Abril 30, 1937: Paglagda sa Batas ng Sufrahiyo ng Kababaihan")
    c_plebiscite = make_archival_card(os.path.join(ARCHIVAL_DIR, "card_plebisito_1937.jpg"), target_max_w=920, target_max_h=600)

    cards = [
        c_thomas.rotate(-1.5, resample=Image.Resampling.BICUBIC, expand=True),
        c_schoolgirls.rotate(1.5, resample=Image.Resampling.BICUBIC, expand=True),
        c_deveyra.rotate(-1.0, resample=Image.Resampling.BICUBIC, expand=True),
        c_campaign.rotate(0.0, resample=Image.Resampling.BICUBIC, expand=True),
        c_signing.rotate(1.5, resample=Image.Resampling.BICUBIC, expand=True),
        c_plebiscite.rotate(0.0, resample=Image.Resampling.BICUBIC, expand=True)
    ]

    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 46)

    # Subtitle timeline calculated:
    # 0.0 -> 2.5: Sa pagdating ng mga Amerikano,
    # 2.5 -> 5.0: lumawak ang edukasyong pampubliko.
    # 5.0 -> 11.0: Naging bahagi ng pagpapalawak nito\nang mga gurong tinawag na Thomasites.
    # 11.0 -> 15.0: Mas maraming babae ang nagkaroon ng pagkakataong makapag-aral.
    # 15.0 -> 20.8: Ngunit nanatili ang patriyarkiya\nat ang mga hadlang sa kanilang pakikilahok.
    # 20.8 -> 26.9: Kaya may mga kababaihang nagsulong\nng feminismo at pagkakapantay-pantay.
    # 26.9 -> 34.1: Ang mga sufragista ay nag-organisa at nangampanya\npara sa sufrahiyo, o karapatang bumoto.
    # 34.1 -> 43.8: Noong 1937, sa pamamagitan ng isang plebisito,\npinagtibay ang karapatang bumoto ng kababaihang Pilipino.
    # 43.8 -> 46.3: Hindi ito basta ipinagkaloob.
    # 46.3 -> 52.0: Bunga ito ng mahabang pagkilos\nat sama-samang paninindigan.

    def get_subtitle(t):
        if 0.0 <= t < 2.5:
            return "Sa pagdating ng mga Amerikano,"
        elif 2.5 <= t < 5.0:
            return "lumawak ang edukasyong pampubliko."
        elif 5.0 <= t < 11.0:
            return "Naging bahagi ng pagpapalawak nito\nang mga gurong tinawag na Thomasites."
        elif 11.0 <= t < 15.0:
            return "Mas maraming babae ang nagkaroon\nng pagkakataong makapag-aral."
        elif 15.0 <= t < 20.8:
            return "Ngunit nanatili ang patriyarkiya\nat ang mga hadlang sa kanilang pakikilahok."
        elif 20.8 <= t < 26.9:
            return "Kaya may mga kababaihang nagsulong\nng feminismo at pagkakapantay-pantay."
        elif 26.9 <= t < 34.1:
            return "Ang mga sufragista ay nag-organisa at nangampanya\npara sa sufrahiyo, o karapatang bumoto."
        elif 34.1 <= t < 43.8:
            return "Noong 1937, sa pamamagitan ng isang plebisito,\npinagtibay ang karapatang bumoto ng kababaihang Pilipino."
        elif 43.8 <= t < 46.3:
            return "Hindi ito basta ipinagkaloob."
        elif 46.3 <= t < 52.0:
            return "Bunga ito ng mahabang pagkilos\nat sama-samang paninindigan."
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
    print(f"Rendering {total_frames} frames of Scene 4...")
    gif_frames = []

    # Slots:
    # 0.0 - 11.0s: c_thomas (USAT Thomas)
    # 11.0 - 20.8s: c_schoolgirls (Schoolgirls / Patriyarkiya)
    # 20.8 - 26.9s: c_deveyra (Sofia de Veyra / Feminismo)
    # 26.9 - 34.1s: c_campaign (Suffrage Campaign card)
    # 34.1 - 43.8s: c_signing (1937 Bill Signing)
    # 43.8 - 52.0s: c_plebiscite (1937 Plebisito Result card)

    slots = [
        (0.0, 11.0, cards[0]),
        (11.0, 20.8, cards[1]),
        (20.8, 26.9, cards[2]),
        (26.9, 34.1, cards[3]),
        (34.1, 43.8, cards[4]),
        (43.8, 52.0, cards[5])
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
    print("Scene 4 Video rendered:", OUTPUT_MP4)

    import shutil
    shutil.copyfile(OUTPUT_MP4, PUBLIC_MP4)

    if gif_frames:
        print("Saving animated GIF preview for Scene 4...")
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
    render_scene4()
