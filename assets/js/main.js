
(function() {
  "use strict";

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector('.header-toggle');

  function headerToggle() {
    const isOpen = document.querySelector('#header').classList.toggle('header-show');
    headerToggleBtn.classList.toggle('bi-list');
    headerToggleBtn.classList.toggle('bi-x');
    headerToggleBtn.setAttribute('aria-expanded', String(isOpen));
    headerToggleBtn.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  }
  headerToggleBtn.addEventListener('click', headerToggle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.header-show')) {
        headerToggle();
      }
    });

  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  const scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Load videos shortly before they enter the viewport, then play only while visible.
   */
  const lazyVideos = document.querySelectorAll('video.lazy-video');

  if (lazyVideos.length) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const loadVideo = (video) => {
      if (video.dataset.loaded === 'true') return;

      const source = video.querySelector('source[data-src]');
      if (!source) return;

      source.src = source.dataset.src;
      video.dataset.loaded = 'true';
      video.load();
    };

    if ('IntersectionObserver' in window) {
      const loadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadVideo(entry.target);
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '400px 0px' });

      const playbackObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (!reduceMotion && entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            loadVideo(video);
            video.play().catch(() => {
              // Browser autoplay policies may require the visitor to press play.
            });
          } else {
            video.pause();
          }
        });
      }, { threshold: [0, 0.35] });

      lazyVideos.forEach((video) => {
        loadObserver.observe(video);
        playbackObserver.observe(video);
      });
    } else {
      lazyVideos.forEach((video) => {
        loadVideo(video);
        if (!reduceMotion) {
          video.play().catch(() => {
            // Browser autoplay policies may require the visitor to press play.
          });
        }
      });
    }
  }

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function() {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          const section = document.querySelector(window.location.hash);
          const scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  const navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      const section = document.querySelector(navmenulink.hash);
      if (!section) return;
      const position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    });
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  /* ---------------------------
   * Contact form (Formspree)
   * --------------------------- */
  const form = document.querySelector('#contact-form');
  if (form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const submitButtonLabel = submitButton?.textContent ?? 'Send Message';
    let isSubmitting = false;

    // create a toast once
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.setAttribute('aria-live', 'polite');
      toast.setAttribute('aria-atomic', 'true');
      document.body.appendChild(toast);
    }

    const showToast = (msg, ok = true) => {
      toast.textContent = msg;
      toast.style.background = ok ? '#16a34a' : '#dc2626';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // stop redirect

      if (isSubmitting) return;

      isSubmitting = true;
      form.setAttribute('aria-busy', 'true');

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';
      }

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' } // JSON response = no Formspree redirect
        });

        if (res.ok) {
          form.reset();
          showToast('Success! Your message was sent.', true);
        } else {
          const data = await res.json().catch(() => ({}));
          const msg = data?.errors?.map(e => e.message).join(', ') || 'Something went wrong.';
          showToast(msg, false);
        }
      } catch {
        showToast('Network error. Please try again.', false);
      } finally {
        isSubmitting = false;
        form.removeAttribute('aria-busy');

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitButtonLabel;
        }
      }
    });
  }

})();
