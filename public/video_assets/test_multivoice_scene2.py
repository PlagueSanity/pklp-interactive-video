import asyncio
import os
import subprocess
import edge_tts
from gtts import gTTS
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
OUT_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\video_assets"

# Character voice profiles:
# 1. Narrator (Female teacher / storyteller): Blessica
# 2. Mang Tomas (Elderly male farmer): Angelo (lower pitch, measured pace)
# 3. Aling Rosa (Worried female neighbor): Blessica (higher pitch, energetic)
# 4. Mang Pedro (Fiery male farmer): Angelo (higher energy)
# 5. Lito (Teenage boy): Blessica (pitch +8Hz, youthful boyish tone)

SCENE_2_PARTS = [
    {
        "speaker": "Narrator",
        "voice": "fil-PH-BlessicaNeural",
        "pitch": "+0Hz",
        "rate": "-2%",
        "text": "Isang umaga, habang naghahanda siyang magtungo sa bukid, dumating ang kaniyang kapitbahay na si Aling Rosa."
    },
    {
        "speaker": "Aling Rosa",
        "voice": "fil-PH-BlessicaNeural",
        "pitch": "+6Hz",
        "rate": "+6%",
        "text": "Tomas, narinig mo na ba ang balita? Tataasan na naman daw ang singil sa tubig."
    },
    {
        "speaker": "Narrator",
        "voice": "fil-PH-BlessicaNeural",
        "pitch": "+0Hz",
        "rate": "-2%",
        "text": "Napahinto si Mang Tomas."
    },
    {
        "speaker": "Mang Tomas",
        "voice": "fil-PH-AngeloNeural",
        "pitch": "-8Hz",
        "rate": "-6%",
        "text": "Kung tataas ang singil, paano naman ang mga magsasakang halos sapat lamang ang kinikita?"
    },
    {
        "speaker": "Aling Rosa",
        "voice": "fil-PH-BlessicaNeural",
        "pitch": "+6Hz",
        "rate": "+6%",
        "text": "May pagpupulong mamayang hapon. Sana makadalo ka."
    }
]

async def build_multivoice_scene2():
    part_files = []
    for idx, part in enumerate(SCENE_2_PARTS):
        out_part = os.path.join(OUT_DIR, f"temp_s2_part{idx}.mp3")
        comm = edge_tts.Communicate(part["text"], part["voice"], rate=part["rate"], pitch=part["pitch"])
        await comm.save(out_part)
        part_files.append(out_part)

    # Concat parts using ffmpeg
    list_file = os.path.join(OUT_DIR, "temp_s2_parts.txt")
    with open(list_file, "w", encoding="utf-8") as f:
        for p in part_files:
            safe_p = p.replace("\\", "/")
            f.write(f"file '{safe_p}'\n")

    final_s2 = os.path.join(OUT_DIR, "multivoice_scene2.mp3")
    cmd = [FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", list_file, "-c", "copy", final_s2]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("Multi-voice Scene 2 rendered successfully to:", final_s2)

if __name__ == "__main__":
    asyncio.run(build_multivoice_scene2())
