import asyncio
import edge_tts
import os

SCENES = [
    {
        "id": "scene1",
        "text": """Ang Tubig na Pinaghahatian. Isang maikling kuwentong pang-edukasyon.
Sa isang maliit na baryong napapaligiran ng mga palayan, ang tubig mula sa isang patubig ang bumubuhay sa mga pananim ng mga magsasaka.
Isa sa kanila si Mang Tomas. Mahigit dalawampung taon na siyang nagtatanim ng palay. Hindi marangya ang kanilang pamumuhay, ngunit sapat ang kanilang kinikita upang maitawid ang pangangailangan ng pamilya."""
    },
    {
        "id": "scene2",
        "text": """Isang umaga, habang naghahanda siyang magtungo sa bukid, dumating ang kaniyang kapitbahay na si Aling Rosa.
"Tomas, narinig mo na ba ang balita? Tataasan na naman daw ang singil sa tubig."
Napahinto si Mang Tomas.
"Kung tataas ang singil, paano naman ang mga magsasakang halos sapat lamang ang kinikita?"
"May pagpupulong mamayang hapon. Sana makadalo ka," sagot ni Aling Rosa."""
    },
    {
        "id": "scene3",
        "text": """Kinahapunan, nagtipon ang mga magsasaka sa ilalim ng malaking puno sa gitna ng baryo.
"Hindi makatarungan ang bagong singil!" sabi ni Mang Pedro. "Dapat tayong maghain ng petisyon at hilinging pag-aralan muli ang patakaran."
Sumang-ayon ang ilan.
Ngunit nagsalita si Aling Rosa.
"Paano kung hindi agad tayo pakinggan? Hindi naman maaaring tumigil ang ating mga pamilya sa pagkain habang naghihintay. Baka kailangan muna nating magtanim ng mga pananim na hindi gaanong nangangailangan ng tubig."
Nagkaroon ng mahabang talakayan. May mga gustong kumilos upang baguhin ang patakaran. May mga nais munang baguhin ang paraan ng pagsasaka upang makaraos. Tahimik lamang si Mang Tomas."""
    },
    {
        "id": "scene4",
        "text": """Nang makauwi siya, napansin ng kaniyang anak na si Lito ang kaniyang pag-aalala.
"Tay, ano pong napagdesisyunan ninyo?"
"Hindi pa kami nagkakasundo, anak. May gustong magpetisyon. May gustong magpalit ng pananim."
"Bakit hindi ninyo gawin pareho?"
Napatingin si Mang Tomas sa kaniyang anak."""
    },
    {
        "id": "scene5",
        "text": """Kinabukasan, muling nagtipon ang mga magsasaka.
Iminungkahi ni Mang Tomas na magtulungan silang maghain ng petisyon. Habang naghihintay ng tugon, maaaring pag-aralan ng mga pamilyang nangangailangan ang pansamantalang pagtatanim ng ibang pananim.
Hindi lahat ay sang-ayon. May nangangambang hindi magiging sapat ang kita mula sa ibang pananim. May ilan ding nag-aalinlangan kung pakikinggan ang kanilang petisyon.
Gayunman, nagpasya silang subukan ang dalawang paraan."""
    },
    {
        "id": "scene6",
        "text": """Lumipas ang ilang linggo.
Hindi pa nababago ang singil sa tubig. May mga magsasakang nahirapang mag-adjust sa kanilang bagong pananim, at may ilan ding nagpatuloy sa pagtatanim ng palay.
Ngunit hindi na sila nag-iisang humaharap sa suliranin. Patuloy nilang sinusubaybayan ang kanilang petisyon, nagbabahagi ng impormasyon, at nagtutulungan kung kinakailangan.
Isang hapon, habang pinagmamasdan ang kanilang bukid, muling nagtanong si Lito.
"Tay, ibig sabihin po ba, nabigo kayo dahil hindi pa nababago ang singil?"
Umiling si Mang Tomas.
"Hindi pa natin alam kung magbabago ang patakaran, anak. Pero may natutuhan tayo. Hindi pala kailangang pare-pareho ang ating gawin upang magtulungan."
Tumingin si Lito sa patubig na dumadaloy sa pagitan ng mga palayan.
Ang tubig ay patuloy na dumadaloy, ngunit ang mga magsasaka ay mayroon nang bagong paraan ng pagharap sa kanilang suliranin.
At sa pagkakataong iyon, nagsimula nilang maunawaan na ang kanilang mga problema ay hindi lamang pansarili. Ito ay suliraning maaari nilang harapin nang sama-sama.
Wakas."""
    }
]

OUTPUT_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\video_assets"
VOICE = "fil-PH-AngeloNeural"

async def generate():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for scene in SCENES:
        out_file = os.path.join(OUTPUT_DIR, f"{scene['id']}.mp3")
        print(f"Generating audio for {scene['id']}...")
        communicate = edge_tts.Communicate(scene["text"], VOICE, rate="-3%", pitch="+0Hz")
        await communicate.save(out_file)
        print(f"Saved: {out_file}")

if __name__ == "__main__":
    asyncio.run(generate())
