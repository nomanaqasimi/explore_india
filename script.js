/* ═══════════════════════════════════════════════════════════════
   script.js — ExploreIndia (shared across all pages)
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── 1. HERO BG ZOOM ──────────────────────────────────────── */
  var heroBg = document.getElementById('heroBg') || document.querySelector('.page-hero__bg');
  if (heroBg) { setTimeout(function () { heroBg.classList.add('loaded'); }, 60); }

  /* ── 2. NAVBAR SCROLL ─────────────────────────────────────── */
  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── 3. ACTIVE NAV LINK ───────────────────────────────────── */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

  /* ── 4. GENERIC SCROLL REVEAL ─────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  }

  /* ── 5. CARD STAGGERED REVEAL ─────────────────────────────── */
  var destCards = document.querySelectorAll('.dest-card');
  var expCards  = document.querySelectorAll('.exp-card');

  function makeStaggerObs(delayMs) {
    return new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var idx = parseInt(e.target.dataset.cardIndex || 0);
          setTimeout(function () { e.target.classList.add('in-view'); }, idx * delayMs);
          staggerObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
  }

  var destObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var idx = parseInt(e.target.dataset.cardIndex || 0);
        setTimeout(function () { e.target.classList.add('in-view'); }, idx * 80);
        destObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  var expObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var idx = parseInt(e.target.dataset.cardIndex || 0);
        setTimeout(function () { e.target.classList.add('in-view'); }, idx * 60);
        expObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  destCards.forEach(function (c, i) { c.dataset.cardIndex = i; destObs.observe(c); });
  expCards.forEach(function  (c, i) { c.dataset.cardIndex = i; expObs.observe(c); });

  /* ── 6. FILTER CHIPS (home page) ──────────────────────────── */
  var chips = document.querySelectorAll('.chip');
  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        var filter = chip.dataset.filter;
        destCards.forEach(function (card) {
          card.classList.toggle('filtered-out', filter !== 'all' && card.dataset.category !== filter);
        });
      });
    });
  }

  /* ── 7. EXPAND / SHRINK SIBLING CARDS ─────────────────────── */
  var grid = document.getElementById('destGrid');
  if (grid) {
    var DEFAULT_H  = 200;
    var EXPANDED_H = 290;
    var SHRUNK_H   = 120;
    var smallCards = document.querySelectorAll('.dest-card--small');

    function setRows(r1, r2) {
      grid.style.setProperty('--row1-h', r1 + 'px');
      grid.style.setProperty('--row2-h', r2 + 'px');
    }
    function resetRows() {
      setRows(DEFAULT_H, DEFAULT_H);
      smallCards.forEach(function (c) { c.classList.remove('shrink'); });
    }

    smallCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        var hoveredRow = parseInt(card.dataset.row);
        var hoveredCol = card.dataset.col;
        if (hoveredRow === 1) { setRows(EXPANDED_H, SHRUNK_H); }
        else                  { setRows(SHRUNK_H, EXPANDED_H); }
        smallCards.forEach(function (other) {
          if (other !== card && other.dataset.col === hoveredCol) {
            other.classList.add('shrink');
          }
        });
      });
      card.addEventListener('mouseleave', resetRows);
    });
    grid.addEventListener('mouseleave', resetRows);
  }

  /* ── 8. FAQ ACCORDION ─────────────────────────────────────── */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      faqItems.forEach(function (i) { i.classList.remove('open'); });
      if (!isOpen) { item.classList.add('open'); }
    });
  });

  /* ── 9. RELATED CARD REVEAL ───────────────────────────────── */
  var relatedCards = document.querySelectorAll('.related-card');
  if (relatedCards.length) {
    var relObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var idx = parseInt(e.target.dataset.cardIndex || 0);
          setTimeout(function () { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }, idx * 80);
          relObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    relatedCards.forEach(function (c, i) {
      c.dataset.cardIndex = i;
      c.style.opacity = '0'; c.style.transform = 'translateY(24px)';
      c.style.transition = 'opacity 0.55s ease, transform 0.5s var(--ease)';
      relObs.observe(c);
    });
  }
  var loginBtn = document.querySelector('.btn-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', function () {
      window.location.href = 'login.html'; 
    });
  }

});