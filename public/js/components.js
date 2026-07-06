/**
 * public/js/components.js
 * =======================
 * Component loader and navigation highlighter
 *
 * PURPOSE:
 * - Fetch and inject HTML partials into pages (header, footer)
 * - Highlight active navigation link based on current route
 * - Called on page load and after components are injected
 *
 * FUNCTIONS:
 * - includeComponents()
 *   * Finds all elements with data-include attribute
 *   * Fetches HTML from the specified path
 *   * Injects HTML into the element
 *   * Calls highlightActiveNavLink() after injection
 *   * Dispatches 'components:loaded' event
 *   * Error handling for failed fetches
 *
 * - highlightActiveNavLink()
 *   * Gets current pathname and normalizes it
 *   * Maps pathnames to routes (e.g., /index.html → /)
 *   * Finds all nav links (.nav__link, .nav__menu-link)
 *   * Compares each link's href to current active route
 *   * Adds --active class to matching links
 *   * Different class for menu links vs desktop links
 *
 * ROUTE MAPPING:
 * - / (home) → nav link for Home
 * - /mailboxes or /mailboxes.html → nav link for Mailbox
 * - /print or /print.html → nav link for Print
 * - /services or /services.html → nav link for Services
 *
 * USAGE:
 * - In HTML: <div data-include="/partials/header.html"></div>
 * - Call includeComponents() on page load
 * - Script runs automatically on DOMContentLoaded
 *
 * DEPENDENCIES:
 * - fetch API (standard in modern browsers)
 * - DOM API (querySelectorAll, innerHTML, classList, etc.)
 *
 * EVENTS:
 * - Listens for: DOMContentLoaded
 * - Dispatches: components:loaded (after injection)
 * - Other scripts can listen: document.addEventListener('components:loaded', ...)
 *
 * ERROR HANDLING:
 * - Failed fetches log error to console
 * - Component loads continue even if one fails
 * - Page still renders even if partials fail to load
 *
 * MOBILE MENU:
 * - After header is injected, initNav() (from app.js) sets up hamburger
 * - highlightActiveNavLink() runs after each injection
 */
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
