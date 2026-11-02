import asyncio
import os
import subprocess
import edge_tts
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
OUT_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\video_assets"

# Speaker definitions
SPEAKERS = {
    "Narrator": { "voice": "fil-PH-BlessicaNeural", "pitch": "+0Hz", "rate": "-2%" },
    "Tomas":    { "voice": "fil-PH-AngeloNeural",   "pitch": "-8Hz", "rate": "-6%" },
    "Rosa":     { "voice": "fil-PH-BlessicaNeural", "pitch": "+5Hz", "rate": "+5%" },
    "Pedro":    { "voice": "fil-PH-AngeloNeural",   "pitch": "+3Hz", "rate": "+7%" },
    "Lito":     { "voice": "fil-PH-BlessicaNeural", "pitch": "+9Hz", "rate": "+4%" }
}

ALL_SCENES = [
    {
        "id": "scene1",
        "dialogue": [
            ("Narrator", "Ang Tubig na Pinaghahatian. Isang maikling kuwentong pang-edukasyon."),
            ("Narrator", "Sa isang maliit na baryong napapaligiran ng mga palayan, ang tubig mula sa isang patubig ang bumubuhay sa mga pananim ng mga magsasaka."),
            ("Narrator", "Isa sa kanila si Mang Tomas. Mahigit dalawampung taon na siyang nagtatanim ng palay. Hindi marangya ang kanilang pamumuhay, ngunit sapat ang kanilang kinikita upang maitawid ang pangangailangan ng pamilya.")
        ]
    },
    {
        "id": "scene2",
        "dialogue": [
            ("Narrator", "Isang umaga, habang naghahanda siyang magtungo sa bukid, dumating ang kaniyang kapitbahay na si Aling Rosa."),
            ("Rosa", "Tomas, narinig mo na ba ang balita? Tataasan na naman daw ang singil sa tubig."),
            ("Narrator", "Napahinto si Mang Tomas."),
            ("Tomas", "Kung tataas ang singil, paano naman ang mga magsasakang halos sapat lamang ang kinikita?"),
            ("Rosa", "May pagpupulong mamayang hapon. Sana makadalo ka.")
        ]
    },
    {
        "id": "scene3",
        "dialogue": [
            ("Narrator", "Kinahapunan, nagtipon ang mga magsasaka sa ilalim ng malaking puno sa gitna ng baryo."),
            ("Pedro", "Hindi makatarungan ang bagong singil! Dapat tayong maghain ng petisyon at hilinging pag-aralan muli ang patakaran!"),
            ("Narrator", "Sumang-ayon ang ilan. Ngunit nagsalita si Aling Rosa."),
            ("Rosa", "Paano kung hindi agad tayo pakinggan? Hindi naman maaaring tumigil ang ating mga pamilya sa pagkain habang naghihintay. Baka kailangan muna nating magtanim ng mga pananim na hindi gaanong nangangailangan ng tubig."),
            ("Narrator", "Nagkaroon ng mahabang talakayan. May mga gustong kumilos upang baguhin ang patakaran. May mga nais munang baguhin ang paraan ng pagsasaka upang makaraos. Tahimik lamang si Mang Tomas.")
        ]
    },
    {
        "id": "scene4",
        "dialogue": [
            ("Narrator", "Nang makauwi siya, napansin ng kaniyang anak na si Lito ang kaniyang pag-aalala."),
            ("Lito", "Tay, ano pong napagdesisyunan ninyo?"),
            ("Tomas", "Hindi pa kami nagkakasundo, anak. May gustong magpetisyon. May gustong magpalit ng pananim."),
            ("Lito", "Bakit hindi ninyo gawin pareho?"),
            ("Narrator", "Napatingin si Mang Tomas sa kaniyang anak.")
        ]
    },
    {
        "id": "scene5",
        "dialogue": [
            ("Narrator", "Kinabukasan, muling nagtipon ang mga magsasaka."),
            ("Narrator", "Iminungkahi ni Mang Tomas na magtulungan silang maghain ng petisyon. Habang naghihintay ng tugon, maaaring pag-aralan ng mga pamilyang nangangailangan ang pansamantalang pagtatanim ng ibang pananim."),
            ("Narrator", "Hindi lahat ay sang-ayon. May nangangambang hindi magiging sapat ang kita mula sa ibang pananim. May ilan ding nag-aalinlangan kung pakikinggan ang kanilang petisyon. Gayunman, nagpasya silang subukan ang dalawang paraan.")
        ]
    },
    {
        "id": "scene6",
        "dialogue": [
            ("Narrator", "Lumipas ang ilang linggo. Hindi pa nababago ang singil sa tubig. May mga magsasakang nahirapang mag-adjust sa kanilang bagong pananim, at may ilan ding nagpatuloy sa pagtatanim ng palay."),
            ("Narrator", "Ngunit hindi na sila nag-iisang humaharap sa suliranin. Patuloy nilang sinusubaybayan ang kanilang petisyon, nagbabahagi ng impormasyon, at nagtutulungan kung kinakailangan."),
            ("Narrator", "Isang hapon, habang pinagmamasdan ang kanilang bukid, muling nagtanong si Lito."),
            ("Lito", "Tay, ibig sabihin po ba, nabigo kayo dahil hindi pa nababago ang singil?"),
            ("Narrator", "Umiling si Mang Tomas."),
            ("Tomas", "Hindi pa natin alam kung magbabago ang patakaran, anak. Pero may natutuhan tayo. Hindi pala kailangang pare-pareho ang ating gawin upang magtulungan."),
            ("Narrator", "Tumingin si Lito sa patubig na dumadaloy sa pagitan ng mga palayan. Ang tubig ay patuloy na dumadaloy, ngunit ang mga magsasaka ay mayroon nang bagong paraan ng pagharap sa kanilang suliranin."),
            ("Narrator", "At sa pagkakataong iyon, nagsimula nilang maunawaan na ang kanilang mga problema ay hindi lamang pansarili. Ito ay suliraning maaari nilang harapin nang sama-sama. Wakas.")
        ]
    }
]

async def build_all_multivoice():
    for scene in ALL_SCENES:
        scene_id = scene["id"]
        print(f"Building multi-voice audio for {scene_id}...")
        part_files = []
        for i, (speaker, text) in enumerate(scene["dialogue"]):
            cfg = SPEAKERS[speaker]
            part_path = os.path.join(OUT_DIR, f"temp_{scene_id}_{i}.mp3")
            comm = edge_tts.Communicate(text, cfg["voice"], pitch=cfg["pitch"], rate=cfg["rate"])
            await comm.save(part_path)
            part_files.append(part_path)

        list_file = os.path.join(OUT_DIR, f"list_{scene_id}.txt")
        with open(list_file, "w", encoding="utf-8") as f:
            for p in part_files:
                safe = p.replace("\\", "/")
                f.write(f"file '{safe}'\n")

        scene_out = os.path.join(OUT_DIR, f"{scene_id}.mp3")
        cmd = [FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", list_file, "-c", "copy", scene_out]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"Completed {scene_id}.mp3 with multiple character voices!")

if __name__ == "__main__":
    asyncio.run(build_all_multivoice())
