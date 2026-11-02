document.addEventListener('DOMContentLoaded', () => {
  let currentPin = sessionStorage.getItem('pklp_teacher_pin') || '';
  let allSubmissions = [];

  const pinModal = document.getElementById('pin-modal');
  const inputPin = document.getElementById('input-pin');
  const btnUnlock = document.getElementById('btn-unlock');
  const pinError = document.getElementById('pin-error');
  const adminMain = document.getElementById('admin-main');

  const btnRefresh = document.getElementById('btn-refresh');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const filterSection = document.getElementById('filter-section');
  const tbody = document.getElementById('submissions-tbody');

  const sectionsList = document.getElementById('sections-list');
  const inputNewSection = document.getElementById('input-new-section');
  const btnAddSection = document.getElementById('btn-add-section');
  const sectionsStatus = document.getElementById('sections-status');
  let sectionChoices = [];

  // Check saved PIN
  if (currentPin) {
    loadDashboard(currentPin);
  }

  btnUnlock.addEventListener('click', () => {
    const pin = inputPin.value.trim();
    if (!pin) return;
    loadDashboard(pin);
  });

  inputPin.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      btnUnlock.click();
    }
  });

  btnRefresh.addEventListener('click', () => {
    if (currentPin) loadDashboard(currentPin);
  });

  btnExportCsv.addEventListener('click', () => {
    if (!currentPin) return;
    window.location.href = `/api/admin/export-csv?pin=${encodeURIComponent(currentPin)}`;
  });

  filterSection.addEventListener('change', () => {
    renderTable(allSubmissions);
  });

  function loadDashboard(pin) {
    fetch(`/api/admin/results?pin=${encodeURIComponent(pin)}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        currentPin = pin;
        sessionStorage.setItem('pklp_teacher_pin', pin);
        pinModal.classList.add('hidden');
        adminMain.classList.remove('hidden');

        document.getElementById('admin-lesson-title').textContent = data.lessonTitle;
        document.getElementById('metric-total-students').textContent = data.totalStudents;
        document.getElementById('metric-avg-score').textContent = `${data.averageScore} / ${data.totalQuestions}`;

        allSubmissions = data.submissions;

        // Calculate passing rate (>= 2 / 3)
        const passingCount = allSubmissions.filter(s => s.score >= 2).length;
        const passRate = data.totalStudents > 0 
          ? Math.round((passingCount / data.totalStudents) * 100)
          : 0;
        document.getElementById('metric-pass-rate').textContent = `${passRate}%`;

        // Update Section filter options
        updateSectionFilter(allSubmissions);

        // Render table
        renderTable(allSubmissions);

        loadSections();
      })
      .catch(() => {
        pinError.classList.remove('hidden');
        sessionStorage.removeItem('pklp_teacher_pin');
      });
  }

  // Section choices for students (editable list)
  btnAddSection.addEventListener('click', () => {
    const name = inputNewSection.value.replace(/\s+/g, ' ').trim();
    if (!name) return;
    if (sectionChoices.some(s => s.toLowerCase() === name.toLowerCase())) {
      sectionsStatus.textContent = `Nasa listahan na ang "${name}".`;
      return;
    }
    saveSections([...sectionChoices, name], () => { inputNewSection.value = ''; });
  });

  inputNewSection.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnAddSection.click();
  });

  function loadSections() {
    fetch('/api/sections?_t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        sectionChoices = data.sections || [];
        renderSections();
      })
      .catch(() => { sectionsStatus.textContent = '⚠️ Hindi ma-load ang mga seksiyon.'; });
  }

  function saveSections(next, onSaved) {
    sectionsStatus.textContent = 'Ini-save...';
    fetch('/api/admin/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-teacher-pin': currentPin },
      body: JSON.stringify({ sections: next })
    })
      .then(r => {
        if (!r.ok) throw new Error('Save failed');
        return r.json();
      })
      .then(data => {
        sectionChoices = data.sections;
        renderSections();
        sectionsStatus.textContent = '✓ Nai-save';
        if (onSaved) onSaved();
      })
      .catch(() => { sectionsStatus.textContent = '⚠️ Hindi na-save. Pakisubukang muli.'; });
  }

  function renderSections() {
    sectionsList.innerHTML = '';
    if (sectionChoices.length === 0) {
      sectionsList.innerHTML = '<span style="color: var(--danger); font-size: 0.85rem;">Wala pang seksiyon. Hindi makakapagsimula ang mga mag-aaral hangga\'t walang naidaragdag.</span>';
      return;
    }
    sectionChoices.forEach(sec => {
      const chip = document.createElement('span');
      chip.className = 'badge';
      chip.style.cssText = 'background: #e2e8f0; color: #334155; display: inline-flex; align-items: center; gap: 6px; padding: 6px 6px 6px 12px; font-size: 0.85rem;';
      chip.textContent = sec;

      const btnRemove = document.createElement('button');
      btnRemove.type = 'button';
      btnRemove.textContent = '✕';
      btnRemove.setAttribute('aria-label', `Tanggalin ang ${sec}`);
      btnRemove.style.cssText = 'border: none; background: #cbd5e1; color: #334155; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 0.75rem; line-height: 1;';
      btnRemove.addEventListener('click', () => {
        if (!confirm(`Tanggalin ang "${sec}" sa listahan ng seksiyon?`)) return;
        saveSections(sectionChoices.filter(s => s !== sec));
      });

      chip.appendChild(btnRemove);
      sectionsList.appendChild(chip);
    });
  }

  function updateSectionFilter(submissions) {
    const sections = Array.from(new Set(submissions.map(s => s.section))).sort();
    const currentVal = filterSection.value;

    filterSection.innerHTML = '<option value="ALL">Lahat ng Seksiyon</option>';
    sections.forEach(sec => {
      const opt = document.createElement('option');
      opt.value = sec;
      opt.textContent = sec;
      filterSection.appendChild(opt);
    });

    if (sections.includes(currentVal)) {
      filterSection.value = currentVal;
    }
  }

  function renderTable(submissions) {
    const selectedSection = filterSection.value;
    const filtered = selectedSection === 'ALL'
      ? submissions
      : submissions.filter(s => s.section === selectedSection);

    document.getElementById('table-count-label').textContent = `Ipinapakita: ${filtered.length} mag-aaral`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px;">
            Walang nakitang resulta para sa seksiyong ito.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = '';
    filtered.forEach((sub, idx) => {
      const tr = document.createElement('tr');
      const answers = sub.answers || {};
      const pct = Math.round((sub.score / sub.total_questions) * 100);

      const q1Badge = answers.cp1?.correct 
        ? '<span class="badge-correct">✓ Tumpak</span>' 
        : '<span class="badge-wrong">✗ Mali</span>';
      const q2Badge = answers.cp2?.correct 
        ? '<span class="badge-correct">✓ Tumpak</span>' 
        : '<span class="badge-wrong">✗ Mali</span>';
      const q3Badge = answers.cp3?.correct 
        ? '<span class="badge-correct">✓ Tumpak</span>' 
        : '<span class="badge-wrong">✗ Mali</span>';

      const dateStr = new Date(sub.created_at).toLocaleString('fil-PH', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      tr.innerHTML = `
        <td style="color: var(--text-muted);">${idx + 1}</td>
        <td><strong>${escapeHtml(sub.student_name)}</strong></td>
        <td><span class="badge" style="background: #e2e8f0; color: #334155;">${escapeHtml(sub.section)}</span></td>
        <td style="text-align: center;">${q1Badge}</td>
        <td style="text-align: center;">${q2Badge}</td>
        <td style="text-align: center;">${q3Badge}</td>
        <td style="text-align: center; font-weight: 700; color: var(--primary);">${sub.score}/${sub.total_questions}</td>
        <td style="text-align: center; font-weight: 600;">${pct}%</td>
        <td style="font-size: 0.82rem; color: var(--text-muted);">${dateStr}</td>
      `;

      tbody.appendChild(tr);
    });
  }

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
