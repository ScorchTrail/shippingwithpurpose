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
   PRINT PORTAL FORM + DROP ZONE (index.html)
   ============================================================ */
(function initPrintPortal() {
  const form = document.getElementById('print-portal-form');
  const dz = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('uploaded-doc-list');
  const emptyState = document.getElementById('uploaded-doc-empty');
  const feedback = document.getElementById('print-portal-feedback');

  if (!form || !dz || !fileInput || !fileList || !emptyState || !feedback) return;

  const uploadedFiles = [];

  dz.addEventListener('click', () => fileInput.click());

  dz.addEventListener('dragover', (e) => {
    e.preventDefault();
    dz.classList.add('dragging');
  });

  dz.addEventListener('dragleave', () => dz.classList.remove('dragging'));

  dz.addEventListener('drop', (e) => {
    e.preventDefault();
    dz.classList.remove('dragging');
    addFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', (e) => addFiles(e.target.files));

  fileList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-remove-index]');
    if (!btn) return;
    const idx = Number(btn.dataset.removeIndex);
    if (Number.isNaN(idx)) return;
    uploadedFiles.splice(idx, 1);
    renderFileList();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!uploadedFiles.length) {
      feedback.textContent = 'Please upload at least one document before sending.';
      feedback.className = 'print-portal-form__feedback print-portal-form__feedback--error';
      return;
    }

    const payload = {
      name: document.getElementById('portal-name')?.value?.trim() || '',
      phone: document.getElementById('portal-phone')?.value?.trim() || '',
      printType: document.getElementById('portal-color')?.value || 'Black & White',
      copies: document.getElementById('portal-copies')?.value || '1',
      files: uploadedFiles.map((f) => ({
        name: f.name,
        sizeBytes: f.size,
        type: f.type || 'unknown',
      })),
    };

    // Placeholder for next phase email service integration.
    console.log('Print portal payload (email integration pending):', payload);

    feedback.textContent = 'Request captured. Next step is connecting this form to email delivery.';
    feedback.className = 'print-portal-form__feedback print-portal-form__feedback--success';
  });

  function addFiles(fileCollection) {
    if (!fileCollection || !fileCollection.length) return;

    Array.from(fileCollection).forEach((file) => {
      const exists = uploadedFiles.some(
        (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
      );
      if (!exists) uploadedFiles.push(file);
    });

    fileInput.value = '';
    renderFileList();
  }

  function renderFileList() {
    if (!uploadedFiles.length) {
      emptyState.style.display = 'block';
      fileList.innerHTML = '';
      dz.classList.remove('has-file');
      return;
    }

    dz.classList.add('has-file');
    emptyState.style.display = 'none';
    fileList.innerHTML = uploadedFiles
      .map(
        (file, index) => `
        <li class="print-portal-files__item">
          <div>
            <div class="print-portal-files__name">${escHtml(file.name)}</div>
            <div class="print-portal-files__meta">${formatFileSize(file.size)}</div>
          </div>
          <button type="button" class="print-portal-files__remove" data-remove-index="${index}">
            Remove
          </button>
        </li>
      `
      )
      .join('');
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
})();

/* ============================================================
   SHARED MAILBOX CONTENT (index.html + mailboxes.html)
   ============================================================ */
const MAILBOX_FALLBACK_CONTENT = {
  hero: {
    badge: 'Most Popular',
    title: 'Mailbox Rentals',
    subtitle: 'Your personal or business address - secure, private, and professional.',
  },
  cta: {
    badge: 'Most Popular Service',
    headingLine1: 'Get a real street address.',
    headingEmphasis: 'Not a P.O. Box.',
    body:
      'A private mailbox with a real street address - perfect for small businesses, remote workers, and anyone who values their privacy.',
    buttonLabel: 'See Pricing & Rent Now ->',
  },
  quote: {
    defaultSize: 'Personal',
    defaultTerm: '3-Month',
    cardLabel: 'Your Quote',
    reserveLabel: 'Reserve Your Box ->',
    pricingTriggerLabel: 'View full pricing breakdown',
    labels: { size: 'Box Size', term: 'Rental Term', addons: 'Add-ons' },
    addon: {
      title: 'Mail Notifications',
      description: 'Get notified when mail or packages arrive - via email or phone. $1/month added to your rental.',
      pricePerMonth: 1,
    },
  },
  plans: {
    Mini: {
      tag: 'Budget-Friendly',
      label: 'Mini Box',
      caption: 'Minimal volume, maximum savings',
      disclaimer: '2026 pricing',
      description: 'Perfect for individuals receiving minimal mail.',
      pricing: { '3-Month': 57, '6-Month': 108, '12-Month': 204 },
    },
    Personal: {
      tag: 'Most Popular',
      label: 'Personal',
      caption: 'Perfect for remote workers & vacations',
      disclaimer: '2026 pricing',
      description: 'Great for individuals with moderate mail volume.',
      pricing: { '3-Month': 72, '6-Month': 138, '12-Month': 252 },
    },
    Business: {
      tag: '10+ Members',
      label: 'Business',
      caption: 'Team-friendly with ample storage',
      disclaimer: '2026 pricing',
      description: 'Ideal for small businesses with regular shipments.',
      pricing: { '3-Month': 78, '6-Month': 150, '12-Month': 276 },
    },
    Corporate: {
      tag: 'Max Storage',
      label: 'Corporate',
      caption: 'Enterprise capacity, maximum flexibility',
      disclaimer: '2026 pricing',
      description: 'Best for high-volume businesses needing extra space.',
      pricing: { '3-Month': 123, '6-Month': 236, '12-Month': 432 },
    },
  },
};

let mailboxContentPromise = null;

function getMailboxContentPath() {
  return window.location.pathname.toLowerCase().includes('/public/')
    ? 'data/mailbox-content.json'
    : 'public/data/mailbox-content.json';
}

function loadMailboxContent() {
  if (mailboxContentPromise) return mailboxContentPromise;

  mailboxContentPromise = fetch(getMailboxContentPath(), { headers: { Accept: 'application/json' } })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load mailbox content');
      return res.json();
    })
    .then((data) => ({ ...MAILBOX_FALLBACK_CONTENT, ...data }))
    .catch(() => MAILBOX_FALLBACK_CONTENT);

  return mailboxContentPromise;
}

function getByPath(source, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), source);
}

(function initMailboxLinkedContent() {
  const hasMailboxBindings =
    document.querySelector('[data-mailbox-field]') ||
    document.querySelector('[data-mailbox-plan]') ||
    document.querySelector('[data-mailbox-plan-name]');
  if (!hasMailboxBindings) return;

  loadMailboxContent().then((content) => {
    document.querySelectorAll('[data-mailbox-field]').forEach((el) => {
      const value = getByPath(content, el.dataset.mailboxField || '');
      if (typeof value === 'string') el.textContent = value;
    });

    const defaultTermNumber = String(content.quote?.defaultTerm || '3-Month').split('-')[0];

    document.querySelectorAll('[data-mailbox-plan]').forEach((tile) => {
      const planName = tile.dataset.mailboxPlan;
      const plan = content.plans?.[planName];
      if (!plan) return;

      tile.querySelectorAll('[data-mailbox-plan-field]').forEach((fieldEl) => {
        const fieldName = fieldEl.dataset.mailboxPlanField;
        if (fieldName === 'price') {
          const price = plan.pricing?.['3-Month'];
          if (typeof price === 'number') fieldEl.textContent = '$' + price;
          return;
        }

        if (typeof plan[fieldName] === 'string') fieldEl.textContent = plan[fieldName];
      });

      const href = tile.getAttribute('href') || '';
      const baseHref = href.split('?')[0] || 'public/mailboxes.html';
      tile.setAttribute('href', `${baseHref}?box=${planName.toLowerCase()}&term=${defaultTermNumber}`);
    });

    document.querySelectorAll('[data-mailbox-plan-name]').forEach((el) => {
      const planName = el.dataset.mailboxPlanName;
      if (planName) el.textContent = planName;
    });

    document.querySelectorAll('[data-mailbox-plan-desc]').forEach((el) => {
      const planName = el.dataset.mailboxPlanDesc;
      const plan = content.plans?.[planName];
      if (plan?.description) el.textContent = plan.description;
    });
  });
})();

/* ============================================================
   MAILBOX QUOTE CALCULATOR (mailboxes.html)
   ============================================================ */
(function initQuote() {
  const quoteSection = document.getElementById('quote-calculator');
  if (!quoteSection) return;

  loadMailboxContent().then((content) => {
    const PRICING = Object.fromEntries(
      Object.entries(content.plans || {}).map(([name, plan]) => [name, plan.pricing || {}])
    );

    if (!Object.keys(PRICING).length) return;

    const perMonthAddon = Number(content.quote?.addon?.pricePerMonth || 1);
    const NOTIF = {
      '3-Month': 3 * perMonthAddon,
      '6-Month': 6 * perMonthAddon,
      '12-Month': 12 * perMonthAddon,
    };

    let selectedSize = PRICING[content.quote?.defaultSize] ? content.quote.defaultSize : 'Personal';
    let selectedTerm = content.quote?.defaultTerm || '3-Month';
    let notifications = true;

    // Parse URL parameters for pre-selection
    (function parseUrlParams() {
      const params = new URLSearchParams(window.location.search);
      const boxParam = params.get('box');
      const termParam = params.get('term');

      if (boxParam) {
        const boxMap = { mini: 'Mini', personal: 'Personal', business: 'Business', corporate: 'Corporate' };
        const mappedSize = boxMap[boxParam.toLowerCase()];
        if (mappedSize && PRICING[mappedSize]) selectedSize = mappedSize;
      }

      if (termParam) {
        const termValue = termParam + '-Month';
        if (PRICING[selectedSize] && PRICING[selectedSize][termValue]) selectedTerm = termValue;
      }

      if (!PRICING[selectedSize]?.[selectedTerm]) selectedTerm = '3-Month';
    })();

    function updateQuote() {
      const base = PRICING[selectedSize][selectedTerm];
      const notifCost = notifications ? NOTIF[selectedTerm] : 0;
      const total = base + notifCost;
      const months = parseInt(selectedTerm, 10);
      const monthly = (total / months).toFixed(2);

      document.getElementById('q-price').textContent = '$' + total.toFixed(2);
      document.getElementById('q-monthly').textContent = '~$' + monthly + '/month';
      document.getElementById('q-config').textContent = selectedSize + ' Box · ' + selectedTerm;

      const addonTitle = content.quote?.addon?.title || 'Mail Notifications';
      const items = [
        selectedSize + ' Mailbox',
        selectedTerm + ' Rental — $' + base.toFixed(2),
        ...(notifications ? [addonTitle + ' — +$' + notifCost] : []),
        'All carriers accepted',
        'USPS Form 1583 Required',
      ];
      const list = document.getElementById('q-items');
      list.innerHTML = items
        .map((i) => `<div class="quote-card__item"><span class="quote-card__check">✓</span> ${escHtml(i)}</div>`)
        .join('');

      document.querySelectorAll('.size-btn').forEach((btn) => {
        btn.classList.toggle('size-btn--active', btn.dataset.size === selectedSize);
      });

      document.querySelectorAll('.term-btn').forEach((btn) => {
        btn.classList.toggle('term-btn--active', btn.dataset.term === selectedTerm);
      });

      const addonBadge = document.getElementById('addon-badge');
      if (addonBadge) addonBadge.textContent = '+$' + NOTIF[selectedTerm] + ' (' + selectedTerm + ')';

      const addonBtn = document.getElementById('addon-btn');
      if (addonBtn) addonBtn.classList.toggle('addon-btn--active', notifications);
    }

    document.querySelectorAll('.size-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedSize = btn.dataset.size;
        if (!PRICING[selectedSize]?.[selectedTerm]) selectedTerm = '3-Month';
        updateQuote();
      });
    });

    document.querySelectorAll('.term-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedTerm = btn.dataset.term;
        updateQuote();
      });
    });

    const addonBtn = document.getElementById('addon-btn');
    if (addonBtn) {
      addonBtn.addEventListener('click', () => {
        notifications = !notifications;
        updateQuote();
        const icon = addonBtn.querySelector('.addon-icon');
        if (icon) {
          icon.style.transform = 'scale(0)';
          setTimeout(() => {
            icon.textContent = notifications ? '✓' : '◯';
            icon.style.transform = 'scale(1)';
            icon.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
          }, 100);
        }
      });
    }

    updateQuote();
  });
})();

/* ============================================================
   PRICING MODAL (mailboxes.html)
   ============================================================ */
(function initPricingModal() {
  const trigger = document.getElementById('pricing-table-trigger');
  const modal = document.getElementById('pricing-modal');
  const closeBtn = document.querySelector('.pricing-modal__close');

  if (!trigger || !modal || !closeBtn) return;

  function openModal() {
    modal.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Open modal on trigger click
  trigger.addEventListener('click', openModal);

  // Close on close button click
  closeBtn.addEventListener('click', closeModal);

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === modal.querySelector('.pricing-modal__overlay')) {
      closeModal();
    }
  });
})();


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

/* ============================================================   LIVE REVIEWS GALLERY (index.html)
   ============================================================ */
(function initLiveReviews() {
  const gallery = document.getElementById('reviews-gallery');
  const track = document.getElementById('reviews-track');
  if (!gallery || !track) return;

  fetch('/api/reviews', { headers: { Accept: 'application/json' } })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    })
    .then((data) => {
      const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
      if (!reviews.length) {
        track.innerHTML = fallbackReviewMarkup('No live reviews available yet.');
        return;
      }

      const baseReviews = reviews.slice(0, 10);
      while (baseReviews.length > 0 && baseReviews.length < 3) {
        baseReviews.push(...baseReviews.slice(0, 3 - baseReviews.length));
      }
      const loopReviews = baseReviews.concat(baseReviews);
      track.innerHTML = loopReviews.map((review) => reviewCardMarkup(review)).join('');
      startAutoScroll();
    })
    .catch(() => {
      track.innerHTML = fallbackReviewMarkup('Unable to load reviews right now.');
    });

  function startAutoScroll() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId = null;
    let paused = false;
    const speed = 0.35;

    const animate = () => {
      if (!paused) {
        gallery.scrollLeft += speed;
        const loopPoint = track.scrollWidth / 2;
        if (gallery.scrollLeft >= loopPoint) {
          gallery.scrollLeft = 0;
        }
      }
      rafId = requestAnimationFrame(animate);
    };

    gallery.addEventListener('mouseenter', () => {
      paused = true;
    });
    gallery.addEventListener('mouseleave', () => {
      paused = false;
    });
    gallery.addEventListener('focusin', () => {
      paused = true;
    });
    gallery.addEventListener('focusout', () => {
      paused = false;
    });

    rafId = requestAnimationFrame(animate);

    window.addEventListener(
      'beforeunload',
      () => {
        if (rafId) cancelAnimationFrame(rafId);
      },
      { once: true }
    );
  }

  function fallbackReviewMarkup(message) {
    return `
      <article class="review-card review-card--placeholder">
        <div class="review-card__top">
          <div class="review-card__avatar">i</div>
          <div class="review-card__identity">
            <div class="review-card__name">Live Reviews</div>
            <div class="review-card__meta">Google &amp; Yelp</div>
          </div>
        </div>
        <p class="review-card__text">${escHtml(message)}</p>
      </article>
    `;
  }

  function renderStars(rating) {
    const starPath = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
    return Array.from({ length: 5 }, (_, i) => {
      const mod = i < rating ? 'full' : 'empty';
      return `<svg class="star-svg star-svg--${mod}" viewBox="0 0 24 24" aria-hidden="true"><path d="${starPath}"/></svg>`;
    }).join('');
  }

  function reviewCardMarkup(review) {
    const name = review?.authorName || 'Guest';
    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');

    const rating = Math.max(1, Math.min(5, Number(review?.rating) || 5));
    const stars = renderStars(rating);
    const source = review?.source === 'google' ? 'Google' : 'Yelp';

    return `
      <article class="review-card" role="article">
        <div class="review-card__top">
          <div class="review-card__avatar">${escHtml(initials || 'G')}</div>
          <div class="review-card__identity">
            <div class="review-card__name">${escHtml(name)}</div>
            <div class="review-card__meta">${escHtml(review?.relativeTime || 'Recent review')}</div>
          </div>
          <span class="review-card__source">${escHtml(source)}</span>
        </div>
        <div class="review-card__rating-row">
          <div class="review-card__stars" aria-label="${rating} out of 5 stars">${stars}</div>
          <span class="review-card__time">${escHtml(review?.publishedAt || '')}</span>
        </div>
        <p class="review-card__text">${escHtml(review?.text || '')}</p>
      </article>
    `;
  }
})();

/* ============================================================   CONTACT FORM (contact.html)
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
   RESERVATION MODAL (mailboxes.html + homepage CTA)
   ============================================================ */
(function initReservationModal() {
  const modal = document.getElementById('reservation-modal');
  const closeBtn = document.querySelector('.reservation-modal__close');
  const form = document.getElementById('reservation-form');
  const requirementsList = document.getElementById('reservation-requirements-list');

  if (!modal || !closeBtn) return;

  // Find all "Reserve Your Box" buttons/links and attach modal trigger
  const reserveButtons = document.querySelectorAll(
    '[onclick*="reservation-modal"], .quote-cta, [data-action="reserve"]'
  );

  function openModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus on first form input for accessibility
    const firstInput = form?.querySelector('input[type="text"]');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    // Reset form
    if (form) form.reset();
  }

  // Attach to all reserve buttons
  document.querySelectorAll('.mailbox-cta__tile--price, .quote-cta').forEach((btn) => {
    btn.addEventListener('click', openModal);
  });

  // Close button
  closeBtn.addEventListener('click', closeModal);

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === modal.querySelector('.reservation-modal__overlay')) {
      closeModal();
    }
  });

  // Form submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = {
        name: form.querySelector('input[name="name"]').value,
        company: form.querySelector('input[name="company"]').value,
        phone: form.querySelector('input[name="phone"]').value,
        email: form.querySelector('input[name="email"]').value,
      };
      console.log('Reservation form submitted:', formData);
      // Placeholder: Next phase will connect to email/backend service
      alert('Thank you! We received your information. Please visit us in person to complete the mailbox setup.');
      closeModal();
    });
  }

  // Populate requirements list from JSON
  function populateRequirements(requirementsData) {
    if (!requirementsList || !requirementsData || !Array.isArray(requirementsData.items)) return;
    requirementsList.innerHTML = requirementsData.items
      .map((item) => `<li class="reservation-requirements__item">${escHtml(item)}</li>`)
      .join('');
  }

  // Load mailbox content JSON and bind everything
  fetch('data/mailbox-content.json')
    .then((res) => res.json())
    .then((data) => {
      window.mailboxContent = data;

      // Bind reservation modal from JSON
      if (data.reservation) {
        const res = data.reservation;
        const bindData = (selector, value) => {
          const el = document.querySelector(selector);
          if (el) el.textContent = value;
        };

        bindData('[data-bind-reservation-title]', res.title);
        bindData('[data-bind-reservation-subtitle]', res.subtitle);
        bindData('[data-bind-form-name-label]', res.formLabels.name);
        bindData('[data-bind-form-company-label]', res.formLabels.company);
        bindData('[data-bind-form-company-hint]', res.formLabels.companyHint);
        bindData('[data-bind-form-phone-label]', res.formLabels.phone);
        bindData('[data-bind-form-email-label]', res.formLabels.email);
        bindData('[data-bind-form1583-heading]', res.form1583.heading);
        bindData('[data-bind-form1583-description]', res.form1583.description);
        bindData('[data-bind-form1583-fill-online]', res.form1583.fillOnline);
        bindData('[data-bind-form1583-download]', res.form1583.download);
        bindData('[data-bind-requirements-heading]', res.requirements.heading);
        bindData('[data-bind-requirements-intro]', res.requirements.intro);
        bindData('[data-bind-legal-text]', res.legalText);
        bindData('[data-bind-reservation-cta]', res.cta);

        // Populate requirements list
        populateRequirements(res.requirements);
      }
    })
    .catch((err) => console.error('Failed to load mailbox content:', err));
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
