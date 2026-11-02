import os
import glob
import subprocess
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
BASE_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\video_assets"
BRAIN_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\brain\6b7c2bd5-e4be-4149-be90-eb2d751ed2c5"
AUDIO_FILE = os.path.join(BASE_DIR, "ang_mga_tinig_ng_nakaraan.mp3")
OUTPUT_VIDEO = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\ang_mga_tinig_ng_nakaraan.mp4"

SCENE_METADATA = [
    {
        "id": "tinig_scene1",
        "duration": 48.0,
        "title": "Eksena 1: Ang Misteryosong Lumang Kahon",
        "era": "Panimula • Dalawang Mukha ng Pagkilos",
        "terms": "Pakikibaka • Pakikiangkop • Reporma • Rebolusyon • Kamalayan • Petisyon",
        "excerpt": "\"Sa isang lumang tahanan sa probinsya, may natagpuang kahong matagal nang hindi nabubuksan...\nUnti-unting nabuo ang kamalayan na ang suliranin ng isa ay maaaring suliranin ng marami.\"",
        "motion": "zoom_in"
    },
    {
        "id": "tinig_scene2",
        "duration": 48.0,
        "title": "Eksena 2: Panahon ng Pananakop ng Espanya",
        "era": "Kolonyalismong Espanyol • Sistemang Agraryo",
        "terms": "Tributo • Polo y servicios • Encomienda • Asyenda • Principalia",
        "excerpt": "\"Maraming Pilipino ang naharap sa mabibigat na obligasyon: tributo at polo y servicios...\nNaging mahalagang usapin ang lupa, kabuhayan, at karapatang magkaroon ng boses.\"",
        "motion": "pan_right"
    },
    {
        "id": "tinig_scene3",
        "duration": 44.0,
        "title": "Eksena 3: Kilusang Propaganda at Himagsikan",
        "era": "Paghingi ng Reporma tungo sa Sandatahang Paglaya",
        "terms": "Kilusang Propaganda • La Solidaridad • Katipunan (KKK) • Himagsikan 1896",
        "excerpt": "\"Hindi lahat ng pakikibaka ay nagsimula sa armas. Sa Kilusang Propaganda, ginamit ang pagsusulat...\nNoong 1892 itinatag ang Katipunan, at noong 1896 sumiklab ang Himagsikang Pilipino.\"",
        "motion": "zoom_dramatic"
    },
    {
        "id": "tinig_scene4",
        "duration": 46.0,
        "title": "Eksena 4: Panahong Amerikano at Kilusang Sufragista",
        "era": "Edukasyong Pampubliko at Karapatan ng Kababaihan",
        "terms": "Thomasites • Patriyarkiya • Feminismo • Sufragista • Plebisito 1937",
        "excerpt": "\"Lumawak ang edukasyon sa pamamagitan ng Thomasites, ngunit nanatili ang patriyarkiya...\nNagsulong ang mga sufragista at pinagtibay sa Plebisito 1937 ang karapatang bumoto ng kababaihan.\"",
        "motion": "zoom_in"
    },
    {
        "id": "tinig_scene5",
        "duration": 41.0,
        "title": "Eksena 5: Okupasyong Hapones at Kilusang Gerilya",
        "era": "Ikalawang Digmaang Pandaigdig • Soberanya at Sandatahang Pagtutol",
        "terms": "Okupasyon • Sensura • Kilusang Gerilya • HUKBALAHAP • Hunters-ROTC • Soberanya",
        "excerpt": "\"Digmaan ng takot, sensura, at kakulangan sa pagkain... Lumaban ang Hukbalahap at Hunters-ROTC...\nMuling naging mahalagang tanong: Sino ang tunay na may kapangyarihang magpasya para sa bayan?\"",
        "motion": "pan_left"
    },
    {
        "id": "tinig_scene6",
        "duration": 42.32,
        "title": "Eksena 6: Pagninilay at Pananagutang Sibiko",
        "era": "Kasalukuyang Panahon • Pagsusuri at Kamalayang Pilipino",
        "terms": "Kamalayang Pilipino • Kasaysayan • Pananagutang Sibiko • Edukasyon • Kalayaan",
        "excerpt": "\"Muling nagsara ang lumang kahon... Ang pakikibaka ay hindi lamang paglaban; ang pakikiangkop ay hindi pagsuko.\nPaano natin gagamitin ang ating kalayaan at edukasyon upang maging responsable sa lipunan?\"",
        "motion": "tilt_up"
    }
]

def find_image(scene_id):
    pattern = f"*{scene_id}*"
    files = glob.glob(os.path.join(BRAIN_DIR, pattern))
    if not files:
        files = glob.glob(os.path.join(BASE_DIR, pattern))
    if files:
        files.sort(key=os.path.getmtime, reverse=True)
        return files[0]
    return None

def create_comic_frame(img_path, scene_info, output_path):
    width, height = 1920, 1080
    bg = Image.new("RGB", (width, height), (15, 23, 42))

    if img_path and os.path.exists(img_path):
        img = Image.open(img_path).convert("RGB")
        img_w, img_h = img.size
        scale = max(width / img_w, height / img_h)
        new_w, new_h = int(img_w * scale), int(img_h * scale)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        left = (new_w - width) // 2
        top = (new_h - height) // 2
        bg.paste(img.crop((left, top, left + width, top + height)), (0, 0))

    # Comic border overlay & vignette
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Clean outer graphic novel border
    draw.rectangle([16, 16, width - 16, height - 16], outline=(15, 23, 42, 230), width=10)

    # Top-Left Comic Chapter Badge
    draw.rounded_rectangle([36, 32, 600, 92], radius=10, fill=(15, 23, 42, 225), outline=(56, 189, 248, 220), width=2)

    # Bottom Comic Dialogue / Caption Box
    box_top = height - 230
    draw.rounded_rectangle([36, box_top, width - 36, height - 32], radius=14, fill=(10, 15, 30, 230), outline=(250, 204, 21, 220), width=2)

    bg = Image.alpha_composite(bg.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(bg)

    font_badge = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 24)
    font_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 30)
    font_terms = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 22)
    font_text = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 26)

    # Draw Top Badge
    draw.text((54, 46), f"Baitang 11 • {scene_info['era']}", fill=(56, 189, 248), font=font_badge)

    # Draw Title inside bottom box
    draw.text((60, box_top + 16), scene_info["title"], fill=(250, 204, 21), font=font_title)

    # Draw Glossary Terms Tagline
    draw.text((60, box_top + 60), f"Mga Termino: {scene_info['terms']}", fill=(147, 197, 253), font=font_terms)

    # Draw Narrative Excerpt
    draw.text((60, box_top + 98), scene_info["excerpt"], fill=(248, 250, 252), font=font_text)

    bg.convert("RGB").save(output_path, "JPEG", quality=95)
    print(f"Created comic frame: {output_path}")

def render_moving_clip(frame_path, duration, motion_type, output_clip):
    fps = 30
    total_frames = int(duration * fps)

    # Define camera motion filters (Ken Burns Pan / Zoom)
    if motion_type == "zoom_in":
        vf = f"scale=2160x1215,zoompan=z='min(zoom+0.0003,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={total_frames}:s=1920x1080:fps={fps}"
    elif motion_type == "pan_right":
        vf = f"scale=2304x1296,zoompan=z=1.1:x='if(lte(on,-1),0,min(x+0.5,iw-iw/zoom))':y='ih/2-(ih/zoom/2)':d={total_frames}:s=1920x1080:fps={fps}"
    elif motion_type == "zoom_dramatic":
        vf = f"scale=2160x1215,zoompan=z='min(zoom+0.0005,1.15)':x='iw*0.6-(iw/zoom*0.6)':y='ih/2-(ih/zoom/2)':d={total_frames}:s=1920x1080:fps={fps}"
    elif motion_type == "pan_left":
        vf = f"scale=2304x1296,zoompan=z=1.1:x='if(lte(on,-1),(iw-iw/zoom),max(0,x-0.5))':y='ih/2-(ih/zoom/2)':d={total_frames}:s=1920x1080:fps={fps}"
    elif motion_type == "tilt_up":
        vf = f"scale=2160x1215,zoompan=z='min(zoom+0.0003,1.1)':x='iw/2-(iw/zoom/2)':y='if(lte(on,-1),(ih-ih/zoom),max(0,y-0.3))':d={total_frames}:s=1920x1080:fps={fps}"
    else:
        vf = f"scale=2160x1215,zoompan=z='min(zoom+0.0003,1.1)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={total_frames}:s=1920x1080:fps={fps}"

    cmd = [
        FFMPEG, "-y",
        "-loop", "1",
        "-i", frame_path,
        "-vf", vf,
        "-c:v", "libx264",
        "-preset", "faster",
        "-pix_fmt", "yuv420p",
        "-t", f"{duration:.2f}",
        output_clip
    ]
    print(f"Rendering motion clip ({duration:.1f}s, {motion_type})...")
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Motion clip rendered: {output_clip}")

def build_full_motion_comic():
    clips = []
    for idx, scene in enumerate(SCENE_METADATA):
        num = idx + 1
        img_path = find_image(scene["id"])
        print(f"Scene {num} image: {img_path}")

        frame_path = os.path.join(BASE_DIR, f"frame_{scene['id']}.jpg")
        create_comic_frame(img_path, scene, frame_path)

        clip_output = os.path.join(BASE_DIR, f"clip_motion_{scene['id']}.mp4")
        render_moving_clip(frame_path, scene["duration"], scene["motion"], clip_output)
        clips.append(clip_output)

    # Concat clips using concat demuxer
    concat_txt = os.path.join(BASE_DIR, "motion_concat_list.txt")
    with open(concat_txt, "w", encoding="utf-8") as f:
        for c in clips:
            safe = c.replace("\\", "/")
            f.write(f"file '{safe}'\n")

    temp_video = os.path.join(BASE_DIR, "temp_video_no_audio.mp4")
    cmd_concat = [
        FFMPEG, "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_txt,
        "-c", "copy",
        temp_video
    ]
    print("Stitching all moving scenes together...")
    subprocess.run(cmd_concat, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Attach master audio track
    print("Muxing master audio track and optimizing MP4...")
    cmd_mux = [
        FFMPEG, "-y",
        "-i", temp_video,
        "-i", AUDIO_FILE,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        OUTPUT_VIDEO
    ]
    subprocess.run(cmd_mux, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"FINISHED! Motion Comic Video created at:\n{OUTPUT_VIDEO}")

if __name__ == "__main__":
    build_full_motion_comic()
