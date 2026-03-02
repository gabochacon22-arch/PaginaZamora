// src/js/brands-carousel.js
(() => {
  const ROWS = [
    { wrapperSel: ".brands-carousel-wrapper", trackSel: ".brands-carousel-track", dir: -1 }, // izquierda
    { wrapperSel: ".brands-carousel-wrapper2", trackSel: ".brands-carousel-track2", dir: 1 }, // derecha (reverse)
  ];

  // =========================
  // HOVER LOGOS (Rojo <-> Normal)
  // =========================
function initLogoHover() {
  // Guardamos src original y las rutas normal/rojo en data-*
  document.querySelectorAll(".brand-logo-carousel").forEach((img) => {
    const src = img.getAttribute("src");
    if (!src || src.includes("/public/imagenes/.png") || src.endsWith("/.png")) return;

    img.setAttribute("draggable", "false");
    img.style.userSelect = "none";
    img.style.webkitUserDrag = "none";
    img.addEventListener("dragstart", (e) => e.preventDefault());

    // original siempre es el src actual (generalmente el rojo)
    if (!img.dataset.srcOriginal) img.dataset.srcOriginal = src;

    // si hay data-hover, úselo como "normal"
    if (img.dataset.hover) {
      img.dataset.srcNormal = img.dataset.hover;
      img.dataset.srcRojo = img.dataset.srcOriginal;
      return;
    }

    // fallback por nombre (Rojo <-> normal)
    const isRojo = src.includes("Rojo");
    img.dataset.srcNormal = isRojo ? src.replace("Rojo", "") : src;
    img.dataset.srcRojo = isRojo ? src : src.replace(/(\.\w+)$/, "Rojo$1");
  });

  // Delegación: funciona para originales + clones
  document.addEventListener(
    "mouseover",
    (e) => {
      const img = e.target.closest(".brand-logo-carousel");
      if (!img) return;

      // evita disparos cuando se mueve dentro del mismo elemento
      if (e.relatedTarget && img.contains(e.relatedTarget)) return;

      const normal = img.dataset.srcNormal;
      if (!normal) return;

      const prev = img.getAttribute("src");
      if (prev === normal) return;

      img.setAttribute("src", normal);
      img.onerror = () => {
        img.onerror = null;
        img.setAttribute("src", prev);
      };
    },
    true
  );

  document.addEventListener(
    "mouseout",
    (e) => {
      const img = e.target.closest(".brand-logo-carousel");
      if (!img) return;

      if (e.relatedTarget && img.contains(e.relatedTarget)) return;

      const rojo = img.dataset.srcRojo || img.dataset.srcOriginal;
      if (!rojo) return;

      img.setAttribute("src", rojo);
    },
    true
  );
}

  // =========================
  // Loop por transform (GPU) sin saltos
  // =========================
  function cloneChildrenOnce(track) {
    if (track.dataset.loopReady === "1") return;

    const children = Array.from(track.children);
    if (children.length < 2) return;

    children.forEach((n) => track.appendChild(n.cloneNode(true)));
    track.dataset.loopReady = "1";
  }

  function waitForImages(track) {
    const imgs = Array.from(track.querySelectorAll("img"));
    if (!imgs.length) return Promise.resolve();

    return Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve();
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          })
      )
    );
  }

  function initRow({ wrapperSel, trackSel, dir }) {
    const wrapper = document.querySelector(wrapperSel);
    const track = document.querySelector(trackSel);
    if (!wrapper || !track) return;

    // Duplicar para loop real
    cloneChildrenOnce(track);

    let halfWidth = 0;
    let x = 0;                // posición actual (px)
    let isPaused = false;

    // Drag state
    let dragging = false;
    let dragStartX = 0;
    let dragStartPos = 0;

    // Velocidad (px/seg). Ajuste si quiere más/menos rápido
    const SPEED = 50;

    const computeHalfWidth = () => {
      // luego de duplicar, la mitad del ancho es 1 “ciclo”
      halfWidth = track.scrollWidth / 2;
      if (!halfWidth || !isFinite(halfWidth)) halfWidth = 0;
    };

    const apply = () => {
      // mantener x dentro de [ -halfWidth, 0 ) para evitar números gigantes
      if (halfWidth > 0) {
        // normalizamos: queremos que x siempre esté entre -halfWidth y 0
        while (x <= -halfWidth) x += halfWidth;
        while (x > 0) x -= halfWidth;
      }
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    };

    let lastTs = 0;
    const tick = (ts) => {
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      if (!isPaused && !dragging && halfWidth > 0) {
        x += dir * SPEED * dt; // mueve
        apply();
      }

      requestAnimationFrame(tick);
    };

    const pause = () => (isPaused = true);
    const resume = () => (isPaused = false);

    // Pausa suave en hover del carrusel
    wrapper.addEventListener("mouseenter", pause);
    wrapper.addEventListener("mouseleave", resume);

    // Drag fluido con Pointer Events (mouse + touch)
    wrapper.addEventListener("pointerdown", (e) => {
      dragging = true;
      wrapper.classList.add("is-dragging");
      pause();

      dragStartX = e.clientX;
      dragStartPos = x;

      // captura el puntero para no “soltar” si sale del wrapper
      wrapper.setPointerCapture?.(e.pointerId);
    });

    wrapper.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragStartX;
      x = dragStartPos + dx;
      apply();
    });

    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      wrapper.classList.remove("is-dragging");

      // pequeña espera para que no retome instantáneo (se siente más pro)
      setTimeout(resume, 350);

      try {
        wrapper.releasePointerCapture?.(e.pointerId);
      } catch {}
    };

    wrapper.addEventListener("pointerup", endDrag);
    wrapper.addEventListener("pointercancel", endDrag);
    wrapper.addEventListener("pointerleave", endDrag);

    // Recalcular al cargar imágenes / resize
    waitForImages(track).then(() => {
      computeHalfWidth();
      // arranque: que no empiece “cortado”
      x = 0;
      apply();
      requestAnimationFrame(tick);
    });

    window.addEventListener("resize", () => {
      computeHalfWidth();
      apply();
    });

    // Si se cambia de pestaña, evita saltos raros de dt
    document.addEventListener("visibilitychange", () => {
      lastTs = 0;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLogoHover();
    ROWS.forEach(initRow);
  });
})();