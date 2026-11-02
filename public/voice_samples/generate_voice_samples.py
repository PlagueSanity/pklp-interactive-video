import asyncio
import os
import edge_tts
from gtts import gTTS

SAMPLE_TEXT = "Sa isang maliit na baryong napapaligiran ng mga palayan, ang tubig mula sa isang patubig ang bumubuhay sa mga pananim ng mga magsasaka. Isa sa kanila si Mang Tomas."
OUT_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\voice_samples"
os.makedirs(OUT_DIR, exist_ok=True)

async def make_samples():
    # 1. Blessica (Female Filipino - warm educational voice)
    print("Generating Sample 1: Blessica...")
    c1 = edge_tts.Communicate(SAMPLE_TEXT, "fil-PH-BlessicaNeural", rate="+0%", pitch="+0Hz")
    await c1.save(os.path.join(OUT_DIR, "1_blessica_female_filipino.mp3"))

    # 2. Google Tagalog (Classic Google TTS Philippine voice)
    print("Generating Sample 2: Google Tagalog...")
    tts = gTTS(text=SAMPLE_TEXT, lang='tl', slow=False)
    tts.save(os.path.join(OUT_DIR, "2_google_tagalog.mp3"))

    # 3. Angelo (Male Filipino - conversational rate)
    print("Generating Sample 3: Angelo Conversational...")
    c3 = edge_tts.Communicate(SAMPLE_TEXT, "fil-PH-AngeloNeural", rate="+5%", pitch="-2Hz")
    await c3.save(os.path.join(OUT_DIR, "3_angelo_male_conversational.mp3"))

    # 4. Rosa (Philippine English/Taglish Female)
    print("Generating Sample 4: Rosa...")
    c4 = edge_tts.Communicate(SAMPLE_TEXT, "en-PH-RosaNeural", rate="+0%", pitch="+0Hz")
    await c4.save(os.path.join(OUT_DIR, "4_rosa_philippines.mp3"))

    print("All voice samples generated successfully in:", OUT_DIR)

if __name__ == "__main__":
    asyncio.run(make_samples())
