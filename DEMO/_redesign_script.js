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

  /* ---------- İstatistik rakamları ---------- */
  // Sayaç animasyonu kaldırıldı: sayının artışını izlemek okumaya
  // katkı sağlamıyordu. Rakam doğrudan yazılıyor.
  document.querySelectorAll(".stat-number[data-target]").forEach((el) => {
    const n = parseInt(el.dataset.target, 10) || 0;
    el.textContent = n.toLocaleString("tr-TR") + (el.dataset.suffix || "");
  });

  /* ---------- Galeri lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const items = Array.from(document.querySelectorAll(".masonry-item"));
  let currentIndex = 0;

  function showImage(index) {
    currentIndex = (index + items.length) % items.length;
    const img = items[currentIndex].querySelector("img");
    const caption = items[currentIndex].querySelector("figcaption");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : "";
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
