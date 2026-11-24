(() => {
  const strings = {
  "Guro Studio - Classroom Video Quiz": {
    "en": "Teacher Studio - Classroom Video Quiz",
    "fil": "Guro Studio - Classroom Video Quiz"
  },
  "🔒 Guro Studio Login": {
    "en": "🔒 Teacher Studio Sign In",
    "fil": "🔒 Guro Studio Login"
  },
  "Ilagay ang code ng pangunahing guro upang makagawa ng aralin.": {
    "en": "Enter the main teacher code to create or edit an ADM.",
    "fil": "Ilagay ang code ng pangunahing guro upang makagawa ng aralin."
  },
  "Ilagay ang PIN...": {
    "en": "Enter teacher code…",
    "fil": "Ilagay ang PIN..."
  },
  "Buksan ang Studio": {
    "en": "Open Studio",
    "fil": "Buksan ang Studio"
  },
  "Maling PIN. Pakisubukang muli.": {
    "en": "Incorrect code. Please try again.",
    "fil": "Maling PIN. Pakisubukang muli."
  },
  "🎬 Guro Studio: No-Code Interactive Video Creator": {
    "en": "🎬 Teacher Studio: Interactive Video Creator",
    "fil": "🎬 Guro Studio: No-Code Interactive Video Creator"
  },
  "Gumawa at mag-edit ng mga interactive na aralin nang walang coding": {
    "en": "Create and edit interactive video lessons.",
    "fil": "Gumawa at mag-edit ng mga interactive na aralin nang walang coding"
  },
  "▶ Buksan ang Player": {
    "en": "▶ Open Player",
    "fil": "▶ Buksan ang Player"
  },
  "1. Impormasyon ng Aralin": {
    "en": "1. Lesson Details",
    "fil": "1. Impormasyon ng Aralin"
  },
  "Pamagat ng Aralin:": {
    "en": "Lesson title:",
    "fil": "Pamagat ng Aralin:"
  },
  "Aralin 1: Pagsusuri sa Tekstong Impormatibo": {
    "en": "Example: ADM 1 — Reading Informational Texts",
    "fil": "Aralin 1: Pagsusuri sa Tekstong Impormatibo"
  },
  "Asignatura at Baitang:": {
    "en": "Subject and grade:",
    "fil": "Asignatura at Baitang:"
  },
  "Halimbawa: Baitang 11 - Araling Panlipunan": {
    "en": "Example: Grade 11 — Social Studies",
    "fil": "Halimbawa: Baitang 11 - Araling Panlipunan"
  },
  "YouTube Video Link o Video ID:": {
    "en": "YouTube video link or video ID:",
    "fil": "YouTube Video Link o Video ID:"
  },
  "https://www.youtube.com/watch?v=jNQXAC9IVRw o jNQXAC9IVRw": {
    "en": "https://www.youtube.com/watch?v=jNQXAC9IVRw or jNQXAC9IVRw",
    "fil": "https://www.youtube.com/watch?v=jNQXAC9IVRw o jNQXAC9IVRw"
  },
  "I-load": {
    "en": "Load",
    "fil": "I-load"
  },
  "Google Sheet Webhook URL (Opsyonal para sa Direct Sync):": {
    "en": "Google Sheet webhook URL (optional direct sync):",
    "fil": "Google Sheet Webhook URL (Opsyonal para sa Direct Sync):"
  },
  "Kapag may webhook, awtomatikong papasok ang bawat score sa iyong Google Sheet sa Google Drive.": {
    "en": "With a webhook, scores are also sent directly to your Google Sheet.",
    "fil": "Kapag may webhook, awtomatikong papasok ang bawat score sa iyong Google Sheet sa Google Drive."
  },
  "2. Video Timeline at Scrubber": {
    "en": "2. Video Preview and Timeline",
    "fil": "2. Video Timeline at Scrubber"
  },
  "Kasalukuyang Oras:": {
    "en": "Current time:",
    "fil": "Kasalukuyang Oras:"
  },
  "➕ Magdagdag ng Tanong Dito": {
    "en": "➕ Add Question Here",
    "fil": "➕ Magdagdag ng Tanong Dito"
  },
  "3. Tagabuo ng Katanungan (Question Builder)": {
    "en": "3. Question Builder",
    "fil": "3. Tagabuo ng Katanungan (Question Builder)"
  },
  "Oras kung kailan hihinto ang bidyo (segundo):": {
    "en": "Pause the video at (seconds):",
    "fil": "Oras kung kailan hihinto ang bidyo (segundo):"
  },
  "Halimbawa: 45": {
    "en": "Example: 45",
    "fil": "Halimbawa: 45"
  },
  "Katanungan:": {
    "en": "Question:",
    "fil": "Katanungan:"
  },
  "Ilagay ang katanungan para sa mga mag-aaral...": {
    "en": "Enter the question for your students…",
    "fil": "Ilagay ang katanungan para sa mga mag-aaral..."
  },
  "Mga Pagpipilian (Piliin ang radio button ng TAMANG sagot):": {
    "en": "Choices (select the circle beside the correct answer):",
    "fil": "Mga Pagpipilian (Piliin ang radio button ng TAMANG sagot):"
  },
  "Pagpipilian A (Tamang sagot)": {
    "en": "Choice A (correct answer)",
    "fil": "Pagpipilian A (Tamang sagot)"
  },
  "Pagpipilian B": {
    "en": "Choice B",
    "fil": "Pagpipilian B"
  },
  "Pagpipilian C": {
    "en": "Choice C",
    "fil": "Pagpipilian C"
  },
  "Pagpipilian D": {
    "en": "Choice D",
    "fil": "Pagpipilian D"
  },
  "Paliwanag / Feedback kapag TAMA ang sagot:": {
    "en": "Feedback for a correct answer:",
    "fil": "Paliwanag / Feedback kapag TAMA ang sagot:"
  },
  "Magaling! Tumpak ang iyong sagot...": {
    "en": "Well done! Your answer is correct…",
    "fil": "Magaling! Tumpak ang iyong sagot..."
  },
  "Paliwanag / Feedback kapag MALI ang sagot:": {
    "en": "Feedback for an incorrect answer:",
    "fil": "Paliwanag / Feedback kapag MALI ang sagot:"
  },
  "Maling sagot. Tandaan na ang konseptong ito ay...": {
    "en": "Review this concept…",
    "fil": "Maling sagot. Tandaan na ang konseptong ito ay..."
  },
  "💾 I-save ang Checkpoint na Ito": {
    "en": "💾 Save This Question",
    "fil": "💾 I-save ang Checkpoint na Ito"
  },
  "4. Talaan ng mga Naka-set na Checkpoints (": {
    "en": "4. Saved Questions (",
    "fil": "4. Talaan ng mga Naka-set na Checkpoints ("
  },
  "Wala pang checkpoints. Magpatugtog ng video at i-click ang \"+ Magdagdag ng Tanong Dito\".": {
    "en": "No questions yet. Play the video and click “Add Question Here”.",
    "fil": "Wala pang checkpoints. Magpatugtog ng video at i-click ang \"+ Magdagdag ng Tanong Dito\"."
  },
  "🚀 I-SAVE AT I-PUBLISH ANG BUONG ARALIN": {
    "en": "🚀 SAVE AND PUBLISH ADM",
    "fil": "🚀 I-SAVE AT I-PUBLISH ANG BUONG ARALIN"
  },
  "✓ Matagumpay na nai-publish ang aralin!": {
    "en": "✓ ADM published successfully!",
    "fil": "✓ Matagumpay na nai-publish ang aralin!"
  },
  "Maaari mo nang kopyahin ang link at i-share sa mga estudyante:": {
    "en": "Copy this link and share it with your students:",
    "fil": "Maaari mo nang kopyahin ang link at i-share sa mga estudyante:"
  },
  "Pakipunan ang oras (segundo), tanong, at hindi bababa sa pagpipilian A at B.": {
    "en": "Enter the time in seconds, a question, and at least choices A and B.",
    "fil": "Pakipunan ang oras (segundo), tanong, at hindi bababa sa pagpipilian A at B."
  },
  "Wala sa nabanggit": {
    "en": "None of the above",
    "fil": "Wala sa nabanggit"
  },
  "Lahat ng nabanggit": {
    "en": "All of the above",
    "fil": "Lahat ng nabanggit"
  },
  "Magaling! Tumpak ang iyong sagot.": {
    "en": "Well done! Your answer is correct.",
    "fil": "Magaling! Tumpak ang iyong sagot."
  },
  "Maling sagot. Tandaan ang tamang konsepto.": {
    "en": "Review this part of the lesson.",
    "fil": "Maling sagot. Tandaan ang tamang konsepto."
  },
  "Magaling! Tumpak ang sagot.": {
    "en": "Correct!",
    "fil": "Magaling! Tumpak ang sagot."
  },
  "Maling sagot. Tandaan ang konsepto.": {
    "en": "Review this part of the lesson.",
    "fil": "Maling sagot. Tandaan ang konsepto."
  },
  "Naidagdag ang checkpoint!": {
    "en": "Question added!",
    "fil": "Naidagdag ang checkpoint!"
  },
  "Tamang Sagot:": {
    "en": "Correct answer:",
    "fil": "Tamang Sagot:"
  },
  "Pagpipilian": {
    "en": "choices",
    "fil": "Pagpipilian"
  },
  "🗑️ Burahin": {
    "en": "🗑️ Delete",
    "fil": "🗑️ Burahin"
  },
  "Pakitiyak na may Pamagat, valid YouTube ID, at hindi bababa sa 1 checkpoint.": {
    "en": "Enter a title, a valid video source, and at least one question.",
    "fil": "Pakitiyak na may Pamagat, valid YouTube ID, at hindi bababa sa 1 checkpoint."
  },
  "Inililigtas ang aralin...": {
    "en": "Saving ADM…",
    "fil": "Inililigtas ang aralin..."
  },
  "Nagka-error sa pag-save. Pakisubukang muli.": {
    "en": "Could not save the ADM. Please try again.",
    "fil": "Nagka-error sa pag-save. Pakisubukang muli."
  },
  "Teacher Studio - Classroom Video Quiz": {
    "en": "Teacher Studio - Classroom Video Quiz",
    "fil": "Guro Studio - Classroom Video Quiz"
  },
  "🔒 Teacher Studio Sign In": {
    "en": "🔒 Teacher Studio Sign In",
    "fil": "🔒 Guro Studio Login"
  },
  "Enter the main teacher code to create or edit an ADM.": {
    "en": "Enter the main teacher code to create or edit an ADM.",
    "fil": "Ilagay ang code ng pangunahing guro upang makagawa ng aralin."
  },
  "Enter teacher code…": {
    "en": "Enter teacher code…",
    "fil": "Ilagay ang PIN..."
  },
  "Open Studio": {
    "en": "Open Studio",
    "fil": "Buksan ang Studio"
  },
  "Incorrect code. Please try again.": {
    "en": "Incorrect code. Please try again.",
    "fil": "Maling PIN. Pakisubukang muli."
  },
  "🎬 Teacher Studio: Interactive Video Creator": {
    "en": "🎬 Teacher Studio: Interactive Video Creator",
    "fil": "🎬 Guro Studio: No-Code Interactive Video Creator"
  },
  "Create and edit interactive video lessons.": {
    "en": "Create and edit interactive video lessons.",
    "fil": "Gumawa at mag-edit ng mga interactive na aralin nang walang coding"
  },
  "▶ Open Player": {
    "en": "▶ Open Player",
    "fil": "▶ Buksan ang Player"
  },
  "1. Lesson Details": {
    "en": "1. Lesson Details",
    "fil": "1. Impormasyon ng Aralin"
  },
  "Lesson title:": {
    "en": "Lesson title:",
    "fil": "Pamagat ng Aralin:"
  },
  "Example: ADM 1 — Reading Informational Texts": {
    "en": "Example: ADM 1 — Reading Informational Texts",
    "fil": "Aralin 1: Pagsusuri sa Tekstong Impormatibo"
  },
  "Subject and grade:": {
    "en": "Subject and grade:",
    "fil": "Asignatura at Baitang:"
  },
  "Example: Grade 11 — Social Studies": {
    "en": "Example: Grade 11 — Social Studies",
    "fil": "Halimbawa: Baitang 11 - Araling Panlipunan"
  },
  "YouTube video link or video ID:": {
    "en": "YouTube video link or video ID:",
    "fil": "YouTube Video Link o Video ID:"
  },
  "https://www.youtube.com/watch?v=jNQXAC9IVRw or jNQXAC9IVRw": {
    "en": "https://www.youtube.com/watch?v=jNQXAC9IVRw or jNQXAC9IVRw",
    "fil": "https://www.youtube.com/watch?v=jNQXAC9IVRw o jNQXAC9IVRw"
  },
  "Load": {
    "en": "Load",
    "fil": "I-load"
  },
  "Google Sheet webhook URL (optional direct sync):": {
    "en": "Google Sheet webhook URL (optional direct sync):",
    "fil": "Google Sheet Webhook URL (Opsyonal para sa Direct Sync):"
  },
  "With a webhook, scores are also sent directly to your Google Sheet.": {
    "en": "With a webhook, scores are also sent directly to your Google Sheet.",
    "fil": "Kapag may webhook, awtomatikong papasok ang bawat score sa iyong Google Sheet sa Google Drive."
  },
  "2. Video Preview and Timeline": {
    "en": "2. Video Preview and Timeline",
    "fil": "2. Video Timeline at Scrubber"
  },
  "Current time:": {
    "en": "Current time:",
    "fil": "Kasalukuyang Oras:"
  },
  "➕ Add Question Here": {
    "en": "➕ Add Question Here",
    "fil": "➕ Magdagdag ng Tanong Dito"
  },
  "3. Question Builder": {
    "en": "3. Question Builder",
    "fil": "3. Tagabuo ng Katanungan (Question Builder)"
  },
  "Pause the video at (seconds):": {
    "en": "Pause the video at (seconds):",
    "fil": "Oras kung kailan hihinto ang bidyo (segundo):"
  },
  "Example: 45": {
    "en": "Example: 45",
    "fil": "Halimbawa: 45"
  },
  "Question:": {
    "en": "Question:",
    "fil": "Katanungan:"
  },
  "Enter the question for your students…": {
    "en": "Enter the question for your students…",
    "fil": "Ilagay ang katanungan para sa mga mag-aaral..."
  },
  "Choices (select the circle beside the correct answer):": {
    "en": "Choices (select the circle beside the correct answer):",
    "fil": "Mga Pagpipilian (Piliin ang radio button ng TAMANG sagot):"
  },
  "Choice A (correct answer)": {
    "en": "Choice A (correct answer)",
    "fil": "Pagpipilian A (Tamang sagot)"
  },
  "Choice B": {
    "en": "Choice B",
    "fil": "Pagpipilian B"
  },
  "Choice C": {
    "en": "Choice C",
    "fil": "Pagpipilian C"
  },
  "Choice D": {
    "en": "Choice D",
    "fil": "Pagpipilian D"
  },
  "Feedback for a correct answer:": {
    "en": "Feedback for a correct answer:",
    "fil": "Paliwanag / Feedback kapag TAMA ang sagot:"
  },
  "Well done! Your answer is correct…": {
    "en": "Well done! Your answer is correct…",
    "fil": "Magaling! Tumpak ang iyong sagot..."
  },
  "Feedback for an incorrect answer:": {
    "en": "Feedback for an incorrect answer:",
    "fil": "Paliwanag / Feedback kapag MALI ang sagot:"
  },
  "Review this concept…": {
    "en": "Review this concept…",
    "fil": "Maling sagot. Tandaan na ang konseptong ito ay..."
  },
  "💾 Save This Question": {
    "en": "💾 Save This Question",
    "fil": "💾 I-save ang Checkpoint na Ito"
  },
  "4. Saved Questions (": {
    "en": "4. Saved Questions (",
    "fil": "4. Talaan ng mga Naka-set na Checkpoints ("
  },
  "No questions yet. Play the video and click “Add Question Here”.": {
    "en": "No questions yet. Play the video and click “Add Question Here”.",
    "fil": "Wala pang checkpoints. Magpatugtog ng video at i-click ang \"+ Magdagdag ng Tanong Dito\"."
  },
  "🚀 SAVE AND PUBLISH ADM": {
    "en": "🚀 SAVE AND PUBLISH ADM",
    "fil": "🚀 I-SAVE AT I-PUBLISH ANG BUONG ARALIN"
  },
  "✓ ADM published successfully!": {
    "en": "✓ ADM published successfully!",
    "fil": "✓ Matagumpay na nai-publish ang aralin!"
  },
  "Copy this link and share it with your students:": {
    "en": "Copy this link and share it with your students:",
    "fil": "Maaari mo nang kopyahin ang link at i-share sa mga estudyante:"
  },
  "Enter the time in seconds, a question, and at least choices A and B.": {
    "en": "Enter the time in seconds, a question, and at least choices A and B.",
    "fil": "Pakipunan ang oras (segundo), tanong, at hindi bababa sa pagpipilian A at B."
  },
  "None of the above": {
    "en": "None of the above",
    "fil": "Wala sa nabanggit"
  },
  "All of the above": {
    "en": "All of the above",
    "fil": "Lahat ng nabanggit"
  },
  "Well done! Your answer is correct.": {
    "en": "Well done! Your answer is correct.",
    "fil": "Magaling! Tumpak ang iyong sagot."
  },
  "Review this part of the lesson.": {
    "en": "Review this part of the lesson.",
    "fil": "Maling sagot. Tandaan ang konsepto."
  },
  "Correct!": {
    "en": "Correct!",
    "fil": "Magaling! Tumpak ang sagot."
  },
  "Question added!": {
    "en": "Question added!",
    "fil": "Naidagdag ang checkpoint!"
  },
  "Correct answer:": {
    "en": "Correct answer:",
    "fil": "Tamang Sagot:"
  },
  "choices": {
    "en": "choices",
    "fil": "Pagpipilian"
  },
  "🗑️ Delete": {
    "en": "🗑️ Delete",
    "fil": "🗑️ Burahin"
  },
  "Enter a title, a valid video source, and at least one question.": {
    "en": "Enter a title, a valid video source, and at least one question.",
    "fil": "Pakitiyak na may Pamagat, valid YouTube ID, at hindi bababa sa 1 checkpoint."
  },
  "Saving ADM…": {
    "en": "Saving ADM…",
    "fil": "Inililigtas ang aralin..."
  },
  "Could not save the ADM. Please try again.": {
    "en": "Could not save the ADM. Please try again.",
    "fil": "Nagka-error sa pag-save. Pakisubukang muli."
  },
  "ADM library": {
    "en": "ADM library",
    "fil": "Mga ADM"
  },
  "Video source": {
    "en": "Video source",
    "fil": "Pinagmulan ng bidyo"
  },
  "MP4 link": {
    "en": "MP4 link",
    "fil": "Link ng MP4"
  },
  "MP4 URL (for MP4 source)": {
    "en": "MP4 URL (for MP4 source)",
    "fil": "URL ng MP4 (para sa MP4)"
  },
  "📊 Dashboard": {
    "en": "📊 Dashboard",
    "fil": "📊 Dashboard"
  },
  "English": {
    "en": "English",
    "fil": "English"
  },
  "Filipino": {
    "en": "Filipino",
    "fil": "Filipino"
  },
  "Your ADM library": {
    "en": "Your ADM library",
    "fil": "Aking mga ADM"
  },
  "Keep each video lesson and its student results together. Create another ADM whenever your class starts a new activity.": {
    "en": "Keep each video lesson and its student results together. Create another ADM whenever your class starts a new activity.",
    "fil": "Panatilihing magkasama ang bawat aralin at ang mga resulta nito. Gumawa ng bagong ADM para sa susunod na gawain."
  },
  "Teacher dashboard": {
    "en": "Teacher dashboard",
    "fil": "Dashboard ng guro"
  },
  "Create new ADM": {
    "en": "Create new ADM",
    "fil": "Gumawa ng bagong ADM"
  },
  "Teacher sign in": {
    "en": "Teacher sign in",
    "fil": "Pagpasok ng guro"
  },
  "Teacher code": {
    "en": "Teacher code",
    "fil": "Code ng guro"
  },
  "Open library": {
    "en": "Open library",
    "fil": "Buksan ang mga ADM"
  },
  "Could not open the library. Check your code and try again.": {
    "en": "Could not open the library. Check your code and try again.",
    "fil": "Hindi mabuksan ang mga ADM. Suriin ang iyong code at subukang muli."
  },
  "Loading your ADMs…": {
    "en": "Loading your ADMs…",
    "fil": "Nilo-load ang mga ADM…"
  },
  "ADM lesson": {
    "en": "ADM lesson",
    "fil": "Aralin sa ADM"
  },
  "questions": {
    "en": "questions",
    "fil": "tanong"
  },
  "Edit lesson": {
    "en": "Edit lesson",
    "fil": "I-edit ang aralin"
  },
  "View results": {
    "en": "View results",
    "fil": "Tingnan ang mga resulta"
  },
  "Copy student link": {
    "en": "Copy student link",
    "fil": "Kopyahin ang link ng mag-aaral"
  },
  "Student link copied.": {
    "en": "Student link copied.",
    "fil": "Nakopya ang link ng mag-aaral."
  },
  "Copy this student link:": {
    "en": "Copy this student link:",
    "fil": "Kopyahin ang link ng mag-aaral:"
  },
  "Download results CSV": {
    "en": "Download results CSV",
    "fil": "I-download ang CSV ng mga resulta"
  },
  "Could not download results. Try again.": {
    "en": "Could not download results. Try again.",
    "fil": "Hindi ma-download ang mga resulta. Subukang muli."
  },
  "CSV downloaded. Open it in Excel to see scores and selected answers.": {
    "en": "CSV downloaded. Open it in Excel to see scores and selected answers.",
    "fil": "Na-download ang CSV. Buksan sa Excel upang makita ang mga iskor at sagot."
  },
  "Each ADM has its own student link and results download. CSV files open in Excel.": {
    "en": "Each ADM has its own student link and results download. CSV files open in Excel.",
    "fil": "Bawat ADM ay may sariling link ng mag-aaral at mga resulta. Maaaring buksan ang CSV sa Excel."
  }
};
  let language = 'en';
  try { language = localStorage.getItem('pklp_dashboard_lang') === 'fil' ? 'fil' : 'en'; } catch (_) {}
  window.teacherText = text => strings[text]?.[language] || text;
  document.addEventListener('DOMContentLoaded', () => {
    const labels = [];
    // Capture only the static interface that exists before lesson content is fetched.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement.closest('script,style,textarea')) continue;
      const key = node.textContent.trim();
      if (strings[key]) labels.push({node, key});
    }
    const placeholders = [...document.querySelectorAll('[placeholder]')].map(el => ({el, key:el.placeholder}));
    const title = document.title;
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Interface language');
    select.style.cssText = 'width:auto;min-width:110px;margin:8px;padding:8px;font:inherit';
    for (const [value, text] of [['en','English'],['fil','Filipino']]) {
      const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option);
    }
    document.querySelector('#pin-modal > div, header').prepend(select);
    // Move the same language control into the studio header once sign-in succeeds.
    const studio = document.getElementById('studio-main');
    if (studio) new MutationObserver(() => {
      if (!studio.classList.contains('hidden')) document.querySelector('.studio-header').append(select);
    }).observe(studio, {attributes:true, attributeFilter:['class']});
    function apply() {
      select.value = language;
      document.documentElement.lang = language === 'fil' ? 'tl' : 'en';
      document.title = window.teacherText(title);
      for (const {node,key} of labels) if (node.isConnected) node.textContent = window.teacherText(key);
      for (const {el,key} of placeholders) el.placeholder = window.teacherText(key);
      window.dispatchEvent(new Event('teacher-language-change'));
    }
    select.addEventListener('change', () => {
      language = select.value;
      try { localStorage.setItem('pklp_dashboard_lang', language); } catch (_) {}
      apply();
    });
    apply();
  });
})();
