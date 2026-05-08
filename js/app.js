/*
================================================================================
  SHIPPING WITH PURPOSE — app.js
  Shared JavaScript for all 4 pages.
  Include as: <script src="js/app.js" defer></script>
================================================================================
*/

/* ============================================================
   NAV HAMBURGER TOGGLE
   ============================================================ */
(function initNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  let menuOpen = false;

  hamburger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    hamburger.textContent = menuOpen ? '✕' : '☰';
  });

  document.querySelectorAll('.nav__menu-link, .nav__menu-cta').forEach((el) => {
    el.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      hamburger.textContent = '☰';
    });
  });
})();

/* ============================================================
   SCROLL FADE-IN (IntersectionObserver)
   ============================================================ */
(function initFadeIn() {
  const sections = document.querySelectorAll('.fade-section');
  if (!sections.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  sections.forEach((el) => obs.observe(el));
})();

/* ============================================================
   LABEL UPLOAD DROP ZONE (index.html)
   ============================================================ */
(function initDropZone() {
  const dz = document.getElementById('drop-zone');
  if (!dz) return;

  dz.addEventListener('click', () => {
    const inp = document.getElementById('file-input');
    if (inp) inp.click();
  });

  dz.addEventListener('dragover', (e) => {
    e.preventDefault();
    dz.classList.add('dragging');
  });

  dz.addEventListener('dragleave', () => dz.classList.remove('dragging'));

  dz.addEventListener('drop', (e) => {
    e.preventDefault();
    dz.classList.remove('dragging');
    const file = e.dataTransfer.files[0];
    if (file) showUploadedFile(file);
  });

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) showUploadedFile(file);
  }
  window.handleFileSelect = handleFileSelect; // expose for inline onchange

  function showUploadedFile(file) {
    dz.classList.add('has-file');
    dz.innerHTML = `
      <div class="drop-zone__icon">✅</div>
      <div class="drop-zone__title">Label ready: ${escHtml(file.name)}</div>
      <p class="drop-zone__sub">Bring your ID to the counter — we'll print this for you on arrival.</p>
      <button class="btn btn--ghost drop-zone__reset-btn" id="reset-dz">Upload a different file</button>
    `;
    document.getElementById('reset-dz').addEventListener('click', (e) => {
      e.stopPropagation();
      resetDropZone();
    });
  }

  function resetDropZone() {
    dz.classList.remove('has-file', 'dragging');
    dz.innerHTML = `
      <div class="drop-zone__icon">📤</div>
      <div class="drop-zone__title">Drag &amp; drop your label here</div>
      <p class="drop-zone__sub">or click to browse files &nbsp;·&nbsp; PDF, PNG, JPG accepted</p>
      <span class="btn btn--navy-sm drop-zone__fake-btn">Select File</span>
      <input type="file" id="file-input" accept=".pdf,.png,.jpg,.jpeg" class="hidden-file-input" />
    `;
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
  }

  // Hook initial file input
  const initInp = document.getElementById('file-input');
  if (initInp) initInp.addEventListener('change', handleFileSelect);
})();

/* ============================================================
   MAILBOX QUOTE CALCULATOR (mailboxes.html)
   ============================================================ */
(function initQuote() {
  const PRICING = {
    Mini: { '3-Month': 57, '6-Month': 108, '12-Month': 204 },
    Personal: { '3-Month': 72, '6-Month': 138, '12-Month': 252 },
    Business: { '3-Month': 78, '6-Month': 150, '12-Month': 276 },
    Corporate: { '3-Month': 123, '6-Month': 236, '12-Month': 432 },
  };
  const NOTIF = { '3-Month': 3, '6-Month': 6, '12-Month': 12 };

  const quoteSection = document.getElementById('quote-calculator');
  if (!quoteSection) return;

  let selectedSize = 'Personal';
  let selectedTerm = '3-Month';
  let notifications = false;

  function updateQuote() {
    const base = PRICING[selectedSize][selectedTerm];
    const notifCost = notifications ? NOTIF[selectedTerm] : 0;
    const total = base + notifCost;
    const months = parseInt(selectedTerm);
    const monthly = (total / months).toFixed(2);

    // Update price
    document.getElementById('q-price').textContent = '$' + total.toFixed(2);
    document.getElementById('q-monthly').textContent = '~$' + monthly + '/month';
    document.getElementById('q-config').textContent = selectedSize + ' Box · ' + selectedTerm;

    // Update items list
    const items = [
      selectedSize + ' Mailbox',
      selectedTerm + ' Rental — $' + base.toFixed(2),
      ...(notifications ? ['Mail Notifications — +$' + notifCost] : []),
      'All carriers accepted',
      'USPS Form 1583 Required',
    ];
    const list = document.getElementById('q-items');
    list.innerHTML = items
      .map(
        (i) =>
          `<div class="quote-card__item"><span class="quote-card__check">✓</span> ${escHtml(i)}</div>`
      )
      .join('');

    // Update size buttons
    document.querySelectorAll('.size-btn').forEach((btn) => {
      btn.classList.toggle('size-btn--active', btn.dataset.size === selectedSize);
    });

    // Update term buttons
    document.querySelectorAll('.term-btn').forEach((btn) => {
      btn.classList.toggle('term-btn--active', btn.dataset.term === selectedTerm);
    });

    // Update addon badge text
    const addonBadge = document.getElementById('addon-badge');
    if (addonBadge) addonBadge.textContent = '+$' + NOTIF[selectedTerm] + ' (' + selectedTerm + ')';

    // Update addon button state
    const addonBtn = document.getElementById('addon-btn');
    if (addonBtn) addonBtn.classList.toggle('addon-btn--active', notifications);
  }

  // Attach size button events
  document.querySelectorAll('.size-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedSize = btn.dataset.size;
      updateQuote();
    });
  });

  // Attach term button events
  document.querySelectorAll('.term-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedTerm = btn.dataset.term;
      updateQuote();
    });
  });

  // Attach addon toggle
  const addonBtn = document.getElementById('addon-btn');
  if (addonBtn) {
    addonBtn.addEventListener('click', () => {
      notifications = !notifications;
      updateQuote();
    });
  }

  updateQuote();
})();

/* ============================================================
   FAQ ACCORDION (contact.html)
   ============================================================ */
(function initFAQ() {
  document.querySelectorAll('.faq-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach((el) => el.classList.remove('open'));
      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });
})();

/* ============================================================
   CONTACT FORM (contact.html)
   ============================================================ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const container = document.getElementById('contact-form-container');
    if (!container) return;
    container.innerHTML = `
      <div class="form-success">
        <div class="form-success__icon">✅</div>
        <h3>Message sent!</h3>
        <p class="form-success__text">We'll get back to you as soon as possible.</p>
        <button class="btn btn--navy" onclick="location.reload()">Send Another</button>
      </div>
    `;
  });
})();

/* ============================================================
   UTILITY: HTML escape
   ============================================================ */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
