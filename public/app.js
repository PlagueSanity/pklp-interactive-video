document.addEventListener('DOMContentLoaded', () => {
  let lesson = null;
  let currentStudent = { name: '', section: '' };
  let studentAnswers = {};
  let answeredCheckpoints = new Set();
  let activeCheckpoint = null;
  let maxAllowedTime = 0;

  // DOM Elements
  const regOverlay = document.getElementById('registration-overlay');
  const playerContainer = document.getElementById('player-container');
  const completionSection = document.getElementById('completion-section');

  const studentForm = document.getElementById('student-form');
  const studentNameInput = document.getElementById('student-name');
  const studentSectionSelect = document.getElementById('student-section');

  const video = document.getElementById('lesson-video');
  const btnPlayPause = document.getElementById('btn-play-pause');

  const checkpointOverlay = document.getElementById('checkpoint-overlay');
  const cpIndicator = document.getElementById('cp-indicator');
  const cpQuestionText = document.getElementById('cp-question-text');
  const cpOptionsContainer = document.getElementById('cp-options-container');
  const cpFeedback = document.getElementById('cp-feedback');
  const btnSubmitAnswer = document.getElementById('btn-submit-answer');
  const btnContinueVideo = document.getElementById('btn-continue-video');

  const progressBar = document.getElementById('progress-bar');

  // 1. Fetch Lesson Data
  fetch('/api/lesson')
    .then(res => res.json())
    .then(data => {
      lesson = data;
      document.getElementById('lesson-header-title').textContent = lesson.title;
      document.getElementById('lesson-header-subject').textContent = lesson.subject;
      document.getElementById('reg-lesson-title').textContent = lesson.title;
      document.getElementById('reg-lesson-desc').textContent = lesson.description;
      document.getElementById('now-playing-title').textContent = lesson.title;
      document.getElementById('checkpoint-badge').textContent = `${lesson.checkpoints.length} Checkpoints`;

      // Set video src directly and load
      video.src = lesson.videoUrl;
      video.load();
    })
    .catch(err => {
      console.error('Error loading lesson:', err);
      alert('Hindi ma-load ang aralin. Pakisubukang i-refresh.');
    });

  // 2. Start Lesson on Student Form Submit
  studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = studentNameInput.value.trim();
    const section = studentSectionSelect.value;

    if (!name || !section) return;

    currentStudent = { name, section };
    document.getElementById('tag-student-name').textContent = name;
    document.getElementById('tag-student-section').textContent = section;

    // Hide registration overlay and play video
    regOverlay.classList.add('hidden');

    video.play()
      .then(() => {
        btnPlayPause.textContent = '⏸ Pause';
      })
      .catch((err) => {
        console.log('Autoplay prevented, user must tap play:', err);
        btnPlayPause.textContent = '▶ Play';
      });
  });

  // Play/Pause Button
  btnPlayPause.addEventListener('click', () => {
    if (!currentStudent.name) {
      alert('Pakilagay muna ang iyong pangalan at seksiyon.');
      return;
    }

    if (video.paused) {
      video.play();
      btnPlayPause.textContent = '⏸ Pause';
    } else {
      video.pause();
      btnPlayPause.textContent = '▶ Play';
    }
  });

  video.addEventListener('play', () => {
    btnPlayPause.textContent = '⏸ Pause';
  });

  video.addEventListener('pause', () => {
    btnPlayPause.textContent = '▶ Play';
  });

  // Prevent seeking forward past highest completed checkpoint
  video.addEventListener('seeking', () => {
    if (video.currentTime > maxAllowedTime + 1.5) {
      video.currentTime = maxAllowedTime;
    }
  });

  // 3. Monitor Video Playback & Trigger Checkpoints
  video.addEventListener('timeupdate', () => {
    if (!lesson) return;

    // Update progress bar
    if (video.duration) {
      const pct = (video.currentTime / video.duration) * 100;
      progressBar.style.width = `${pct}%`;
    }

    if (video.currentTime > maxAllowedTime) {
      maxAllowedTime = video.currentTime;
    }

    // Check for triggered checkpoint
    const currentSecond = Math.floor(video.currentTime);
    const cp = lesson.checkpoints.find(c => 
      c.timestamp <= currentSecond && !answeredCheckpoints.has(c.id)
    );

    if (cp && activeCheckpoint !== cp.id) {
      triggerCheckpoint(cp);
    }
  });

  // When video ends, submit results if not yet submitted
  video.addEventListener('ended', () => {
    finishLesson();
  });

  // 4. Trigger Checkpoint Overlay
  function triggerCheckpoint(cp) {
    activeCheckpoint = cp.id;
    video.pause();

    const cpIndex = lesson.checkpoints.findIndex(c => c.id === cp.id) + 1;
    cpIndicator.textContent = `Pagsusuri ${cpIndex} ng ${lesson.checkpoints.length}`;
    cpQuestionText.textContent = cp.question;

    // Render options
    cpOptionsContainer.innerHTML = '';
    cp.options.forEach(opt => {
      const optDiv = document.createElement('label');
      optDiv.className = 'option-item';
      optDiv.innerHTML = `
        <input type="radio" name="checkpoint-option" value="${opt.id}">
        <span class="option-text"><strong>${opt.id}.</strong> ${opt.text}</span>
      `;

      optDiv.addEventListener('click', () => {
        document.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
        optDiv.classList.add('selected');
        btnSubmitAnswer.disabled = false;
      });

      cpOptionsContainer.appendChild(optDiv);
    });

    // Reset overlay state
    cpFeedback.className = 'feedback-box hidden';
    cpFeedback.innerHTML = '';
    btnSubmitAnswer.classList.remove('hidden');
    btnSubmitAnswer.disabled = true;
    btnContinueVideo.classList.add('hidden');

    checkpointOverlay.classList.remove('hidden');
  }

  // 5. Submit Answer to Server
  btnSubmitAnswer.addEventListener('click', () => {
    const selectedRadio = document.querySelector('input[name="checkpoint-option"]:checked');
    if (!selectedRadio || !activeCheckpoint) return;

    const selectedOption = selectedRadio.value;
    btnSubmitAnswer.disabled = true;
    btnSubmitAnswer.textContent = 'Sinusuri...';

    fetch('/api/checkpoints/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkpointId: activeCheckpoint,
        selectedOption: selectedOption
      })
    })
    .then(res => res.json())
    .then(result => {
      studentAnswers[activeCheckpoint] = selectedOption;
      answeredCheckpoints.add(activeCheckpoint);

      // Show Feedback
      cpFeedback.classList.remove('hidden');
      if (result.isCorrect) {
        cpFeedback.className = 'feedback-box feedback-success';
        cpFeedback.innerHTML = `<strong>✓ Tumpak!</strong><br>${result.feedback}`;
      } else {
        cpFeedback.className = 'feedback-box feedback-error';
        cpFeedback.innerHTML = `<strong>✗ Maling Sagot.</strong><br>${result.feedback}`;
      }

      // Disable inputs
      document.querySelectorAll('input[name="checkpoint-option"]').forEach(input => {
        input.disabled = true;
      });

      btnSubmitAnswer.classList.add('hidden');
      btnSubmitAnswer.textContent = 'Ipasa ang Sagot';
      btnContinueVideo.classList.remove('hidden');
    })
    .catch(err => {
      console.error('Error verifying answer:', err);
      alert('Nagka-error sa pagsusuri. Pakisubukang muli.');
      btnSubmitAnswer.disabled = false;
      btnSubmitAnswer.textContent = 'Ipasa ang Sagot';
    });
  });

  // 6. Continue Video
  btnContinueVideo.addEventListener('click', () => {
    checkpointOverlay.classList.add('hidden');
    activeCheckpoint = null;

    // Advance 0.5s to avoid immediate re-trigger
    video.currentTime += 0.5;
    maxAllowedTime = video.currentTime;

    // If all checkpoints answered and video reached near end, finish
    if (answeredCheckpoints.size === lesson.checkpoints.length) {
      if (video.currentTime >= video.duration - 0.5) {
        finishLesson();
        return;
      }
    }

    video.play();
  });

  // 7. Submit Final Results to Server
  function finishLesson() {
    video.pause();
    playerContainer.classList.add('hidden');
    completionSection.classList.remove('hidden');

    fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: currentStudent.name,
        section: currentStudent.section,
        answers: studentAnswers
      })
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById('final-score').textContent = `${data.score} / ${data.total}`;
      document.getElementById('final-percentage').textContent = `${data.percentage}%`;
      progressBar.style.width = '100%';
    })
    .catch(err => {
      console.error('Error saving submission:', err);
    });
  }
});
