document.addEventListener('DOMContentLoaded', () => {
  function updateLessonLinks() {
    const query = location.search;
    document.getElementById('studio-dashboard-link').href = '/admin.html' + query;
    document.getElementById('studio-player-link').href = '/play.html' + query;
  }
  updateLessonLinks();
  const ui = text => window.teacherText(text);
  window.addEventListener('teacher-language-change', () => {
    renderCheckpointsList();
    btnPublishAll.textContent = ui(btnPublishAll.disabled ? 'Saving ADM…' : '🚀 SAVE AND PUBLISH ADM');
  });
  let createNew = new URLSearchParams(location.search).get('new') === '1';
  let currentPin = sessionStorage.getItem('pklp_teacher_pin') || '';
  let studioPlayer = null;
  let youtubePlayer = null;
  let checkpoints = [];
  let pollTimer = null;

  // DOM Elements
  const pinModal = document.getElementById('pin-modal');
  const inputPin = document.getElementById('input-pin');
  const btnUnlock = document.getElementById('btn-unlock');
  const pinError = document.getElementById('pin-error');
  const studioMain = document.getElementById('studio-main');

  const lessonTitle = document.getElementById('lesson-title');
  const lessonSubject = document.getElementById('lesson-subject');
  const lessonYoutubeUrl = document.getElementById('lesson-youtube-url');
  const btnLoadVideo = document.getElementById('btn-load-video');
  const lessonSheetUrl = document.getElementById('lesson-sheet-url');

  const displayCurrentTime = document.getElementById('display-current-time');
  const btnCaptureTime = document.getElementById('btn-capture-time');

  const cpTimestamp = document.getElementById('cp-timestamp');
  const cpQuestion = document.getElementById('cp-question');
  const choiceA = document.getElementById('choice-A');
  const choiceB = document.getElementById('choice-B');
  const choiceC = document.getElementById('choice-C');
  const choiceD = document.getElementById('choice-D');
  const cpFeedbackCorrect = document.getElementById('cp-feedback-correct');
  const cpFeedbackWrong = document.getElementById('cp-feedback-wrong');
  const btnSaveCheckpoint = document.getElementById('btn-save-checkpoint');

  const checkpointsList = document.getElementById('checkpoints-list');
  const cpCount = document.getElementById('cp-count');
  const btnPublishAll = document.getElementById('btn-publish-all');
  const publishSuccessBox = document.getElementById('publish-success-box');
  const shareableStudentLink = document.getElementById('shareable-student-link');

  // 1. PIN Authentication
  if (currentPin) {
    unlockStudio(currentPin);
  }

  btnUnlock.addEventListener('click', () => {
    const pin = inputPin.value.trim();
    if (pin) unlockStudio(pin);
  });

  inputPin.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnUnlock.click();
  });

  function unlockStudio(pin) {
    // Only the main teacher (master code) may edit lessons
    fetch('/api/admin/me', { headers: { 'x-teacher-pin': pin } })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(who => {
        if (!who.isAdmin) throw new Error('Not main teacher');
        currentPin = pin;
        sessionStorage.setItem('pklp_teacher_pin', pin);
        pinModal.classList.add('hidden');
        studioMain.classList.remove('hidden');

        // Load existing lesson into form
        if (createNew) { lessonTitle.value = ''; lessonYoutubeUrl.value = ''; checkpoints = []; renderCheckpointsList(); }
        else loadExistingLesson();
      })
      .catch(() => {
        pinError.classList.remove('hidden');
        sessionStorage.removeItem('pklp_teacher_pin');
      });
  }

  // 2. Load Existing Lesson
  function loadExistingLesson() {
    fetch('/api/admin/lesson?_t=' + Date.now(), {
      headers: { 'x-teacher-pin': currentPin },
      cache: 'no-store'
    })
      .then(r => r.json())
      .then(lesson => {
        document.getElementById('lesson-video-type').value = lesson.videoType || 'youtube';
        document.getElementById('lesson-direct-url').value = lesson.videoUrl || '';
        lessonTitle.value = lesson.title || '';
        lessonSubject.value = lesson.subject || '';
        lessonYoutubeUrl.value = lesson.youtubeId || 'jNQXAC9IVRw';
        lessonSheetUrl.value = lesson.sheetWebhookUrl || '';

        checkpoints = (lesson.checkpoints || []).map(cp => ({
          id: cp.id,
          t: Number(cp.timestamp || cp.t || 0),
          question: cp.question,
          options: cp.options,
          correctAnswer: cp.correctAnswer || 'A',
          feedbackCorrect: cp.feedbackCorrect || ui("Correct!"),
          feedbackIncorrect: cp.feedbackIncorrect || ui("Review this part of the lesson.")
        }));

        renderCheckpointsList();
        if (lesson.videoType === 'direct') loadDirectVideo();
        else initStudioYouTube(lesson.youtubeId || 'jNQXAC9IVRw');
      })
      .catch(err => console.error(err));
  }

  // 3. YouTube Preview Player
  function extractYouTubeId(url) {
    if (!url) return '';
    const clean = url.trim();
    if (clean.length === 11 && !clean.includes('/') && !clean.includes('?')) return clean;
    const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/);
    return match ? match[1] : clean;
  }

  window.onYouTubeIframeAPIReady = function() {
    // If studio is already unlocked, init player
    if (currentPin && lessonYoutubeUrl.value) {
      initStudioYouTube(extractYouTubeId(lessonYoutubeUrl.value));
    }
  };

  function initStudioYouTube(videoIdentifier) {
    if (document.getElementById('lesson-video-type').value === 'direct') return;
    const videoId = extractYouTubeId(videoIdentifier);
    if (!window.YT || !window.YT.Player) {
      // Retry in 300ms if API not ready yet
      setTimeout(() => initStudioYouTube(videoIdentifier), 300);
      return;
    }

    if (youtubePlayer) studioPlayer = youtubePlayer;
    if (studioPlayer && typeof studioPlayer.loadVideoById === 'function') {
      studioPlayer.loadVideoById(videoId);
      return;
    }

    studioPlayer = new YT.Player('studio-yt-player', {
      videoId: videoId,
      playerVars: {
        controls: 1, // Full controls for the teacher to scrub and find timestamps
        modestbranding: 1,
        rel: 0
      },
      events: {
        onReady: () => {
          if (!pollTimer) {
            pollTimer = setInterval(updateStudioClock, 250);
          }
        }
      }
    });
    youtubePlayer = studioPlayer;
  }

  function loadDirectVideo() {
    const v = document.getElementById('studio-mp4-player');
    if (studioPlayer?.pauseVideo) studioPlayer.pauseVideo();
    document.getElementById('studio-yt-player').style.display = 'none';
    v.style.display = 'block';
    v.src = document.getElementById('lesson-direct-url').value.trim();
    studioPlayer = { getCurrentTime: () => v.currentTime, pauseVideo: () => v.pause() };
    if (!pollTimer) pollTimer = setInterval(updateStudioClock, 250);
  }
  btnLoadVideo.addEventListener('click', () => {
    if (document.getElementById('lesson-video-type').value === 'direct') return loadDirectVideo();
    document.getElementById('studio-mp4-player').pause();
    document.getElementById('studio-mp4-player').style.display = 'none';
    document.getElementById('studio-yt-player').style.display = 'block';
    const raw = lessonYoutubeUrl.value.trim();
    const id = extractYouTubeId(raw);
    lessonYoutubeUrl.value = id;
    initStudioYouTube(id);
  });

  function updateStudioClock() {
    if (!studioPlayer || typeof studioPlayer.getCurrentTime !== 'function') return;
    const sec = Math.floor(studioPlayer.getCurrentTime());
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    displayCurrentTime.textContent = `${m}:${s} (${sec}s)`;
  }

  // 4. Capture Time & Fill Checkpoint Form
  btnCaptureTime.addEventListener('click', () => {
    if (!studioPlayer || typeof studioPlayer.getCurrentTime !== 'function') return;
    studioPlayer.pauseVideo();
    const currentSec = Math.floor(studioPlayer.getCurrentTime());
    cpTimestamp.value = currentSec;

    // Smooth scroll to builder
    document.getElementById('builder-box').scrollIntoView({ behavior: 'smooth' });
    cpQuestion.focus();
  });

  // 5. Save Checkpoint
  btnSaveCheckpoint.addEventListener('click', () => {
    const sec = parseInt(cpTimestamp.value, 10);
    const qText = cpQuestion.value.trim();
    const textA = choiceA.value.trim();
    const textB = choiceB.value.trim();
    const textC = choiceC.value.trim();
    const textD = choiceD.value.trim();
    const selectedCorrect = document.querySelector('input[name="correct-choice"]:checked')?.value || 'A';
    const fbCorrect = cpFeedbackCorrect.value.trim();
    const fbWrong = cpFeedbackWrong.value.trim();

    if (isNaN(sec) || !qText || !textA || !textB) {
      alert(ui("Enter the time in seconds, a question, and at least choices A and B."));
      return;
    }

    const newCp = {
      id: 'cp_' + Date.now(),
      t: sec,
      timestamp: sec,
      question: qText,
      options: [
        { id: 'A', text: textA },
        { id: 'B', text: textB },
        { id: 'C', text: textC || ui("None of the above") },
        { id: 'D', text: textD || ui("All of the above") }
      ],
      correctAnswer: selectedCorrect,
      feedbackCorrect: fbCorrect || ui("Well done! Your answer is correct."),
      feedbackIncorrect: fbWrong || ui("Review this part of the lesson.")
    };

    checkpoints.push(newCp);
    checkpoints.sort((a, b) => a.t - b.t);

    renderCheckpointsList();

    // Clear form
    cpTimestamp.value = '';
    cpQuestion.value = '';
    choiceA.value = '';
    choiceB.value = '';
    choiceC.value = '';
    choiceD.value = '';
    cpFeedbackCorrect.value = '';
    cpFeedbackWrong.value = '';
    alert(ui("Question added!"));
  });

  // 6. Render Checkpoints
  function renderCheckpointsList() {
    cpCount.textContent = checkpoints.length;
    if (checkpoints.length === 0) {
      checkpointsList.innerHTML = `
        <p style="color: #94a3b8; font-size: 0.85rem; text-align: center; padding: 14px;">
${ui("No questions yet. Play the video and click “Add Question Here”.")}
        </p>
      `;
      return;
    }

    checkpointsList.innerHTML = '';
    checkpoints.forEach((cp, idx) => {
      const min = Math.floor(cp.t / 60).toString().padStart(2, '0');
      const sec = (cp.t % 60).toString().padStart(2, '0');

      const item = document.createElement('div');
      item.className = 'cp-item';
      item.innerHTML = `
        <div>
          <strong>[${min}:${sec}] Q${idx + 1}:</strong> ${escapeHtml(cp.question.substring(0, 45))}${cp.question.length > 45 ? '...' : ''}
          <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">
            ${ui("Correct answer:")} <strong>${cp.correctAnswer || 'A'}</strong> | ${cp.options.length} ${ui("choices")}
          </div>
        </div>
        <button class="btn-small btn-delete" data-idx="${idx}">${ui("🗑️ Delete")}</button>
      `;

      item.querySelector('.btn-delete').addEventListener('click', () => {
        checkpoints.splice(idx, 1);
        renderCheckpointsList();
      });

      checkpointsList.appendChild(item);
    });
  }

  // 7. Publish Whole Lesson (1-Click)
  btnPublishAll.addEventListener('click', () => {
    const title = lessonTitle.value.trim();
    const subject = lessonSubject.value.trim();
    const ytid = extractYouTubeId(lessonYoutubeUrl.value);
    const sheetUrl = lessonSheetUrl.value.trim();

    const videoType = document.getElementById('lesson-video-type').value;
    const videoUrl = document.getElementById('lesson-direct-url').value.trim();
    if (!title || !(videoType === 'direct' ? videoUrl : ytid) || checkpoints.length === 0) {
      alert(ui("Enter a title, a valid video source, and at least one question."));
      return;
    }

    btnPublishAll.disabled = true;
    btnPublishAll.textContent = ui("Saving ADM…");

    fetch('/api/studio/save-lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-teacher-pin': currentPin
      },
      body: JSON.stringify({
        title,
        subject,
        createNew,
        videoType,
        videoUrl,
        youtubeId: ytid,
        sheetWebhookUrl: sheetUrl,
        checkpoints
      })
    })
    .then(r => {
      if (!r.ok) throw new Error('Save failed');
      return r.json();
    })
    .then(data => {
      btnPublishAll.disabled = false;
      btnPublishAll.textContent = ui("🚀 SAVE AND PUBLISH ADM");

      publishSuccessBox.classList.remove('hidden');
      createNew = false;
      history.replaceState(null, '', '/studio.html?lesson=' + encodeURIComponent(data.lesson.id));
      updateLessonLinks();
      const fullUrl = window.location.origin + '/play.html?lesson=' + encodeURIComponent(data.lesson.id);
      shareableStudentLink.value = fullUrl;
      shareableStudentLink.focus();
      shareableStudentLink.select();
    })
    .catch(err => {
      console.error(err);
      alert(ui("Could not save the ADM. Please try again."));
      btnPublishAll.disabled = false;
      btnPublishAll.textContent = ui("🚀 SAVE AND PUBLISH ADM");
    });
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }
});
