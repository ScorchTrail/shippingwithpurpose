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
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;
  if (hamburger.dataset.navInitialized === 'true') return;
  hamburger.dataset.navInitialized = 'true';

  let menuOpen = false;

  const iconEl = hamburger.querySelector('img');
  const menuIconSrc = iconEl
    ? (iconEl.getAttribute('src') || '').replace('close.svg', 'menu.svg')
    : '';
  const closeIconSrc = iconEl
    ? (iconEl.getAttribute('src') || '').replace('menu.svg', 'close.svg')
    : '';

  const syncMenuUi = () => {
    mobileMenu.classList.toggle('nav__menu--open', menuOpen);
    hamburger.setAttribute('aria-expanded', String(menuOpen));
    if (iconEl) {
      iconEl.setAttribute('src', menuOpen ? closeIconSrc : menuIconSrc);
    }
  };

  hamburger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    syncMenuUi();
  });

  document.querySelectorAll('.nav__menu-link, .nav__menu-cta').forEach((el) => {
    el.addEventListener('click', () => {
      menuOpen = false;
      syncMenuUi();
    });
  });

  syncMenuUi();
}

initNav();
document.addEventListener('components:loaded', initNav);

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
  const nameInput = document.getElementById('portal-name');
  const copiesInput = document.getElementById('portal-copies');

  if (!form || !dz || !fileInput || !fileList || !emptyState || !feedback) return;

  const uploadedFiles = [];

  dz.addEventListener('click', () => fileInput.click());

  dz.addEventListener('dragover', (e) => {
    e.preventDefault();
    dz.classList.add('drop-zone--dragging');
    dz.classList.add('drop-zone--active');
  });

  dz.addEventListener('dragleave', () => {
    dz.classList.remove('drop-zone--dragging');
    dz.classList.remove('drop-zone--active');
  });

  dz.addEventListener('drop', (e) => {
    e.preventDefault();
    dz.classList.remove('drop-zone--dragging');
    dz.classList.remove('drop-zone--active');
    addFiles(e.dataTransfer.files);
  });

  dz.addEventListener('focus', () => dz.classList.add('drop-zone--active'));
  dz.addEventListener('blur', () => dz.classList.remove('drop-zone--active'));

  [nameInput, copiesInput].forEach((inputEl) => {
    if (!inputEl) return;
    inputEl.addEventListener('input', () => inputEl.classList.remove('form-input--error'));
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

    const nameValue = nameInput?.value?.trim() || '';
    const copiesValue = Number(copiesInput?.value || 0);

    if (!nameValue) {
      nameInput?.classList.add('form-input--error');
    }

    if (!Number.isFinite(copiesValue) || copiesValue < 1) {
      copiesInput?.classList.add('form-input--error');
    }

    if (!nameValue || !Number.isFinite(copiesValue) || copiesValue < 1) {
      feedback.textContent = 'Please complete all required print details before sending.';
      feedback.className = 'print-portal-form__feedback print-portal-form__feedback--error';
      return;
    }

    if (!uploadedFiles.length) {
      dz.classList.add('drop-zone--active');
      feedback.textContent = 'Please upload at least one document before sending.';
      feedback.className = 'print-portal-form__feedback print-portal-form__feedback--error';
      return;
    }
    const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 25 * 1024 * 1024) {
      feedback.textContent = 'Total upload size exceeds 25MB.';
      feedback.className = 'print-portal-form__feedback print-portal-form__feedback--error';
      return;
    }

    const selectedPrintType =
      document.querySelector('input[name="portal-print-type"]:checked')?.value || 'Black & White';

    feedback.textContent = 'Sending...';
    feedback.className = 'print-portal-form__feedback';
    dz.classList.remove('drop-zone--active');

    // Read all files as base64 and send to backend
    Promise.all(
      uploadedFiles.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                filename: file.name,
                mimeType: file.type,
                base64: reader.result.split(',')[1],
              });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    )
      .then((files) => {
        // Use the same Worker endpoint as mailbox registration
        return fetch('https://srt-swp.p-vedant7878.workers.dev/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: nameValue,
            printType: selectedPrintType,
            copies: copiesValue,
            files,
          }),
        });
      })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          feedback.textContent = 'Request sent! You will receive a confirmation soon.';
          feedback.className = 'print-portal-form__feedback print-portal-form__feedback--success';
          // Optionally reset form and uploadedFiles
          form.reset();
          uploadedFiles.length = 0;
          renderFileList();
        } else {
          feedback.textContent = result.error || 'There was a problem sending your request.';
          feedback.className = 'print-portal-form__feedback print-portal-form__feedback--error';
        }
      })
      .catch((err) => {
        feedback.textContent = 'There was a problem sending your request.';
        feedback.className = 'print-portal-form__feedback print-portal-form__feedback--error';
      });
  });

  function addFiles(fileCollection) {
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    if (!fileCollection || !fileCollection.length) return;
    let totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
    let error = '';
    Array.from(fileCollection).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        error = `File "${file.name}" is too large (max 25MB).`;
        return;
      }
      if (totalSize + file.size > MAX_FILE_SIZE) {
        error = 'Total upload size exceeds 25MB.';
        return;
      }
      const exists = uploadedFiles.some(
        (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
      );
      if (!exists) {
        uploadedFiles.push(file);
        totalSize += file.size;
      }
    });
    if (error) {
      feedback.textContent = error;
      feedback.className = 'print-portal-form__feedback print-portal-form__feedback--error';
      return;
    }
    fileInput.value = '';
    renderFileList();
  }

  function renderFileList() {
    if (!uploadedFiles.length) {
      emptyState.style.display = 'block';
      fileList.innerHTML = '';
      dz.classList.remove('drop-zone--has-file');
      return;
    }

    dz.classList.add('drop-zone--has-file');
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
    reserveLabel: 'Reserve Your Box',
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
  servicesOverview: {
    cards: [
      {
        id: 'shipping',
        title: 'Shipping',
        image: {
          src: 'assets/images/service-shipping.svg',
          alt: 'Shipping counter and package processing illustration',
        },
        description: 'Compare rates across top carriers and get your packages delivered safely and on time.',
        features: ['Domestic & International', 'Certified Mail', 'Custom Packaging'],
        pricing: { label: 'Drop-offs', value: 'Free' },
      },
      {
        id: 'printing',
        title: 'Printing',
        image: {
          src: 'assets/images/service-printing.svg',
          alt: 'Document printing and finishing services illustration',
        },
        description: 'Fast everyday printing for forms, photos, and documents with clear pickup timelines.',
        features: ['Black & White', 'Full-Color', 'Lamination'],
        pricing: { label: 'Starting at', value: '$0.50' },
      },
      {
        id: 'business',
        title: 'Business',
        image: {
          src: 'assets/images/service-business.svg',
          alt: 'Business desk with fax, notary, and scan support illustration',
        },
        description: 'Essential paperwork services in one stop for small business and everyday admin needs.',
        features: ['Fax', 'Notary Public', 'Shred'],
        pricing: { label: 'Notary from', value: '$10' },
      },
      {
        id: 'mailbox',
        title: 'Mailbox Services',
        image: {
          src: 'assets/images/service-mailbox.svg',
          alt: 'Private mailbox wall and mail access illustration',
        },
        description: 'Get a real street address with secure mail handling and optional forwarding.',
        features: ['Package Storage', 'Mail Forwarding', 'Magazine/Newspaper Storage'],
        pricing: { label: 'Plans from', value: '$57' },
      },
    ],
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
   SERVICES OVERVIEW CARDS (services.html)
   ============================================================ */
(function initServicesOverviewCards() {
  const cards = document.querySelectorAll('[data-service-card]');
  if (!cards.length) return;

  loadMailboxContent().then((content) => {
    const byId = Object.fromEntries((content.servicesOverview?.cards || []).map((card) => [card.id, card]));

    cards.forEach((cardEl) => {
      const id = cardEl.getAttribute('data-service-card');
      const cardData = byId[id];
      if (!cardData) return;

      const titleEl = cardEl.querySelector('[data-service-field="title"]');
      const imageEl = cardEl.querySelector('[data-service-field="image"]');
      const descEl = cardEl.querySelector('[data-service-field="description"]');
      const featuresEl = cardEl.querySelector('[data-service-field="features"]');
      const priceLabelEl = cardEl.querySelector('[data-service-field="price-label"]');
      const priceValueEl = cardEl.querySelector('[data-service-field="price-value"]');

      if (titleEl && typeof cardData.title === 'string') titleEl.textContent = cardData.title;
      if (imageEl && typeof cardData.image?.src === 'string') imageEl.setAttribute('src', cardData.image.src);
      if (imageEl && typeof cardData.image?.alt === 'string') imageEl.setAttribute('alt', cardData.image.alt);
      if (descEl && typeof cardData.description === 'string') descEl.textContent = cardData.description;

      if (featuresEl && Array.isArray(cardData.features)) {
        featuresEl.innerHTML = cardData.features
          .map((feature) => `<li class="detailed-service-card__list-item">${escHtml(feature)}</li>`)
          .join('');
      }

      if (priceLabelEl && typeof cardData.pricing?.label === 'string') priceLabelEl.textContent = cardData.pricing.label;
      if (priceValueEl && typeof cardData.pricing?.value === 'string') priceValueEl.textContent = cardData.pricing.value;
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
    const sizeSelect = document.getElementById('quote-size-select');
    const termSelect = document.getElementById('quote-term-select');

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

      document.querySelectorAll('.quote__size-btn').forEach((btn) => {
        btn.classList.toggle('quote__size-btn--active', btn.dataset.size === selectedSize);
      });

      if (sizeSelect) sizeSelect.value = selectedSize;

      document.querySelectorAll('.quote__term-btn').forEach((btn) => {
        btn.classList.toggle('quote__term-btn--active', btn.dataset.term === selectedTerm);
      });

      if (termSelect) termSelect.value = selectedTerm;

      const addonBadge = document.getElementById('addon-badge');
      if (addonBadge) addonBadge.textContent = '+$' + NOTIF[selectedTerm] + ' (' + selectedTerm + ')';

      const addonBtn = document.getElementById('addon-btn');
      if (addonBtn) addonBtn.classList.toggle('quote__addon-btn--active', notifications);
    }

    document.querySelectorAll('.quote__size-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedSize = btn.dataset.size;
        if (!PRICING[selectedSize]?.[selectedTerm]) selectedTerm = '3-Month';
        updateQuote();
      });
    });

    document.querySelectorAll('.quote__term-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedTerm = btn.dataset.term;
        updateQuote();
      });
    });

    if (sizeSelect) {
      sizeSelect.addEventListener('change', (e) => {
        selectedSize = e.target.value;
        if (!PRICING[selectedSize]?.[selectedTerm]) selectedTerm = '3-Month';
        updateQuote();
      });
    }

    if (termSelect) {
      termSelect.addEventListener('change', (e) => {
        selectedTerm = e.target.value;
        if (!PRICING[selectedSize]?.[selectedTerm]) selectedTerm = '3-Month';
        updateQuote();
      });
    }

    const addonBtn = document.getElementById('addon-btn');
    if (addonBtn) {
      addonBtn.addEventListener('click', () => {
        notifications = !notifications;
        updateQuote();
        const icon = addonBtn.querySelector('.quote__addon-icon');
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
    modal.classList.add('pricing-modal--open');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('pricing-modal--open');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Open modal on trigger click
  trigger.addEventListener('click', openModal);

  // Close on close button click
  closeBtn.addEventListener('click', closeModal);

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('pricing-modal--open')) {
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
  document.querySelectorAll('.faq-item__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('faq-item--open');
      // Close all
      document.querySelectorAll('.faq-item.faq-item--open').forEach((el) => el.classList.remove('faq-item--open'));
      // Toggle current
      if (!isOpen) item.classList.add('faq-item--open');
    });
  });
})();

/* ============================================================
   LIVE REVIEWS (LOCAL JSON)
   ============================================================ */
function loadLiveReviews() {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  container.innerHTML = fallbackMarkup('Loading latest customer reviews...');

  let autoScrollTimer = null;
  let isAutoScrollPaused = false;

  const stopAutoScroll = () => {
    if (autoScrollTimer) {
      window.clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  };

  const startAutoScroll = () => {
    stopAutoScroll();

    if (container.scrollWidth <= container.clientWidth) return;

    autoScrollTimer = window.setInterval(() => {
      if (isAutoScrollPaused || container.scrollWidth <= container.clientWidth) return;

      const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 2;
      if (atEnd) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      const cards = Array.from(container.querySelectorAll('.review-card'));
      if (!cards.length) return;

      const currentIndex = cards.findIndex((card) => card.offsetLeft > container.scrollLeft + 2);
      const nextIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextCard = cards[nextIndex];

      if (nextCard) {
        container.scrollTo({ left: nextCard.offsetLeft, behavior: 'smooth' });
      }
    }, 3500);
  };

  const pauseAutoScroll = () => {
    isAutoScrollPaused = true;
    stopAutoScroll();
  };

  const resumeAutoScroll = () => {
    isAutoScrollPaused = false;
    startAutoScroll();
  };

  container.addEventListener('mouseenter', pauseAutoScroll);
  container.addEventListener('mouseleave', resumeAutoScroll);
  container.addEventListener('touchstart', pauseAutoScroll, { passive: true });
  container.addEventListener('touchend', resumeAutoScroll, { passive: true });

  fetch('/reviews.json', {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((reviews) => {
      if (!Array.isArray(reviews) || !reviews.length) {
        container.innerHTML = fallbackMarkup('No live reviews available right now.');
        startAutoScroll();
        return;
      }

      container.innerHTML = reviews.map((review) => buildReviewCard(review)).join('');
      startAutoScroll();
    })
    .catch(() => {
      container.innerHTML = fallbackMarkup('Live review feed is temporarily unavailable.');
      startAutoScroll();
    });

  function buildReviewCard(review) {
    const author = sanitizeText(review?.author || 'Guest');
    const source = sanitizeText(review?.source || 'Google');
    const rating = clampRating(review?.rating);
    const text = sanitizeText(review?.text || '');
    const daysAgo = clampDaysAgo(review?.daysAgo);
    const publishedDate = new Date();
    publishedDate.setDate(publishedDate.getDate() - daysAgo);

    const displayDate = publishedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const isoDate = publishedDate.toISOString().split('T')[0];
    const initials = author
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');

    const sourceClass = source.toLowerCase() === 'google'
      ? 'review-card__source review-card__source--google'
      : 'review-card__source';

    return `
      <article class="review-card" role="article">
        <header class="review-card__top">
          <div class="review-card__avatar">${sanitizeText(initials || 'G')}</div>
          <div class="review-card__identity">
            <h3 class="review-card__name">${author}</h3>
            <time class="review-card__meta" datetime="${isoDate}">${displayDate}</time>
          </div>
          <span class="${sourceClass}">${source}</span>
        </header>
        <div class="review-card__rating-row">
          <div class="review-card__stars" aria-label="${rating} out of 5 stars">${renderStars(rating)}</div>
        </div>
        <p class="review-card__text">${text}</p>
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

  function fallbackMarkup(message) {
    return `
      <article class="review-card review-card--placeholder" role="article">
        <header class="review-card__top">
          <div class="review-card__avatar">i</div>
          <div class="review-card__identity">
            <h3 class="review-card__name">Live Reviews</h3>
          </div>
        </header>
        <p class="review-card__text">${sanitizeText(message)}</p>
      </article>
    `;
  }

  function clampRating(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 5;
    return Math.max(1, Math.min(5, Math.round(numeric)));
  }

  function clampDaysAgo(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 1;
    return Math.max(0, Math.min(365, Math.round(numeric)));
  }

  function sanitizeText(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

document.addEventListener('DOMContentLoaded', loadLiveReviews);

/* ============================================================
   RESERVATION MODAL (mailboxes.html + homepage CTA)
   ============================================================ */

// Multi-Step Reservation Modal
(function initReservationModalMultiStep() {
  // Update to new drawer id if needed
  const modal = document.getElementById('reservation-drawer');
  // Use new drawer close button class
  const closeBtn = document.querySelector('.reservation-drawer__close');
  const step1 = document.getElementById('modal-step-1');
  const step2 = document.getElementById('modal-step-2');
  const form = document.getElementById('reservation-form');
  // Dynamic summary card elements
  const boxSelect = document.getElementById('modal-box-type');
  const termSelect = document.getElementById('modal-term');
  const priceDisplay = document.getElementById('modal-dynamic-price');
  const closeStep2Btn = document.getElementById('modal-close-btn');
  const successIcon = document.getElementById('modal-success-icon');
  // Progress bar
  const progressStep1 = document.getElementById('progress-step-1');
  const progressStep2 = document.getElementById('progress-step-2');
  const progressLabel1 = document.getElementById('progress-label-1');
  const progressLabel2 = document.getElementById('progress-label-2');
  // Summary echo in step 2
  const summaryConfirm = document.getElementById('modal-summary-confirm');
  const summarySize = document.getElementById('modal-summary-size');
  const summaryTerm = document.getElementById('modal-summary-term');
  // Accordion
  const idAccordionToggle = document.getElementById('id-accordion-toggle');
  const idAccordionContent = document.getElementById('id-accordion-content');

  if (!modal || !closeBtn || !step1 || !step2 || !form) return;


  // Helper: Update price in summary card
  function updateModalPrice() {
    if (!boxSelect || !termSelect || !priceDisplay) return;
    const selectedBox = boxSelect.value;
    const selectedTerm = termSelect.value;
    const content = window.mailboxContent || MAILBOX_FALLBACK_CONTENT;
    const price = content?.plans?.[selectedBox]?.pricing?.[selectedTerm];
    if (price) {
      priceDisplay.textContent = '$' + price;
    } else {
      priceDisplay.textContent = '--';
    }
  }

  // Modal open/close logic
  function openModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      // Preselect from button if present
      const btn = e.currentTarget;
      const planFromBtn = btn.dataset.mailboxPlan;
      if (planFromBtn && boxSelect) boxSelect.value = planFromBtn;
      // Try to sync term from main quote calculator
      const globalTermSelect = document.getElementById('quote-term-select');
      if (globalTermSelect && termSelect) termSelect.value = globalTermSelect.value;
    }
    updateModalPrice();
    modal.classList.add('reservation-drawer--open');
    document.body.style.overflow = 'hidden';
    showStep(1);
    setTimeout(() => {
      const firstInput = form.querySelector('input[type="text"]');
      if (firstInput) firstInput.focus();
    }, 100);
  }
    // Listen for changes on the dropdowns and update live
    if (boxSelect) boxSelect.addEventListener('change', updateModalPrice);
    if (termSelect) termSelect.addEventListener('change', updateModalPrice);
  function closeModal() {
    modal.classList.remove('reservation-drawer--open');
    document.body.style.overflow = '';
    form.reset();
    showStep(1);
  }
  function showStep(n) {
    if (n === 1) {
      step1.classList.add('reservation-drawer__step--active');
      step2.classList.remove('reservation-drawer__step--active');
      // Progress bar
      if (progressStep1) progressStep1.classList.add('progress-bar__step--active');
      if (progressStep2) progressStep2.classList.remove('progress-bar__step--active', 'progress-bar__step--complete');
      if (progressLabel1) progressLabel1.classList.add('progress-bar__label--active');
      if (progressLabel2) progressLabel2.classList.remove('progress-bar__label--active');
      if (summaryConfirm) summaryConfirm.style.display = 'none';
    } else {
      step1.classList.remove('reservation-drawer__step--active');
      step2.classList.add('reservation-drawer__step--active');
      // Progress bar
      if (progressStep1) progressStep1.classList.remove('progress-bar__step--active');
      if (progressStep1) progressStep1.classList.add('progress-bar__step--complete');
      if (progressStep2) progressStep2.classList.add('progress-bar__step--active');
      if (progressLabel1) progressLabel1.classList.remove('progress-bar__label--active');
      if (progressLabel2) progressLabel2.classList.add('progress-bar__label--active');
      // Show summary card with user data
      if (summaryConfirm && summarySize && summaryTerm && boxSelect && termSelect) {
        summarySize.textContent = boxSelect.options[boxSelect.selectedIndex].text;
        summaryTerm.textContent = termSelect.options[termSelect.selectedIndex].text;
        summaryConfirm.style.display = '';
      }
    }
  }

  // Attach to all reserve buttons
  document.querySelectorAll('.mailbox-cta__tile--price, .quote-cta').forEach((btn) => {
    btn.addEventListener('click', openModal);
  });
  closeBtn.addEventListener('click', closeModal);
  if (closeStep2Btn) closeStep2Btn.addEventListener('click', closeModal);

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('reservation-drawer--open')) {
      closeModal();
    }
  });
  // Overlay click
  // Update overlay click for new drawer overlay class
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === modal.querySelector('.reservation-drawer__overlay')) {
      closeModal();
    }
  });

  // Form submit logic (Step 1)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn?.querySelector('.reservation-drawer__cta-text');
    const btnSpinner = submitBtn?.querySelector('.reservation-drawer__cta-spinner');
    if (submitBtn) {
      submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Processing...';
      if (btnSpinner) btnSpinner.style.display = 'inline-block';
    }
    // Gather values
    const payload = {
      name: form.name.value.trim(),
      company: form.company.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      mailboxType: boxSelect ? boxSelect.value : 'Personal',
      term: termSelect ? termSelect.value : '3-Month',
      mailNotification: (document.getElementById('modal-addon-notif')?.checked === true)
    };
    try {
      const response = await fetch('https://srt-swp.p-vedant7878.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Safeguard: Check if the server actually returned JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Expected JSON, got HTML. Is the Node server running?");
        throw new Error("API endpoint not found. Make sure you are viewing via localhost:3000");
      }

      const result = await response.json();

      if (response.ok && result.success) {
        showStep(2);
        triggerConfetti();
      } else {
        alert(`Submission error: ${result.error || 'Please check your information and try again.'}`);
      }
    } catch (err) {
      console.error('Network submission failed:', err);
      alert(err.message || 'Unable to connect to the server. Please try again later.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Submit Request';
        if (btnSpinner) btnSpinner.style.display = 'none';
      }
    }
  });
  // Accordion logic for ID requirements
  if (idAccordionToggle && idAccordionContent) {
    idAccordionToggle.addEventListener('click', function () {
      const expanded = idAccordionToggle.getAttribute('aria-expanded') === 'true';
      idAccordionToggle.setAttribute('aria-expanded', String(!expanded));
      idAccordionContent.style.display = expanded ? 'none' : '';
      idAccordionToggle.textContent = !expanded ? 'Hide ID Requirements' : 'View ID Requirements';
    });
  }

  // Simple confetti animation (CSS/JS, no dependencies)
  function triggerConfetti() {
    if (!successIcon) return;
    // Remove any existing confetti
    let confetti = document.querySelector('.reservation-drawer__confetti');
    if (confetti) confetti.remove();
    confetti = document.createElement('div');
    confetti.className = 'reservation-drawer__confetti';
    for (let i = 0; i < 32; i++) {
      const dot = document.createElement('div');
      dot.style.position = 'absolute';
      dot.style.left = (50 + Math.random() * 40 - 20) + '%';
      dot.style.top = (30 + Math.random() * 30 - 15) + '%';
      dot.style.width = dot.style.height = (8 + Math.random() * 8) + 'px';
      dot.style.borderRadius = '50%';
      dot.style.background = [
        'var(--kraft)', 'var(--kraft-dark)', 'var(--navy)', '#fff', '#f7e6d0', '#b98e5a'
      ][Math.floor(Math.random() * 6)];
      dot.style.opacity = 0.7 + Math.random() * 0.3;
      dot.style.transform = `scale(${0.8 + Math.random() * 0.6})`;
      dot.style.animation = `confetti-fall 1.2s cubic-bezier(.6,1.5,.6,1) ${Math.random() * 0.3}s both`;
      confetti.appendChild(dot);
    }
    successIcon.appendChild(confetti);
    setTimeout(() => { if (confetti) confetti.remove(); }, 1600);
  }

  // Add confetti keyframes to document (if not present)
  if (!document.getElementById('confetti-fall-keyframes')) {
    const style = document.createElement('style');
    style.id = 'confetti-fall-keyframes';
    style.textContent = `@keyframes confetti-fall { 0% { opacity:1; transform:translateY(0) scale(1);} 100% { opacity:0; transform:translateY(60px) scale(0.7);} }`;
    document.head.appendChild(style);
  }
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

/* ============================================================
   UTILITY: Update footer year dynamically
   ============================================================ */
function updateFooterYear() {
  const footerYearEl = document.getElementById('footer-year');
  if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
  }
}

updateFooterYear();
document.addEventListener('components:loaded', updateFooterYear);
