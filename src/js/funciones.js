document.addEventListener("DOMContentLoaded", () => {

  // ==========================
  // HEADER / FOOTER (COMPONENTES)
  // ==========================

  
  function loadComponent(selector, filePath) {
    fetch(filePath)
      .then((response) => {
        if (!response.ok) throw new Error(`No se pudo cargar ${filePath}`);
        return response.text();
      })
      .then((html) => {
        const el = document.querySelector(selector);
        if (!el) return;
        el.innerHTML = html;
      })
      .catch((error) => console.error("Error cargando componente:", filePath, error));
  }

  // ==========================
  // SMOOTH SCROLL NAV (HEADER)
  // ==========================
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute("href");
    if (!id || id.length < 2) return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();

    // scroll suave
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    // opcional: actualizar URL sin salto
    history.pushState(null, "", id);
  });

  loadComponent("#header", "/src/components/Header.html");
  loadComponent("#footer", "/src/components/Footer.html");

  /* ==========================
     0. GOOGLE FORM EMBEBIDO
  ========================== */
  console.log("✅ Google Form embebido listo");

  /* ==========================
     1. CAMBIO ENTRE CARDS Y GALERÍAS DE SERVICIOS
  ========================== */
  const cardsServicios = document.getElementById("cardsServicios");
  const botonesVerGaleria = document.querySelectorAll(".ver-galeria");
  const galerias = document.querySelectorAll(".galeria-servicio");
  const botonesVolver = document.querySelectorAll(".btn-volver");
  const headerServicios = document.querySelector("#servicios .section-header");

  function ocultarTodasLasGalerias() {
    galerias.forEach((g) => {
      g.classList.remove("activa");
      g.style.display = "none";
    });
  }

  function mostrarGaleria(idGaleria) {
    if (!cardsServicios) return;

    cardsServicios.classList.add("oculta");
    if (headerServicios) headerServicios.classList.add("oculta");

    setTimeout(() => {
      cardsServicios.classList.add("escondida");
      if (headerServicios) headerServicios.classList.add("escondida");

      ocultarTodasLasGalerias();
      const galeria = document.getElementById(`galeria-${idGaleria}`);
      if (!galeria) return;

      galeria.style.display = "block";
      void galeria.offsetWidth; // fuerza reflow para animación
      galeria.classList.add("activa");

      const yOffset = -120;
      const y =
        galeria.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }, 350);
  }

  function volverACards() {
    if (!cardsServicios) return;

    const galeriaActiva = document.querySelector(".galeria-servicio.activa");

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
      }, 350);
    } else {
      cardsServicios.classList.remove("escondida", "oculta");
      if (headerServicios)
        headerServicios.classList.remove("escondida", "oculta");
    }
  }

  botonesVerGaleria.forEach((boton) => {
    boton.addEventListener("click", () => {
      const galeriaId = boton.dataset.galeria;
      if (galeriaId) mostrarGaleria(galeriaId);
    });
  });

  botonesVolver.forEach((boton) => {
    boton.addEventListener("click", volverACards);
  });

  /* ==========================
     2. SLIDER BANNER PRINCIPAL
  ========================== */
  const viewport = document.querySelector(".galeria-viewport");
  const track = document.querySelector(".galeria-track");
  const slides = document.querySelectorAll(".galeria-slide");

  if (viewport && track && slides.length > 0) {
    console.log("Slider inicializado con", slides.length, "slides");

    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let currentIndex = 0;
    let autoplayTimer = null;

    // Bloquear drag de imágenes dentro del slider
    slides.forEach((slide) => {
      const img = slide.querySelector("img");
      if (img) {
        img.setAttribute("draggable", "false");
        img.style.userSelect = "none";
        img.style.webkitUserDrag = "none";
        img.addEventListener("dragstart", (e) => e.preventDefault());
      }
    });

    function getPositionX(event) {
      return event.type.includes("mouse")
        ? event.pageX
        : event.touches[0].clientX;
    }

    function getSlideWidth() {
      return slides[0].getBoundingClientRect().width;
    }

    function setSliderPosition() {
      track.style.transform = `translateX(${currentTranslate}px)`;
    }

    function moveToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      currentIndex = index;
      const slideWidth = getSlideWidth();
      currentTranslate = -slideWidth * currentIndex;
      prevTranslate = currentTranslate;
      setSliderPosition();
    }

    function animation() {
      setSliderPosition();
      if (isDragging) requestAnimationFrame(animation);
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        moveToSlide(currentIndex + 1);
      }, 4000);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function touchStart(index) {
      return function (event) {
        currentIndex = index;
        startPos = getPositionX(event);
        isDragging = true;
        animationID = requestAnimationFrame(animation);
        viewport.style.cursor = "grabbing";
        track.style.transition = "none";
        stopAutoplay();
      };
    }

    function touchMove(event) {
      if (!isDragging) return;
      const currentPosition = getPositionX(event);
      currentTranslate = prevTranslate + currentPosition - startPos;
    }

    function touchEnd() {
      if (!isDragging) return;

      isDragging = false;
      cancelAnimationFrame(animationID);
      viewport.style.cursor = "grab";
      track.style.transition = "transform 0.4s ease-out";

      const movedBy = currentTranslate - prevTranslate;
      const slideWidth = getSlideWidth();

      if (movedBy < -slideWidth / 4) currentIndex += 1;
      if (movedBy > slideWidth / 4) currentIndex -= 1;

      moveToSlide(currentIndex);

      setTimeout(startAutoplay, 2000);
    }

    slides.forEach((slide, index) => {
      slide.addEventListener("touchstart", touchStart(index), { passive: true });
      slide.addEventListener("touchend", touchEnd);
      slide.addEventListener("touchmove", touchMove, { passive: true });

      slide.addEventListener("mousedown", touchStart(index));
      slide.addEventListener("mouseup", touchEnd);
      slide.addEventListener("mouseleave", () => {
        if (isDragging) touchEnd();
      });
      slide.addEventListener("mousemove", touchMove);
    });

    viewport.style.cursor = "grab";
    track.style.transition = "transform 0.4s ease-out";

    console.log("Iniciando autoplay...");
    startAutoplay();
  } else {
    console.log("No se encontró el slider");
  }

  /* ==========================
     3. SLIDER ROTULACIÓN VEHICULAR
  ========================== */
  const vViewport = document.querySelector(
    "#galeria-vehicular .vehicular-viewport"
  );
  const vTrack = document.querySelector("#galeria-vehicular .vehicular-track");
  const vItems = document.querySelectorAll("#galeria-vehicular .vehicular-item");

  if (vViewport && vTrack && vItems.length > 0) {
    let vIsDragging = false;
    let vStartX = 0;
    let vScrollLeft = 0;
    let vAutoTimer = null;

    vViewport.style.cursor = "grab";

    function vStartAutoplay() {
      if (vAutoTimer) clearInterval(vAutoTimer);

      vAutoTimer = setInterval(() => {
        const itemWidth = vItems[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(vTrack).gap || "20") || 20;
        const maxScroll = vViewport.scrollWidth - vViewport.offsetWidth;

        if (vViewport.scrollLeft >= maxScroll - 5) {
          vViewport.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          vViewport.scrollBy({ left: itemWidth + gap, behavior: "smooth" });
        }
      }, 3500);
    }

    function vStopAutoplay() {
      if (vAutoTimer) {
        clearInterval(vAutoTimer);
        vAutoTimer = null;
      }
    }

    vViewport.addEventListener("mousedown", (e) => {
      vIsDragging = true;
      vViewport.style.cursor = "grabbing";
      vStartX = e.pageX;
      vScrollLeft = vViewport.scrollLeft;
      vStopAutoplay();
    });

    window.addEventListener("mouseup", () => {
      if (!vIsDragging) return;
      vIsDragging = false;
      vViewport.style.cursor = "grab";
      setTimeout(vStartAutoplay, 2000);
    });

    window.addEventListener("mousemove", (e) => {
      if (!vIsDragging) return;
      e.preventDefault();
      const walk = vStartX - e.pageX;
      vViewport.scrollLeft = vScrollLeft + walk;
    });

    vViewport.addEventListener("touchstart", vStopAutoplay, { passive: true });
    vViewport.addEventListener("touchend", () => setTimeout(vStartAutoplay, 2000), {
      passive: true,
    });

    vStartAutoplay();
  }

  /* ==========================
     4. HEADER HIDE/SHOW
  ========================== */
  const header = document.querySelector(".header");
  let lastY = window.scrollY;

  if (header) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y > 80 && y > lastY) header.classList.add("header-hide");
        else header.classList.remove("header-hide");
        lastY = y;
      },
      { passive: true }
    );
  }

  /* ==========================
     5. CARRUSEL DE LOGOS - ARRASTRE + HOVER COLOR (FIX)
  =========================== */
  const brandsWrapper = document.querySelector(".brands-carousel-wrapper");
  const brandsTrack = document.querySelector(".brands-carousel-track");

  if (brandsWrapper && brandsTrack) {
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const imgs = Array.from(brandsTrack.querySelectorAll("img"));

    // Bloquear drag/selección de imágenes 
    imgs.forEach((img) => {
      img.setAttribute("draggable", "false");
      img.style.userSelect = "none";
      img.style.webkitUserDrag = "none";
      img.addEventListener("dragstart", (e) => e.preventDefault());
    });

    brandsWrapper.style.cursor = "grab";

    brandsWrapper.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.pageX - brandsWrapper.offsetLeft;
      scrollLeft = brandsWrapper.scrollLeft;
      brandsWrapper.style.cursor = "grabbing";
      brandsTrack.style.animationPlayState = "paused";
    });

    const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      brandsWrapper.style.cursor = "grab";

      setTimeout(() => {
        brandsTrack.style.animationPlayState = "running";
      }, 2000);
    };

    brandsWrapper.addEventListener("mouseup", stopDrag);
    document.addEventListener("mouseup", stopDrag);

    brandsWrapper.addEventListener("mouseleave", () => {
      if (!isDragging) return;
      isDragging = false;
      brandsWrapper.style.cursor = "grab";
    });

    brandsWrapper.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - brandsWrapper.offsetLeft;
      const walk = x - startX;
      brandsWrapper.scrollLeft = scrollLeft - walk;
    });

    brandsWrapper.addEventListener(
      "touchstart",
      () => {
        brandsTrack.style.animationPlayState = "paused";
      },
      { passive: true }
    );

    brandsWrapper.addEventListener(
      "touchend",
      () => {
        setTimeout(() => {
          brandsTrack.style.animationPlayState = "running";
        }, 2000);
      },
      { passive: true }
    );

  }
// ==========================
// 5B. SEGUNDA FILA DEL CARRUSEL (sentido contrario)
// ==========================
const brandsWrapper2 = document.querySelector(".brands-carousel-wrapper2");
const brandsTrack2 = document.querySelector(".brands-carousel-track2");

if (brandsWrapper2 && brandsTrack2) {
  let isDragging2 = false;
  let startX2 = 0;
  let scrollLeft2 = 0;

  const imgs2 = Array.from(brandsTrack2.querySelectorAll("img"));

  imgs2.forEach((img) => {
    img.setAttribute("draggable", "false");
    img.style.userSelect = "none";
    img.style.webkitUserDrag = "none";
    img.addEventListener("dragstart", (e) => e.preventDefault());
  });

  brandsWrapper2.style.cursor = "grab";

  brandsWrapper2.addEventListener("mousedown", (e) => {
    isDragging2 = true;
    startX2 = e.pageX - brandsWrapper2.offsetLeft;
    scrollLeft2 = brandsWrapper2.scrollLeft;
    brandsWrapper2.style.cursor = "grabbing";
    brandsTrack2.style.animationPlayState = "paused";
  });

  const stopDrag2 = () => {
    if (!isDragging2) return;
    isDragging2 = false;
    brandsWrapper2.style.cursor = "grab";

    setTimeout(() => {
      brandsTrack2.style.animationPlayState = "running";
    }, 2000);
  };

  brandsWrapper2.addEventListener("mouseup", stopDrag2);
  document.addEventListener("mouseup", stopDrag2);

  brandsWrapper2.addEventListener("mouseleave", () => {
    if (!isDragging2) return;
    isDragging2 = false;
    brandsWrapper2.style.cursor = "grab";
  });

  brandsWrapper2.addEventListener("mousemove", (e) => {
    if (!isDragging2) return;
    e.preventDefault();
    const x = e.pageX - brandsWrapper2.offsetLeft;
    const walk = x - startX2;
    brandsWrapper2.scrollLeft = scrollLeft2 - walk;
  });

  brandsWrapper2.addEventListener(
    "touchstart",
    () => {
      brandsTrack2.style.animationPlayState = "paused";
    },
    { passive: true }
  );

  brandsWrapper2.addEventListener(
    "touchend",
    () => {
      setTimeout(() => {
        brandsTrack2.style.animationPlayState = "running";
      }, 2000);
    },
    { passive: true }
  );

  console.log(" Carrusel fila 2 con arrastre activado");
}


  //  CAMBIO DE COLOR EN LOGOS (hover) 
  document.querySelectorAll(".brand-logo-carousel").forEach((logo) => {
    const src = logo.getAttribute("src");
    if (!src) return;

    const isRojo = src.includes("Rojo");
    const rojoSrc = isRojo ? src : src.replace(/(\.\w+)$/, "Rojo$1");
    const normalSrc = isRojo ? src.replace("Rojo", "") : src;

    logo.dataset.srcNormal = normalSrc;
    logo.dataset.srcRojo = rojoSrc;

    // bloquear drag también aquí
    logo.setAttribute("draggable", "false");
    logo.style.userSelect = "none";
    logo.style.webkitUserDrag = "none";
    logo.addEventListener("dragstart", (e) => e.preventDefault());

    logo.addEventListener("mouseenter", () => {
      logo.src = logo.dataset.srcNormal;
    });

    logo.addEventListener("mouseleave", () => {
      logo.src = logo.dataset.srcRojo;
    });
  });

  console.log("✅ Cambio de color en logos activado");

  /* ==========================
     6. FONDO DINÁMICO BANNER
  ========================== */
  (function () {
    const section = document.querySelector(".section-galeria");
    if (!section) return;

    const imgs = Array.from(section.querySelectorAll(".galeria-slide img"));
    if (!imgs.length) return;

    // Bloquear drag/selección del fondo también (por si acaso)
    imgs.forEach((img) => {
      img.setAttribute("draggable", "false");
      img.style.userSelect = "none";
      img.style.webkitUserDrag = "none";
      img.addEventListener("dragstart", (e) => e.preventDefault());
    });

    let i = 0;
    let bgTimer = null;

    function setBg(idx) {
      const src = imgs[idx]?.getAttribute("src");
      if (!src) return;
      section.style.setProperty("--banner-image", `url("${src}")`);
    }

    function startBg() {
      stopBg();
      bgTimer = setInterval(() => {
        i = (i + 1) % imgs.length;
        setBg(i);
      }, 4000);
    }

    function stopBg() {
      if (bgTimer) {
        clearInterval(bgTimer);
        bgTimer = null;
      }
    }

    setBg(0);
    startBg();

    section.addEventListener("mouseenter", stopBg);
    section.addEventListener("mouseleave", () => {
      if (!bgTimer) startBg();
    });
  })();
});

// ==========================
// REVEAL ON SCROLL (LAZY ANIM)
// ==========================
function initRevealOnScroll() {
  // Agarra secciones y bloques típicos
  const candidates = document.querySelectorAll(`
    section,
    .contact-grid > *,
    .galeria-slide,
    .galeria-slider,
    .galeria-viewport,
    .galeria-track
  `);

  candidates.forEach(el => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target); // una vez y listo (más liviano)
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

initRevealOnScroll();