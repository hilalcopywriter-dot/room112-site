/* =========================================================
   ROOM 112 — interactions & animations (vanilla JS)
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Préchargement : compteur 000 → 112 ---------- */
  function preloader() {
    var loader = $('#loader'), num = $('#loaderNum'), bar = $('#loaderBar');
    if (!loader) return;
    var start = performance.now(), dur = reduced ? 300 : 1500;

    function frame(t) {
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      num.textContent = String(Math.round(eased * 112)).padStart(3, '0');
      bar.style.width = (eased * 100) + '%';
      if (p < 1) requestAnimationFrame(frame);
      else {
        loader.classList.add('is-done');
        document.body.classList.add('is-ready');
        setTimeout(function () { loader.remove(); }, 800);
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- 2. Timecode caméra ---------- */
  function timecode() {
    var el = $('#tc'); if (!el) return;
    var t0 = Date.now();
    setInterval(function () {
      var ms = Date.now() - t0;
      var h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60,
          s = Math.floor(ms / 1000) % 60, f = Math.floor((ms % 1000) / 41.7);
      var p = function (n) { return String(n).padStart(2, '0'); };
      el.textContent = p(h) + ':' + p(m) + ':' + p(s) + ':' + p(f);
    }, 42);
  }

  /* ---------- 3. Curseur sur mesure + magnétisme ---------- */
  function cursor() {
    var cur = $('#cursor'); if (!cur || reduced) return;
    if (window.matchMedia('(hover: none)').matches) return;
    var label = $('.cursor__label', cur);
    var x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;

    document.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY; cur.classList.add('is-on');
      var hit = e.target.closest('[data-cursor]');
      if (hit) { cur.classList.add('is-big'); label.textContent = hit.getAttribute('data-cursor'); }
      else { cur.classList.remove('is-big'); label.textContent = ''; }
    });
    document.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });

    (function loop() {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();

    $$('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + dx * 0.22 + 'px,' + dy * 0.3 + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
        el.style.transform = '';
        setTimeout(function () { el.style.transition = ''; }, 600);
      });
    });
  }

  /* ---------- 4. Découpe des titres en mots (reveal ligne par ligne) ---------- */
  function splitTitles() {
    $$('.split').forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach(function (w, i) {
        var span = document.createElement('span');
        span.className = 'word';
        var inner = document.createElement('i');
        inner.textContent = w;
        inner.style.transitionDelay = (i * 45) + 'ms';
        span.appendChild(inner);
        el.appendChild(span);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
    });
  }

  /* ---------- 5. Révélations au scroll ---------- */
  function reveals() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = parseInt(el.getAttribute('data-delay') || 0, 10);
        setTimeout(function () { el.classList.add('is-in'); }, reduced ? 0 : d);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    $$('.reveal, .split').forEach(function (el) { io.observe(el); });
  }

  /* ---------- 7. Ligne de process qui se trace ---------- */
  function stepsLine() {
    var line = $('#stepsLine'); if (!line) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { line.style.width = '100%'; io.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    io.observe($('.steps'));
  }

  /* ---------- 8. Nav : sticky, inversion sur fond clair, menu mobile ---------- */
  function navigation() {
    var nav = $('#nav'), burger = $('#burger'), menu = $('#menu');

    function onScroll() {
      nav.classList.toggle('is-stuck', scrollY > 40);
      var mid = nav.offsetHeight / 2;
      var light = $$('.sec--light').some(function (s) {
        var r = s.getBoundingClientRect();
        return r.top <= mid && r.bottom >= mid;
      });
      nav.classList.toggle('is-light', light && !menu.classList.contains('is-open'));
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
      document.body.classList.toggle('is-locked', open);
      if (open) nav.classList.remove('is-light');
    });
    $$('#menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('is-open');
        burger.classList.remove('is-open');
        document.body.classList.remove('is-locked');
      });
    });
  }

  /* ---------- 9. Barre de progression de lecture ---------- */
  function progress() {
    var bar = $('#scrollProgress'); if (!bar) return;
    addEventListener('scroll', function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ---------- 10. Parallaxe douce ---------- */
  function parallax() {
    if (reduced) return;
    var items = $$('[data-parallax]');
    if (!items.length) return;
    var ticking = false;
    function update() {
      items.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax'));
        var r = el.getBoundingClientRect();
        var off = (r.top + r.height / 2 - innerHeight / 2) * speed;
        el.style.translate = '0 calc(-50% + ' + (-off) + 'px)';
      });
      ticking = false;
    }
    addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- 12. Accordéon offre ---------- */
  function offers() {
    $$('[data-offer]').forEach(function (item) {
      $('.offer__head', item).addEventListener('click', function () {
        var open = item.classList.contains('is-open');
        $$('[data-offer]').forEach(function (o) { o.classList.remove('is-open'); });
        if (!open) item.classList.add('is-open');
      });
    });
  }

  /* ---------- 15. Formulaire (brouillon e-mail, à relier au CRM) ---------- */
  function form() {
    var f = $('#form'); if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(f);
      var body = [
        'Nom : ' + (d.get('name') || ''),
        'Marque / agence : ' + (d.get('org') || ''),
        'E-mail : ' + (d.get('email') || ''),
        'Profil : ' + (d.get('profil') || ''),
        '',
        d.get('message') || ''
      ].join('\n');
      var btn = $('.btn span', f), old = btn.textContent;
      window.location.href = 'mailto:contact@room112.ma'
        + '?subject=' + encodeURIComponent('Nouveau brief — ' + (d.get('org') || d.get('name') || ''))
        + '&body=' + encodeURIComponent(body);
      btn.textContent = 'Brief prêt à envoyer';
      setTimeout(function () { btn.textContent = old; }, 4000);
    });
  }

  /* ---------- 16. Ancres fluides ---------- */
  function anchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        var top = t.getBoundingClientRect().top + scrollY - ($('#nav').offsetHeight - 6);
        scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
      });
    });
  }


  /* ---------- 18. Boucle vidéo du hero (rendue avec Remotion) ---------- */
  function heroLoop() {
    var v = $('#heroVideo'); if (!v || reduced) return;
    var src = v.getAttribute('data-src'); if (!src) return;
    v.src = src;

    var start = function () { var p = v.play(); if (p) p.catch(function () {}); };
    ['loadeddata', 'canplay', 'canplaythrough'].forEach(function (e) { v.addEventListener(e, start); });

    /* les calques statiques ne s'effacent que si la boucle tourne vraiment */
    v.addEventListener('playing', function () {
      v.classList.add('is-on');
      var hero = document.getElementById('hero');
      if (hero) hero.classList.add('has-video');
    });
    start();
  }

  /* ---------- 19. Popup « nouveau brief » ---------- */
  function briefModal() {
    var modal = $('#brief'); if (!modal) return;
    var closeBtn = $('#briefClose'), last = null;

    function open(e) {
      if (e) e.preventDefault();
      last = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      setTimeout(function () { var f = $('#f-name'); if (f) f.focus(); }, 420);
    }
    function shut() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      if (last && last.focus) last.focus();
    }

    $$('[data-brief]').forEach(function (btn) { btn.addEventListener('click', open); });
    closeBtn.addEventListener('click', shut);
    modal.addEventListener('click', function (e) { if (e.target === modal) shut(); });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) shut();
      /* le focus reste dans la popup tant qu'elle est ouverte */
      if (e.key === 'Tab' && modal.classList.contains('is-open')) {
        var f = $$('button, input, select, textarea, a[href]', modal).filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Démarrage ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    splitTitles();
    preloader(); timecode(); cursor(); reveals(); stepsLine();
    navigation(); progress(); parallax(); offers();
    form(); anchors(); heroLoop(); briefModal();
  });
})();
