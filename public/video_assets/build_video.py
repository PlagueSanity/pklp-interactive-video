import os
import glob
import subprocess
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
BASE_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\video_assets"
BRAIN_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5"
OUTPUT_VIDEO = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\ang_tubig_na_pinaghahatian.mp4"
SAMPLE_VIDEO = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\sample.mp4"

SCENE_SUBTITLES = [
    {
        "id": "scene1",
        "title": "Eksena 1: Ang Baryo at ang Patubig",
        "excerpt": "Sa isang maliit na baryong napapaligiran ng mga palayan, ang tubig mula sa isang patubig ang bumubuhay sa mga pananim.\nIsa sa kanila si Mang Tomas na mahigit dalawampung taon nang nagtatanim ng palay."
    },
    {
        "id": "scene2",
        "title": "Eksena 2: Ang Mabigat na Balita",
        "excerpt": "Dumating si Aling Rosa: \"Tomas, tataasan na naman daw ang singil sa tubig.\"\nNapahinto si Mang Tomas: \"Kung tataas ang singil, paano naman ang mga magsasakang sapat lamang ang kinikita?\""
    },
    {
        "id": "scene3",
        "title": "Eksena 3: Ang Mainit na Pulong ng Komunidad",
        "excerpt": "\"Hindi makatarungan ang bagong singil! Maghain tayo ng petisyon!\" - Mang Pedro.\n\"Paano kung hindi tayo pakinggan agad? Magtanim muna tayo ng mga pananim na hindi gaanong nangangailangan ng tubig.\" - Aling Rosa."
    },
    {
        "id": "scene4",
        "title": "Eksena 4: Ang Payo ng Anak",
        "excerpt": "\"Tay, ano pong napagdesisyunan ninyo?\"\n\"May gustong magpetisyon. May gustong magpalit ng pananim.\"\n\"Bakit hindi ninyo gawin pareho?\" tanong ni Lito."
    },
    {
        "id": "scene5",
        "title": "Eksena 5: Ang Mungkahing Pagkakaisa",
        "excerpt": "Iminungkahi ni Mang Tomas na magtulungan silang maghain ng petisyon,\nhabang sinusubukan din ng mga pamilya ang pagtatanim ng alternatibong pananim."
    },
    {
        "id": "scene6",
        "title": "Eksena 6: Ang Aral ng Pagkakaiba at Pagkakaisa",
        "excerpt": "\"Hindi pala kailangang pare-pareho ang ating gawin upang magtulungan.\"\nNagsimula nilang maunawaan na ang kanilang mga problema ay suliraning maaari nilang harapin nang sama-sama."
    }
]

def find_latest_image(pattern):
    files = glob.glob(os.path.join(BRAIN_DIR, pattern))
    if not files:
        files = glob.glob(os.path.join(BASE_DIR, pattern))
    if files:
        files.sort(key=os.path.getmtime, reverse=True)
        return files[0]
    return None

def create_scene_frame(img_path, scene_info, output_path):
    # 1080p canvas
    width, height = 1920, 1080
    bg = Image.new("RGB", (width, height), (15, 23, 42))

    if img_path and os.path.exists(img_path):
        img = Image.open(img_path).convert("RGB")
        # Resize maintaining aspect ratio to fill 1920x1080
        img_w, img_h = img.size
        scale = max(width / img_w, height / img_h)
        new_w, new_h = int(img_w * scale), int(img_h * scale)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        # Center crop
        left = (new_w - width) // 2
        top = (new_h - height) // 2
        bg.paste(img.crop((left, top, left + width, top + height)), (0, 0))

    # Create dark gradient / banner overlay at the bottom for readability
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Top badge: Lesson topic
    draw.rounded_rectangle([40, 30, 480, 85], radius=12, fill=(15, 23, 42, 210), outline=(56, 189, 248, 200), width=2)

    # Bottom subtitle box
    box_top = height - 210
    draw.rounded_rectangle([40, box_top, width - 40, height - 30], radius=16, fill=(10, 15, 30, 220), outline=(234, 179, 8, 200), width=2)

    bg = Image.alpha_composite(bg.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(bg)

    font_badge = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 26)
    font_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 32)
    font_text = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 28)

    # Draw Badge
    draw.text((60, 42), "Baitang 11 • Tekstong Naratibo", fill=(56, 189, 248), font=font_badge)

    # Draw Scene Title
    draw.text((70, box_top + 16), scene_info["title"], fill=(250, 204, 21), font=font_title)

    # Draw Excerpt / Subtitle
    draw.text((70, box_top + 65), scene_info["excerpt"], fill=(248, 250, 252), font=font_text)

    bg.convert("RGB").save(output_path, "JPEG", quality=95)
    print(f"Generated frame: {output_path}")

def build_all():
    image_patterns = [
        "*scene1*",
        "*scene2*",
        "*scene3*",
        "*scene4*",
        "*scene5*",
        "*scene6*"
    ]

    clip_paths = []
    for i, scene in enumerate(SCENE_SUBTITLES):
        num = i + 1
        img = find_latest_image(image_patterns[i])
        print(f"Scene {num} image: {img}")

        frame_path = os.path.join(BASE_DIR, f"frame_{scene['id']}.jpg")
        create_scene_frame(img, scene, frame_path)

        audio_path = os.path.join(BASE_DIR, f"{scene['id']}.mp3")
        clip_output = os.path.join(BASE_DIR, f"clip_{scene['id']}.mp4")

        # Encode video clip with ffmpeg
        cmd = [
            FFMPEG, "-y",
            "-loop", "1", "-framerate", "30",
            "-i", frame_path,
            "-i", audio_path,
            "-c:v", "libx264", "-tune", "stillimage", "-preset", "faster",
            "-c:a", "aac", "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            "-shortest",
            "-movflags", "+faststart",
            clip_output
        ]
        print(f"Rendering clip {num}...")
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        clip_paths.append(clip_output)

    # Concat file list
    concat_txt = os.path.join(BASE_DIR, "concat_list.txt")
    with open(concat_txt, "w", encoding="utf-8") as f:
        for p in clip_paths:
            safe_p = p.replace("\\", "/")
            f.write(f"file '{safe_p}'\n")

    print("Concatenating all clips into final MP4...")
    cmd_concat = [
        FFMPEG, "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_txt,
        "-c", "copy",
        "-movflags", "+faststart",
        OUTPUT_VIDEO
    ]
    subprocess.run(cmd_concat, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"SUCCESS! Video written to: {OUTPUT_VIDEO}")

    # Copy to sample.mp4 as well
    if os.path.exists(OUTPUT_VIDEO):
        import shutil
        shutil.copyfile(OUTPUT_VIDEO, SAMPLE_VIDEO)
        print(f"Copied to: {SAMPLE_VIDEO}")

if __name__ == "__main__":
    build_all()
