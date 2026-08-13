document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Mobil menü ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  if (menuToggle && mainNav) {
    const closeMenu = () => {
      mainNav.classList.remove("open");
      menuToggle.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };

    menuToggle.addEventListener("click", function () {
      const willOpen = !mainNav.classList.contains("open");
      mainNav.classList.toggle("open", willOpen);
      menuToggle.classList.toggle("open", willOpen);
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      document.body.style.overflow = willOpen ? "hidden" : "";
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mainNav.classList.contains("open")) closeMenu();
    });
  }

  /* ---------- Header offsetli yumuşak kaydırma ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const header = document.getElementById("siteHeader");
      const offset = header ? header.offsetHeight + 12 : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* ---------- Tek rAF'lı scroll işleyicisi ---------- */
  const siteHeader = document.getElementById("siteHeader");
  const progressBar = document.getElementById("scrollProgress");
  const sections = document.querySelectorAll("section[id]");
  const navLinkItems = document.querySelectorAll(".main-nav .nav-link");

  const scrollTopBtn = document.createElement("button");
  scrollTopBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
  scrollTopBtn.className = "scroll-top-btn";
  scrollTopBtn.setAttribute("aria-label", "Sayfanın başına dön");
  document.body.appendChild(scrollTopBtn);
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  let ticking = false;

  function onScroll() {
    const y = window.scrollY;

    if (siteHeader) siteHeader.classList.toggle("scrolled", y > 40);
    scrollTopBtn.classList.toggle("visible", y > 400);

    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }


    let currentId = "";
    const probe = y + 160;
    sections.forEach((section) => {
      if (
        probe >= section.offsetTop &&
        probe < section.offsetTop + section.offsetHeight
      ) {
        currentId = section.id;
      }
    });
    navLinkItems.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
    });

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );
  onScroll();

  /* ---------- İstatistik sayaçları ---------- */
  const counters = document.querySelectorAll(".stat-number[data-target]");
  const formatTR = (n) => Math.round(n).toLocaleString("tr-TR");

  function runCounter(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || "";
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatTR(target * eased) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    counters.forEach((c) => counterObserver.observe(c));
  }

  /* ---------- Galeri lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const items = Array.from(
    document.querySelectorAll(".masonry-item, .book-frame"),
  );
  let currentIndex = 0;

  function showImage(index) {
    currentIndex = (index + items.length) % items.length;
    const img = items[currentIndex].querySelector("img");
    const caption = items[currentIndex].querySelector("figcaption");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    // Başlığı olmayan görsellerde (ör. yayınlar bölümü) alt metni kullanılır
    lightboxCaption.textContent = caption ? caption.textContent : img.alt;
  }

  function openLightbox(index) {
    showImage(index);
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    lightboxImg.src = "";
  }

  if (lightbox && items.length) {
    items.forEach((item, i) => {
      item.addEventListener("click", () => openLightbox(i));
    });

    document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
    document.getElementById("lightboxPrev").addEventListener("click", (e) => {
      e.stopPropagation();
      showImage(currentIndex - 1);
    });
    document.getElementById("lightboxNext").addEventListener("click", (e) => {
      e.stopPropagation();
      showImage(currentIndex + 1);
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showImage(currentIndex - 1);
      if (e.key === "ArrowRight") showImage(currentIndex + 1);
    });
  }

  /* ---------- İletişim formu (satır içi doğrulama) ---------- */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const statusEl = document.getElementById("formStatus");

    const setError = (id, msg) => {
      const input = document.getElementById(id);
      const errorEl = document.getElementById(id + "Error");
      if (errorEl) errorEl.textContent = msg;
      if (input) input.classList.toggle("invalid", Boolean(msg));
      return !msg;
    };

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const okName = setError("name", name ? "" : "Lütfen adınızı giriniz.");
      const okEmail = setError(
        "email",
        !email
          ? "Lütfen e-posta adresinizi giriniz."
          : !emailPattern.test(email)
            ? "Geçerli bir e-posta adresi giriniz."
            : "",
      );
      const okMessage = setError(
        "message",
        message ? "" : "Lütfen mesajınızı yazınız.",
      );

      if (!okName || !okEmail || !okMessage) {
        statusEl.textContent = "";
        statusEl.classList.remove("success");
        return;
      }

      statusEl.textContent =
        "Mesajınız alınmıştır. En kısa sürede size dönüş yapacağız.";
      statusEl.classList.add("success");
      contactForm.reset();
    });

    ["name", "email", "message"].forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("input", () => setError(id, ""));
      }
    });
  }


  /* ---------- Görünüme girince belirme ---------- */
  const fadeTargets = document.querySelectorAll(
    ".section-heading, .split-media, .split-text, .value-card, .stat-card, " +
      ".activity-card, .timeline-item, .gallery-item, .feature-item, " +
      ".event-item, .news-card, .masonry-item, .membership-card, " +
      ".lodge-card, .creed-card, .creed-closing, " +
      ".leader-card, .dept-item, .facility-item, .breakdown-item, " +
      ".service-item, .verse, .donate-inner, .contact-info, .contact-form, " +
      ".communities, .map-wrapper",
  );

  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );

  fadeTargets.forEach((el, i) => {
    el.classList.add("fade-in");
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    fadeObserver.observe(el);
  });

  /* ---------- Daktilo efekti (hero başlığı) ---------- */
  // Başlığı i18n her dil değişiminde yeniden yazdığı için efekt
  // setLang() sonunda tekrar tetiklenir.
  const typeTarget = document.querySelector("[data-typewriter]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let typeTimer = null;

  function runTypewriter(speed = 65) {
    if (!typeTarget || reduceMotion) return;
    clearTimeout(typeTimer);

    const source = Array.from(typeTarget.childNodes).map((n) => n.cloneNode(true));
    const caret = document.createElement("span");
    caret.className = "type-caret";
    caret.setAttribute("aria-hidden", "true");
    caret.textContent = typeTarget.dataset.typewriter || "|";

    // Yazarken alttaki içerik zıplamasın diye yükseklik sabitlenir
    typeTarget.style.minHeight = typeTarget.getBoundingClientRect().height + "px";
    typeTarget.textContent = "";
    typeTarget.appendChild(caret);

    // Metin düğümleri harf harf; <em>, <br> gibi öğeler olduğu gibi eklenir
    const steps = [];
    const plan = (nodes, parent) => {
      const anchor = () => (parent === typeTarget ? caret : null);
      nodes.forEach((node) => {
        if (node.nodeType === 3) {
          const holder = document.createTextNode("");
          steps.push(() => parent.insertBefore(holder, anchor()));
          for (const ch of node.nodeValue) {
            steps.push(() => (holder.nodeValue += ch));
          }
        } else {
          const shell = node.cloneNode(false);
          steps.push(() => parent.insertBefore(shell, anchor()));
          plan(Array.from(node.childNodes), shell);
        }
      });
    };
    plan(source, typeTarget);

    let i = 0;
    (function tick() {
      if (i >= steps.length) return;
      steps[i++]();
      typeTimer = setTimeout(tick, speed);
    })();
  }

  /* ---------- Dil seçimi (TR / EN / RU) ---------- */
  const INLINE_OK = new Set(["I", "STRONG", "EM", "BR", "SUP"]);
  const norm = (h) => h.replace(/\s+/g, " ").trim();

  // Çevrilebilir öğeler: yalnızca satır içi çocuk barındıranlar
  const i18nNodes = [];
  document
    .querySelectorAll("h1,h2,h3,h4,p,li,cite,figcaption,option,label,button,a,span")
    .forEach((el) => {
      if (el.closest("#langMenu, #langSwitch")) return;
      for (const child of el.children) {
        if (!INLINE_OK.has(child.tagName)) return;
      }
      const key = norm(el.innerHTML);
      if (!key || !/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(key)) return;
      i18nNodes.push({ el, key });
    });

  // 2. geçiş: satır dışı çocuk barındıran öğelerin (eyebrow, iletişim satırı,
  // etkinlik konumu) doğrudan metin düğümleri ayrıca çevrilir.
  const handled = new Set(i18nNodes.map((n) => n.el));
  const isInsideHandled = (el) => {
    for (const hEl of handled) if (hEl !== el && hEl.contains(el)) return true;
    return false;
  };
  const i18nTexts = [];
  document.querySelectorAll("body *").forEach((el) => {
    if (handled.has(el) || el.closest("#langSwitch") || isInsideHandled(el)) return;
    el.childNodes.forEach((node) => {
      if (node.nodeType !== 3) return;
      const raw = node.nodeValue;
      const key = norm(raw);
      if (!key || !/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(key)) return;
      const lead = /^\s/.test(raw) ? " " : "";
      const tail = /\s$/.test(raw) ? " " : "";
      i18nTexts.push({ node, key, lead, tail });
    });
  });

  const i18nAttrs = [];
  document.querySelectorAll("[placeholder]").forEach((el) => {
    i18nAttrs.push({ el, attr: "placeholder", key: el.getAttribute("placeholder") });
  });

  const docTitleTR = document.title;

  function setLang(lang) {
    const dict = (typeof I18N !== "undefined" && I18N[lang]) || null;
    const adict = (typeof I18N_ATTR !== "undefined" && I18N_ATTR[lang]) || null;

    i18nNodes.forEach(({ el, key }) => {
      const val = dict ? dict[key] : null;
      el.innerHTML = val || key; // karşılık yoksa Türkçe kalır
    });
    i18nTexts.forEach(({ node, key, lead, tail }) => {
      const val = dict ? dict[key] : null;
      node.nodeValue = lead + (val || key) + tail;
    });
    i18nAttrs.forEach(({ el, attr, key }) => {
      el.setAttribute(attr, (adict && adict[key]) || key);
    });

    document.title = (adict && adict.__title) || docTitleTR;
    document.documentElement.lang = lang;

    const cur = document.getElementById("langCurrent");
    if (cur) cur.textContent = lang.toUpperCase();
    document.querySelectorAll("#langMenu button").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });

    runTypewriter();

    try {
      localStorage.setItem("thb-lang", lang);
    } catch (e) {
      /* localStorage kapalıysa sessizce geç */
    }
  }

  const langSwitch = document.getElementById("langSwitch");
  const langBtn = document.getElementById("langBtn");
  if (langSwitch && langBtn) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = langSwitch.classList.toggle("open");
      langBtn.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll("#langMenu button").forEach((b) => {
      b.addEventListener("click", () => {
        setLang(b.dataset.lang);
        langSwitch.classList.remove("open");
        langBtn.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", (e) => {
      if (!langSwitch.contains(e.target)) {
        langSwitch.classList.remove("open");
        langBtn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") langSwitch.classList.remove("open");
    });
  }

  let saved = "tr";
  try {
    saved = localStorage.getItem("thb-lang") || "tr";
  } catch (e) {
    /* yoksay */
  }
  if (!["tr", "en", "ru"].includes(saved)) saved = "tr";
  setLang(saved);
});
