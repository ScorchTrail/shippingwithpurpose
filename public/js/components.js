async function includeComponents() {
  const includeNodes = Array.from(document.querySelectorAll('[data-include]'));

  await Promise.all(
    includeNodes.map(async (node) => {
      const includePath = node.getAttribute('data-include');
      if (!includePath) return;

      try {
        const response = await fetch(includePath);
        if (!response.ok) {
          throw new Error(`Failed to load ${includePath}: ${response.status}`);
        }

        node.innerHTML = await response.text();
      } catch (error) {
        console.error('Component include error:', error);
      }
    })
  );

  highlightActiveNavLink();
  document.dispatchEvent(new CustomEvent('components:loaded'));
}

function highlightActiveNavLink() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  const routeMap = {
    '/': '/',
    '/index.html': '/',
    '/mailboxes': '/mailboxes',
    '/mailboxes.html': '/mailboxes',
    '/print': '/print',
    '/print.html': '/print',
    '/services': '/services',
    '/services.html': '/services',
  };

  const activeRoute = routeMap[path];
  if (!activeRoute) return;

  document.querySelectorAll('.nav__link, .nav__menu-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (href === activeRoute) {
      if (link.classList.contains('nav__menu-link')) {
        link.classList.add('nav__menu-link--active');
      } else {
        link.classList.add('nav__link--active');
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', includeComponents);
} else {
  includeComponents();
}
