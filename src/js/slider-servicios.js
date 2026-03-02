(() => {
  function qs(sel, root = document) {
    return root.querySelector(sel);
  }
  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function initServiciosToggle() {
    const cardsServicios = qs("#cardsServicios");
    const botonesVerGaleria = qsa(".ver-galeria");
    const galerias = qsa(".galeria-servicio");
    const botonesVolver = qsa(".btn-volver");
    const headerServicios = qs("#servicios .section-header");

    if (!cardsServicios) return;

    const ocultarTodasLasGalerias = () => {
      galerias.forEach((g) => {
        g.classList.remove("activa");
        g.style.display = "none";
      });
    };

    const mostrarGaleria = (idGaleria) => {
      cardsServicios.classList.add("oculta");
      if (headerServicios) headerServicios.classList.add("oculta");

      setTimeout(() => {
        cardsServicios.classList.add("escondida");
        if (headerServicios) headerServicios.classList.add("escondida");

        ocultarTodasLasGalerias();
        const galeria = qs(`#galeria-${idGaleria}`);
        if (!galeria) return;

        galeria.style.display = "block";
        void galeria.offsetWidth; // reflow
        galeria.classList.add("activa");
        // ✅ Centrar carrusel cuando ya está visible (si no, no calcula bien)
requestAnimationFrame(() => {
  const viewports = Array.from(galeria.querySelectorAll(".galeria-viewport"));
  viewports.forEach((viewport) => {
    const track = viewport.querySelector(".galeria-track");
    if (!track) return;

    // Ponerlo en una zona "media" para que se vea centrado desde el inicio
    viewport.scrollLeft = track.scrollWidth / 4;
  });
});
        const yOffset = -120;
        const y = galeria.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 300);
    };

    const volverACards = () => {
      const galeriaActiva = qs(".galeria-servicio.activa");
      if (galeriaActiva) {
        galeriaActiva.classList.remove("activa");
        setTimeout(() => {
          galeriaActiva.style.display = "none";
          cardsServicios.classList.remove("escondida");
          if (headerServicios) headerServicios.classList.remove("escondida");

          requestAnimationFrame(() => {
            cardsServicios.classList.remove("oculta");
            if (headerServicios) headerServicios.classList.remove("oculta");
          });
        }, 300);
      } else {
        cardsServicios.classList.remove("escondida", "oculta");
        if (headerServicios) headerServicios.classList.remove("escondida", "oculta");
      }
    };

    botonesVerGaleria.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.galeria;
        if (id) mostrarGaleria(id);
      });
    });

    botonesVolver.forEach((btn) => btn.addEventListener("click", volverACards));
  }

  // Duplica imágenes para loop SOLO en galerías de servicios
  function initServiciosLoopDuplication() {
    const tracks = qsa(".galeria-servicio .galeria-track");
    tracks.forEach((track) => {
      const imgs = qsa("img", track);
      if (imgs.length < 2) return;

      if (track.dataset.loopReady === "1") return;
      track.dataset.loopReady = "1";

      imgs.forEach((img) => {
        const clone = img.cloneNode(true);
        clone.loading = "lazy";
        clone.setAttribute("draggable", "false");
        clone.style.userSelect = "none";
        clone.style.webkitUserDrag = "none";
        track.appendChild(clone);
      });
      // iniciar desde el centro visual
const viewport = track.closest(".galeria-viewport");
if (viewport) viewport.scrollLeft = track.scrollWidth / 4;
    });
  }

  // Drag + pausa/reanuda animación CSS SOLO en galerías de servicios (no en #proyectos)
  function initServiciosDrag() {
    const viewports = qsa(".galeria-servicio .galeria-viewport");
    viewports.forEach((viewport) => {
      const track = qs(".galeria-track", viewport);
      if (!track) return;

      let isDown = false;
      let startX = 0;
      let startScrollLeft = 0;
      let resumeTimer = null;

      viewport.style.overflowX = "auto";
      viewport.style.scrollBehavior = "auto";
      viewport.style.webkitOverflowScrolling = "touch";

      // ocultar scrollbar (si no lo hace en CSS)
      viewport.style.scrollbarWidth = "none";
      viewport.style.msOverflowStyle = "none";

      // bloquear drag imágenes
      qsa("img", track).forEach((img) => {
        img.setAttribute("draggable", "false");
        img.style.userSelect = "none";
        img.style.webkitUserDrag = "none";
        img.addEventListener("dragstart", (e) => e.preventDefault());
      });

      const pause = () => {
        track.style.animationPlayState = "paused";
        if (resumeTimer) clearTimeout(resumeTimer);
      };

      const resumeLater = () => {
        if (resumeTimer) clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => {
          track.style.animationPlayState = "running";
        }, 1500);
      };

      const pageX = (e) => (e.touches ? e.touches[0].pageX : e.pageX);

      viewport.addEventListener("mousedown", (e) => {
        isDown = true;
        viewport.classList.add("is-dragging");
        pause();
        startX = pageX(e) - viewport.getBoundingClientRect().left;
        startScrollLeft = viewport.scrollLeft;
      });

      viewport.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = pageX(e) - viewport.getBoundingClientRect().left;
        const walk = x - startX;
        viewport.scrollLeft = startScrollLeft - walk;
      });

      const stopMouse = () => {
        if (!isDown) return;
        isDown = false;
        viewport.classList.remove("is-dragging");
        resumeLater();
      };

      viewport.addEventListener("mouseup", stopMouse);
      viewport.addEventListener("mouseleave", stopMouse);
      document.addEventListener("mouseup", stopMouse);

      // touch
      viewport.addEventListener(
        "touchstart",
        (e) => {
          isDown = true;
          pause();
          startX = pageX(e) - viewport.getBoundingClientRect().left;
          startScrollLeft = viewport.scrollLeft;
        },
        { passive: true }
      );

      viewport.addEventListener(
        "touchmove",
        (e) => {
          if (!isDown) return;
          const x = pageX(e) - viewport.getBoundingClientRect().left;
          const walk = x - startX;
          viewport.scrollLeft = startScrollLeft - walk;
        },
        { passive: true }
      );

      viewport.addEventListener(
        "touchend",
        () => {
          isDown = false;
          resumeLater();
        },
        { passive: true }
      );
    });
  }

  // Slider vehicular (scrollBy + drag)
  function initVehicularSlider() {
    const vViewport = qs("#galeria-vehicular .vehicular-viewport");
    const vTrack = qs("#galeria-vehicular .vehicular-track");
    const vItems = qsa("#galeria-vehicular .vehicular-item");

    if (!vViewport || !vTrack || vItems.length === 0) return;

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let timer = null;

    vViewport.style.cursor = "grab";

    const startAutoplay = () => {
      stopAutoplay();
      timer = setInterval(() => {
        const itemWidth = vItems[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(vTrack).gap || "20") || 20;
        const maxScroll = vViewport.scrollWidth - vViewport.offsetWidth;

        if (vViewport.scrollLeft >= maxScroll - 5) {
          vViewport.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          vViewport.scrollBy({ left: itemWidth + gap, behavior: "smooth" });
        }
      }, 3200);
    };

    const stopAutoplay = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    vViewport.addEventListener("mousedown", (e) => {
      isDragging = true;
      vViewport.style.cursor = "grabbing";
      startX = e.pageX;
      startScrollLeft = vViewport.scrollLeft;
      stopAutoplay();
    });

    window.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      vViewport.style.cursor = "grab";
      setTimeout(startAutoplay, 1500);
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const walk = startX - e.pageX;
      vViewport.scrollLeft = startScrollLeft + walk;
    });

    vViewport.addEventListener("touchstart", stopAutoplay, { passive: true });
    vViewport.addEventListener(
      "touchend",
      () => setTimeout(startAutoplay, 1500),
      { passive: true }
    );

    startAutoplay();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initServiciosToggle();
    initServiciosLoopDuplication();
    initServiciosDrag();
    initVehicularSlider();
  });
})();