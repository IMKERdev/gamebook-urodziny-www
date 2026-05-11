/* ============================================
   3. URODZINY GAMEBOOK · Countdown logic
   ============================================ */

// Koniec promocji: 31 maja 2026 polnoc Europe/Warsaw (= 00:00 1 czerwca).
// Strona jest aktywna od razu - oficjalny start to 14 maja, ale licznik dziala juz teraz.
const END_MS = Date.UTC(2026, 4, 31, 22, 0, 0);

function pad(n) { return String(n).padStart(2, '0'); }

function formatTimer(ms) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { d, h, m, s };
}

function tick() {
  const now = Date.now();
  const expired = now >= END_MS;
  const t = formatTimer(END_MS - now);

  // Hero countdown digits
  const dni  = document.getElementById('dni');
  const godz = document.getElementById('godz');
  const min  = document.getElementById('min');
  const sek  = document.getElementById('sek');
  if (dni)  dni.textContent  = pad(t.d);
  if (godz) godz.textContent = pad(t.h);
  if (min)  min.textContent  = pad(t.m);
  if (sek)  sek.textContent  = pad(t.s);

  // Hero countdown label
  const hudLabel = document.getElementById('hudLabel');
  if (hudLabel) {
    hudLabel.textContent = expired
      ? 'PROMOCJA ZAKONCZONA'
      : 'TIME LEFT // BOXY ZNIKAJA ZA';
  }

  // Top urgency bar timer + pill
  const top = document.getElementById('topTimer');
  if (top) {
    top.textContent = expired
      ? 'PROMOCJA ZAKONCZONA'
      : `${pad(t.d)}d ${pad(t.h)}:${pad(t.m)}:${pad(t.s)}`;
  }
  const pillLabel = document.getElementById('urgencyPillLabel');
  if (pillLabel) {
    pillLabel.textContent = expired ? 'PROMOCJA ZAKONCZONA' : 'PROMO ACTIVE';
  }

  // Sticky bottom bar - timer
  const sticky = document.getElementById('stickyTimer');
  if (sticky) {
    sticky.textContent = expired ? 'koniec' : `${t.d}d ${pad(t.h)}h`;
  }

  // Final CTA title
  const finalTitle = document.getElementById('finalCtaTitle');
  if (finalTitle) {
    finalTitle.innerHTML = expired
      ? 'Promocja zakonczona.<br>Boxy znikneły z oferty.'
      : `Masz <span id="finalDays">${t.d}</span> dni.<br>Potem boxy znikają z oferty.`;
  }

  if (expired) {
    document.querySelectorAll('.btn--primary').forEach(b => {
      b.style.opacity = '0.6';
      b.style.pointerEvents = 'none';
    });
  }
}

// Show sticky CTA after user scrolls past hero
function setupStickyCta() {
  const sticky = document.getElementById('stickyCta');
  const hero = document.querySelector('.hero');
  if (!sticky || !hero) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        sticky.classList.add('is-visible');
        document.body.classList.add('has-sticky');
      } else {
        sticky.classList.remove('is-visible');
        document.body.classList.remove('has-sticky');
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -80% 0px' });

  observer.observe(hero);
}

function shuffleCovers() {
  const wall = document.querySelector('.covers-wall');
  if (!wall) return;
  const covers = Array.from(wall.querySelectorAll('.cover'));
  const srcs = covers.map(c => c.querySelector('img').getAttribute('src'));
  for (let i = srcs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [srcs[i], srcs[j]] = [srcs[j], srcs[i]];
  }
  covers.forEach((c, i) => c.querySelector('img').setAttribute('src', srcs[i]));
}

function setupCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  if (localStorage.getItem('cookies-accepted')) return;

  banner.hidden = false;

  const defaultView = document.getElementById('cookieDefault');
  const settingsView = document.getElementById('cookieSettings');
  const toggleAnalytics = document.getElementById('toggleAnalytics');
  const toggleMarketing = document.getElementById('toggleMarketing');

  function toggleSwitch(btn) {
    const on = btn.classList.toggle('is-on');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function close(analytics, marketing) {
    localStorage.setItem('cookies-accepted', '1');
    localStorage.setItem('cookies-analytics', analytics ? '1' : '0');
    localStorage.setItem('cookies-marketing', marketing ? '1' : '0');
    banner.hidden = true;
  }

  document.getElementById('cookieAccept').addEventListener('click', () => close(true, true));
  document.getElementById('cookieCustomize').addEventListener('click', () => {
    defaultView.hidden = true;
    settingsView.hidden = false;
  });
  document.getElementById('cookieBack').addEventListener('click', () => {
    settingsView.hidden = true;
    defaultView.hidden = false;
  });
  toggleAnalytics.addEventListener('click', () => toggleSwitch(toggleAnalytics));
  toggleMarketing.addEventListener('click', () => toggleSwitch(toggleMarketing));
  document.getElementById('cookieSave').addEventListener('click', () => {
    close(toggleAnalytics.classList.contains('is-on'), toggleMarketing.classList.contains('is-on'));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  tick();
  setInterval(tick, 1000);
  setupStickyCta();
  shuffleCovers();
  setupCookieBanner();

  // Smooth scroll already handled by CSS, but offset for sticky urgency-bar
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          const offset = 60;
          const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });
});
