# PKLP Interactive Video Platform (Grade 11)

Isang magaan at mabilis na interactive video learning web application na dinisenyo para sa Grade 11 **Pagbasa at Pagsusuri ng Iba't Ibang Teksto Tungo sa Pananaliksik (PKLP)**.

---

## 📌 Mga Tampok (Features)

1. **Mag-aaral (Student Interface - Mobile First):**
   - Mabilis mag-load sa mga budget Android phone at prepaid mobile data (Go50 / GIGA / Piso WiFi).
   - Walang kailangang i-download na app o kumplikadong sign-up—ilalagay lamang ang **Pangalan** at **Seksiyon**.
   - Awtomatikong hihinto ang bidyo sa bawat **Checkpoint** (3 katanungan).
   - Awtomatikong pagwawasto sa server upang hindi masilip ang sagot sa browser inspect/devtools.
   - May agarang paliwanag at feedback bago magpatuloy ang bidyo.

2. **Guro (Teacher Dashboard):**
   - Protektado ng Teacher PIN (Default: `1234`).
   - Ipinapakita ang kabuuang bilang ng nakatapos, average score, at passing rate.
   - Talaan ng bawat mag-aaral: Pangalan, Seksiyon, Q1, Q2, Q3, Kabuuang Iskor, at Petsa.
   - **One-click CSV Download:** Maaring i-export sa CSV at direktang kopyahin sa DepEd Electronic Class Record / Excel.

3. **Handa para sa Komersyal na Pamamahagi:**
   - Bawat aralin ay nakahiwalay sa `data/lesson.json`.
   - Madaling magdagdag ng Aralin 2, Aralin 3, o magbenta ng interactive video packages sa ibang guro gamit ang simpleng access codes.

---

## 🚀 Paano Patakbuhin sa Computer (How to Run Locally)

1. Buksan ang terminal sa folder na ito:
   ```bash
   cd "C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video"
   ```

2. Simulan ang server:
   ```bash
   npm start
   ```

3. Buksan sa browser:
   - **Para sa Mag-aaral:** [http://localhost:3000](http://localhost:3000)
   - **Para sa Guro (Dashboard):** [http://localhost:3000/admin.html](http://localhost:3000/admin.html) *(PIN: `1234`)*

---

## ✏️ Paano Palitan ang Bidyo o mga Tanong

Buksan lamang ang file na `data/lesson.json`:
- **`videoUrl`**: Ilagay ang direct link ng iyong MP4 video (hal. mula sa Google Drive direct link, Cloudflare R2, o i-save sa folder na `public/` bilang `my-video.mp4` at ilagay ang `/my-video.mp4`).
- **`checkpoints`**: Ayusin ang mga `timestamp` (segundo), tanong, pagpipilian (A, B, C, D), tamang sagot, at feedback.

---

## 🌐 Paano I-deploy Online nang Libre (Para Mabuksan ng mga Estudyante sa Kanilang Cellphone)

Upang maipadala ang link sa mga estudyante sa Messenger o Google Classroom:
1. I-upload ang folder na ito sa isang libreng **GitHub repository**.
2. Ikabit sa **[Render.com](https://render.com)** o **[Railway.app](https://railway.app)** (Web Service).
3. Makakakuha ka ng libreng pampublikong link (hal. `https://pklp-aralin1.onrender.com`) na pwedeng buksan ng kahit sinong estudyante sa kanilang cellphone saanman sila naroroon!
