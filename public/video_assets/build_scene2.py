import os
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
BASE_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\video_assets"
ARCHIVAL_DIR = os.path.join(BASE_DIR, "archival")
BG_PATH = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5\tinig_scene2_1793631950114.jpg"
AUDIO_SRC = os.path.join(BASE_DIR, "ang_mga_tinig_ng_nakaraan.mp3")

OUTPUT_MP4 = os.path.join(BASE_DIR, "scene2_spanish_era.mp4")
OUTPUT_GIF = os.path.join(BASE_DIR, "scene2_spanish_era.gif")
PUBLIC_MP4 = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\scene2_spanish_era.mp4"
PUBLIC_GIF = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\scene2_spanish_era.gif"
ARTIFACT_GIF = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5\scene2_spanish_era.gif"

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
    # Dim background slightly with vignette for archival card focus
    dimmer = Image.new("RGB", (WIDTH, HEIGHT), (20, 16, 12))
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

def build_scene2_audio():
    print("Building Scene 2 audio with natural breathing pauses...")
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

    # Master narration lines 9 through 31 (25.0s to 97.0s)
    p9 = get_slice(25.0, 27.5)   # "Ang ilan ay lumaban,"
    p10 = get_slice(27.5, 30.5)  # "ang iba ay nagbago ng paraan upang makaraos."
    p11 = get_slice(30.5, 33.0)  # "May humiling ng reporma,"
    p12 = get_slice(33.0, 35.5)  # "may sumali sa rebolusyon,"
    p13 = get_slice(35.5, 37.5)  # "at may naghain ng petisyon."
    p14 = get_slice(37.5, 40.0)  # "Magkakaiba ang kanilang mga pagpili,"
    p15 = get_slice(40.0, 42.0)  # "ngunit sa kanilang mga karanasan,"
    p16 = get_slice(42.0, 45.0)  # "unti-unting nabuo ang kamalayan"
    p17 = get_slice(45.0, 48.0)  # "na ang suliranin ng isa ay maaaring suliranin ng marami."
    p18 = get_slice(48.0, 51.5)  # "Sa panahon ng pananakop ng Espanya,"
    p19 = get_slice(51.5, 54.5)  # "maraming Pilipino ang naharap sa mabibigat na obligasyon."
    p20 = get_slice(54.5, 57.5)  # "May tributo na kailangang bayaran,"
    p21 = get_slice(57.5, 63.0)  # "at polo y servicios na nag-aatas..."
    p22 = get_slice(63.0, 66.0)  # "Sa mga unang yugto ng kolonyalismo,"
    p23 = get_slice(66.0, 72.0)  # "ang sistemang encomienda ay nagbigay..."
    p24 = get_slice(72.0, 74.0)  # "Sa ilang lugar,"
    p25 = get_slice(74.0, 76.5)  # "lumawak ang mga asyenda,"
    p26 = get_slice(76.5, 80.0)  # "habang ang mga magsasaka ay nakaranas ng mga alitan sa lupa."
    p27 = get_slice(80.0, 82.0)  # "Samantala,"
    p28 = get_slice(82.0, 86.5)  # "may mga kasapi ng principalia..."
    p29 = get_slice(86.5, 89.0)  # "Hindi pare-pareho ang karanasan ng lahat,"
    p30 = get_slice(89.0, 92.0)  # "ngunit para sa maraming mamamayan,"
    p31 = get_slice(92.0, 97.0)  # "naging mahalagang usapin ang lupa, kabuhayan..."

    # Assembled pieces with natural pauses:
    pieces = [
        # Segment 1: Ang ilan ay lumaban (Card 1 Katipunan)
        p9, make_pause(0.5),
        # Segment 2: Ang iba ay nagbago ng paraan (Card 2 Plowing fields)
        p10, make_pause(0.6),
        # Segment 3: May humiling ng reporma (Card 3 La Solidaridad)
        p11, make_pause(0.4),
        # Segment 4: May sumali sa rebolusyon (Card 4 Bonifacio)
        p12, make_pause(0.4),
        # Segment 5: At may naghain ng petisyon (Card 5 Rizal Execution)
        p13, make_pause(1.2),
        # Segment 6: Magkakaiba... unti-unting nabuo ang kamalayan (Card 6 Kamalayan)
        p14, p15, p16, p17, make_pause(1.5),
        # Segment 7: Panahon ng Espanya... obligasyon
        p18, p19, make_pause(0.8),
        # Segment 8: Tributo (Card 7A) at Polo y Servicios (Card 7B)
        p20, make_pause(0.5),
        p21, make_pause(1.4),
        # Segment 9: Encomienda (Card 8)
        p22, p23, make_pause(1.2),
        # Segment 10: Asyenda at Principalia (Card 9)
        p24, p25, p26, p27, p28, make_pause(1.2),
        # Segment 11: Lupa, kabuhayan, boses (Card 10 Shouting Justice)
        p29, p30, p31, make_pause(2.0)
    ]

    out_audio = np.concatenate(pieces)
    total_sec = len(out_audio) / SAMPLE_RATE
    print(f"Scene 2 audio assembled: {total_sec:.2f} seconds")

    temp_audio = os.path.join(BASE_DIR, "temp_scene2_audio.wav")
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

def render_scene2():
    audio_file, duration = build_scene2_audio()
    total_frames = int(duration * FPS)

    print("Loading base background & archival cards for Scene 2...")
    base_bg = load_and_fit(BG_PATH)

    # Cards preparation
    c1 = make_archival_card(os.path.join(ARCHIVAL_DIR, "Flags_of_the_Philippine_Revolution.jpg"), target_max_w=850, target_max_h=580, label="Rebolusyon: Mga Bandila ng Katipunan")
    c2 = make_archival_card(os.path.join(ARCHIVAL_DIR, "Plowing_land_for_cane_planting_on_Hacienda_Luisita,_Central_Tarlac,_P.I.jpg"), target_max_w=880, target_max_h=580, label="Pagsasaka: Pagbubungkal ng Lupa sa Gitnang Luzon")
    c3 = make_archival_card(os.path.join(ARCHIVAL_DIR, "La-solidaridad1.jpg"), target_max_w=640, target_max_h=620, label="Reporma: Pahayagang La Solidaridad (1889)")
    c4 = make_archival_card(os.path.join(ARCHIVAL_DIR, "Andres_Bonifacio_photo_(cropped).jpg"), target_max_w=640, target_max_h=620, label="Rebolusyon: Andres Bonifacio (Supremo)")
    c5 = make_archival_card(os.path.join(ARCHIVAL_DIR, "Fusilamiento_de_rizal.jpg"), target_max_w=920, target_max_h=600, label="Pagbaril kay Dr. Jose Rizal sa Bagumbayan (1896)")
    c6 = make_archival_card(os.path.join(ARCHIVAL_DIR, "card_kamalayan_suliranin.jpg"), target_max_w=920, target_max_h=600)
    c7a = make_archival_card(os.path.join(ARCHIVAL_DIR, "card_tributo_cedula.jpg"), target_max_w=920, target_max_h=600)
    c7b = make_archival_card(os.path.join(ARCHIVAL_DIR, "Imus_Bridge_of_Isabel_II.jpg"), target_max_w=880, target_max_h=580, label="Polo y Servicios: Puente de Isabel II (Sapilitang Paggawa)")
    c8 = make_archival_card(os.path.join(ARCHIVAL_DIR, "card_encomienda_grant.jpg"), target_max_w=920, target_max_h=600)
    c9 = make_archival_card(os.path.join(ARCHIVAL_DIR, "Factory_laborers_quarters_at_Tarlac,_with_cane_areas_of_Hacienda_Luisita_in_background.jpg"), target_max_w=900, target_max_h=590, label="Asyenda: Pamayanan at Pabrika ng Manggagawa sa Tubuhan")
    c10 = make_archival_card(os.path.join(ARCHIVAL_DIR, "card_filipinos_shouting_justice.jpg"), target_max_w=920, target_max_h=600)

    # Rotations for natural archival feel
    cards = [
        (c1.rotate(-2.5, resample=Image.Resampling.BICUBIC, expand=True)),
        (c2.rotate(2.0, resample=Image.Resampling.BICUBIC, expand=True)),
        (c3.rotate(-1.5, resample=Image.Resampling.BICUBIC, expand=True)),
        (c4.rotate(1.5, resample=Image.Resampling.BICUBIC, expand=True)),
        (c5.rotate(-2.0, resample=Image.Resampling.BICUBIC, expand=True)),
        (c6.rotate(0.0, resample=Image.Resampling.BICUBIC, expand=True)),
        (c7a.rotate(1.5, resample=Image.Resampling.BICUBIC, expand=True)),
        (c7b.rotate(-2.0, resample=Image.Resampling.BICUBIC, expand=True)),
        (c8.rotate(1.0, resample=Image.Resampling.BICUBIC, expand=True)),
        (c9.rotate(-1.5, resample=Image.Resampling.BICUBIC, expand=True)),
        (c10.rotate(0.0, resample=Image.Resampling.BICUBIC, expand=True)),
    ]

    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 46)

    # Subtitle timeline calculated from concatenated audio pieces:
    # 0.0 -> 3.0: Ang ilan ay lumaban,
    # 3.0 -> 6.6: ang iba ay nagbago ng paraan upang makaraos.
    # 6.6 -> 9.5: May humiling ng reporma,
    # 9.5 -> 12.4: may sumali sa rebolusyon,
    # 12.4 -> 15.6: at may naghain ng petisyon.
    # 15.6 -> 18.1: Magkakaiba ang kanilang mga pagpili,
    # 18.1 -> 20.1: ngunit sa kanilang mga karanasan,
    # 20.1 -> 23.1: unti-unting nabuo ang kamalayan
    # 23.1 -> 27.6: na ang suliranin ng isa ay maaaring suliranin ng marami.
    # 27.6 -> 31.1: Sa panahon ng pananakop ng Espanya,
    # 31.1 -> 34.9: maraming Pilipino ang naharap sa mabibigat na obligasyon.
    # 34.9 -> 38.4: May tributo na kailangang bayaran,
    # 38.4 -> 45.3: at polo y servicios na nag-aatas ng sapilitang paggawa\nsa ilalim ng mga umiiral na tuntunin noon.
    # 45.3 -> 48.3: Sa mga unang yugto ng kolonyalismo,
    # 48.3 -> 55.5: ang sistemang encomienda ay nagbigay ng karapatan\nsa mga encomendero na mangolekta ng tributo.
    # 55.5 -> 57.5: Sa ilang lugar,
    # 57.5 -> 60.0: lumawak ang mga asyenda,
    # 60.0 -> 63.5: habang ang mga magsasaka ay nakaranas ng mga alitan sa lupa.
    # 63.5 -> 65.5: Samantala,
    # 65.5 -> 71.2: may mga kasapi ng principalia na nagkaroon ng impluwensiya\nsa lokal na pamamahala.
    # 71.2 -> 73.7: Hindi pare-pareho ang karanasan ng lahat,
    # 73.7 -> 76.7: ngunit para sa maraming mamamayan,
    # 76.7 -> 83.7: naging mahalagang usapin ang lupa, kabuhayan,\nat karapatang magkaroon ng boses.

    def get_subtitle(t):
        if 0.0 <= t < 3.0:
            return "Ang ilan ay lumaban,"
        elif 3.0 <= t < 6.6:
            return "ang iba ay nagbago ng paraan upang makaraos."
        elif 6.6 <= t < 9.5:
            return "May humiling ng reporma,"
        elif 9.5 <= t < 12.4:
            return "may sumali sa rebolusyon,"
        elif 12.4 <= t < 15.6:
            return "at may naghain ng petisyon."
        elif 15.6 <= t < 18.1:
            return "Magkakaiba ang kanilang mga pagpili,"
        elif 18.1 <= t < 20.1:
            return "ngunit sa kanilang mga karanasan,"
        elif 20.1 <= t < 23.1:
            return "unti-unting nabuo ang kamalayan"
        elif 23.1 <= t < 27.6:
            return "na ang suliranin ng isa ay maaaring\nsuliranin ng marami."
        elif 27.6 <= t < 31.1:
            return "Sa panahon ng pananakop ng Espanya,"
        elif 31.1 <= t < 34.9:
            return "maraming Pilipino ang naharap sa mabibigat na obligasyon."
        elif 34.9 <= t < 38.4:
            return "May tributo na kailangang bayaran,"
        elif 38.4 <= t < 45.3:
            return "at polo y servicios na nag-aatas ng sapilitang paggawa\nsa ilalim ng mga umiiral na tuntunin noon."
        elif 45.3 <= t < 48.3:
            return "Sa mga unang yugto ng kolonyalismo,"
        elif 48.3 <= t < 55.5:
            return "ang sistemang encomienda ay nagbigay ng karapatan\nsa mga encomendero na mangolekta ng tributo."
        elif 55.5 <= t < 60.0:
            return "Sa ilang lugar, lumawak ang mga asyenda,"
        elif 60.0 <= t < 63.5:
            return "habang ang mga magsasaka ay nakaranas\nng mga alitan sa lupa."
        elif 63.5 <= t < 71.2:
            return "Samantala, may mga kasapi ng principalia na nagkaroon\nng impluwensiya sa lokal na pamamahala."
        elif 71.2 <= t < 76.7:
            return "Hindi pare-pareho ang karanasan ng lahat,\nngunit para sa maraming mamamayan,"
        elif 76.7 <= t < 83.7:
            return "naging mahalagang usapin ang lupa, kabuhayan,\nat karapatang magkaroon ng boses."
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
    print(f"Rendering {total_frames} frames of Scene 2...")
    gif_frames = []

    # Timeline card assignments:
    # c1: 0.0 - 3.0s
    # c2: 3.0 - 6.6s
    # c3: 6.6 - 9.5s
    # c4: 9.5 - 12.4s
    # c5: 12.4 - 15.6s
    # c6: 15.6 - 27.6s
    # c7a (Tributo): 34.5 - 38.4s
    # c7b (Polo): 38.4 - 45.3s
    # c8 (Encomienda): 45.3 - 55.5s
    # c9 (Asyenda/Principalia): 55.5 - 71.2s
    # c10 (Shouting Justice): 71.2 - 83.7s

    slots = [
        (0.0, 3.0, cards[0]),
        (3.0, 6.6, cards[1]),
        (6.6, 9.5, cards[2]),
        (9.5, 12.4, cards[3]),
        (12.4, 15.6, cards[4]),
        (15.6, 27.6, cards[5]),
        (34.5, 38.4, cards[6]),
        (38.4, 45.3, cards[7]),
        (45.3, 55.5, cards[8]),
        (55.5, 71.2, cards[9]),
        (71.2, 83.7, cards[10])
    ]

    for f_idx in range(total_frames):
        t = f_idx / FPS

        # Subtle camera drift on background
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

        # Check which card is active in current slot
        for start_t, end_t, card_img in slots:
            if start_t <= t < end_t:
                slot_dur = end_t - start_t
                time_in = t - start_t
                time_left = end_t - t

                # Slide up from bottom
                slide_p = min(1.0, time_in / 0.8)
                ease = 1.0 - (1.0 - slide_p) ** 3
                target_x = (WIDTH - card_img.width) // 2
                target_y = (HEIGHT - card_img.height) // 2 - 25
                cur_y = int(HEIGHT + (target_y - HEIGHT) * ease)

                # Fade out slightly in the last 0.4s of slot
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

        # Collect preview frames for GIF (every 7th frame = ~4.3 fps)
        if f_idx % 7 == 0:
            gif_frames.append(frame.resize((540, 304), Image.Resampling.BILINEAR))

    proc.stdin.close()
    proc.wait()
    print("Scene 2 Video rendered:", OUTPUT_MP4)

    import shutil
    shutil.copyfile(OUTPUT_MP4, PUBLIC_MP4)

    if gif_frames:
        print("Saving animated GIF preview for Scene 2...")
        gif_frames[0].save(
            OUTPUT_GIF,
            save_all=True,
            append_images=gif_frames[1:],
            duration=230,
            loop=0,
            optimize=True
        )
        shutil.copyfile(OUTPUT_GIF, PUBLIC_GIF)
        shutil.copyfile(OUTPUT_GIF, ARTIFACT_GIF)
        print("GIF preview saved:", OUTPUT_GIF)

if __name__ == "__main__":
    render_scene2()
