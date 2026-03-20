/* ============================================================
   Resonance Network — app.js
   Dark mode toggle, filters, mobile nav
   Uses in-memory variable + system preference (no persistent storage)
   ============================================================ */

(function () {
  'use strict';

  // --- Theme Management (in-memory only) ---
  let currentTheme = null; // null = follow system

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    const resolved = theme || getSystemTheme();
    document.documentElement.setAttribute('data-theme', resolved);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    currentTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
  }

  // Initialize theme from system preference
  applyTheme(currentTheme);

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (currentTheme === null) {
      applyTheme(null);
    }
  });

  // Bind theme toggle buttons
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });

    // --- Mobile Navigation ---
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.nav-mobile');

    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
      });

      // Close mobile nav when clicking a link
      mobileNav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          hamburger.classList.remove('active');
          mobileNav.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
    }

    // --- Collaboration Board Filters ---
    var categoryBtns = document.querySelectorAll('.filter-btn[data-category]');
    var skillBtns = document.querySelectorAll('.filter-btn[data-skill]');
    var taskCards = document.querySelectorAll('.task-card[data-categories]');

    var activeCategories = new Set();
    var activeSkills = new Set();

    function filterCards() {
      taskCards.forEach(function (card) {
        var cardCategories = (card.getAttribute('data-categories') || '').toLowerCase().split(',');
        var cardSkills = (card.getAttribute('data-skills') || '').toLowerCase().split(',');

        var categoryMatch = activeCategories.size === 0 ||
          cardCategories.some(function (c) { return activeCategories.has(c.trim()); });

        var skillMatch = activeSkills.size === 0 ||
          cardSkills.some(function (s) { return activeSkills.has(s.trim()); });

        card.style.display = (categoryMatch && skillMatch) ? '' : 'none';
      });
    }

    categoryBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var category = btn.getAttribute('data-category').toLowerCase();
        if (category === 'all') {
          activeCategories.clear();
          categoryBtns.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
        } else {
          // Remove "All" active
          categoryBtns.forEach(function (b) {
            if (b.getAttribute('data-category') === 'all') b.classList.remove('active');
          });
          if (activeCategories.has(category)) {
            activeCategories.delete(category);
            btn.classList.remove('active');
            // If none selected, select All
            if (activeCategories.size === 0) {
              categoryBtns.forEach(function (b) {
                if (b.getAttribute('data-category') === 'all') b.classList.add('active');
              });
            }
          } else {
            activeCategories.add(category);
            btn.classList.add('active');
          }
        }
        filterCards();
      });
    });

    skillBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var skill = btn.getAttribute('data-skill').toLowerCase();
        if (skill === 'all') {
          activeSkills.clear();
          skillBtns.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
        } else {
          skillBtns.forEach(function (b) {
            if (b.getAttribute('data-skill') === 'all') b.classList.remove('active');
          });
          if (activeSkills.has(skill)) {
            activeSkills.delete(skill);
            btn.classList.remove('active');
            if (activeSkills.size === 0) {
              skillBtns.forEach(function (b) {
                if (b.getAttribute('data-skill') === 'all') b.classList.add('active');
              });
            }
          } else {
            activeSkills.add(skill);
            btn.classList.add('active');
          }
        }
        filterCards();
      });
    });
  });
})();
