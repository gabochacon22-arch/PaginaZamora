document.addEventListener("DOMContentLoaded", () => {
  /* ==========================
     1. CAMBIO ENTRE CARDS Y GALERÍAS DE SERVICIOS
  =========================== */

  const cardsServicios = document.getElementById("cardsServicios");
  const botonesVerGaleria = document.querySelectorAll(".ver-galeria");
  const galerias = document.querySelectorAll(".galeria-servicio");
  const botonesVolver = document.querySelectorAll(".btn-volver");
  const headerServicios = document.querySelector("#servicios .section-header");


  // Oculta todas las galerías
  function ocultarTodasLasGalerias() {
    galerias.forEach((g) => {
      g.classList.remove("activa");
      g.style.display = "none";
    });
  }

  // Muestra una galería específica
  function mostrarGaleria(idGaleria) {
  cardsServicios.classList.add("oculta");
  if (headerServicios) headerServicios.classList.add("oculta");   // 👈 NUEVO

  setTimeout(() => {
    cardsServicios.classList.add("escondida");
    if (headerServicios) headerServicios.classList.add("escondida"); // 👈 NUEVO

      ocultarTodasLasGalerias();
      const galeria = document.getElementById(`galeria-${idGaleria}`);
      if (!galeria) return;

      galeria.style.display = "block";
      void galeria.offsetWidth;
      galeria.classList.add("activa");

      // ⭐ Llevar al usuario al inicio de la galería
      const yOffset = -120; // Ajusta si el header es más alto
      const y = galeria.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });

    }, 350); // misma duración que la animación
  }


  // Volver a los cards
  function volverACards() {
    const galeriaActiva = document.querySelector(".galeria-servicio.activa");

    if (galeriaActiva) {
      // Animar salida de la galería
      galeriaActiva.classList.remove("activa");

      setTimeout(() => {
        galeriaActiva.style.display = "none";

        // Mostrar de nuevo los cards
        cardsServicios.classList.remove("escondida");
        if (headerServicios) headerServicios.classList.remove("escondida"); // 👈 NUEVO
        
        requestAnimationFrame(() => {
          cardsServicios.classList.remove("oculta");
          if (headerServicios) headerServicios.classList.remove("oculta"); // 👈 NUEVO

          
        });
      }, 350);
    } else {
      // Por si acaso
      cardsServicios.classList.remove("escondida", "oculta");
    }
  }

  // Click en “Más detalles / Ver ejemplos / Cómo funciona”
  botonesVerGaleria.forEach((boton) => {
    boton.addEventListener("click", () => {
      const galeriaId = boton.dataset.galeria; // luminosos, vallas, interna, etc.
      mostrarGaleria(galeriaId);
    });
  });

  // Click en “← Volver a servicios”
  botonesVolver.forEach((boton) => {
    boton.addEventListener("click", volverACards);
  });

  /* ==========================
     2. SLIDER DE GALERÍA (tipo Albamedia: autoplay + drag con scroll)
  =========================== */

  const track = document.querySelector(".galeria-track");
  const slides = document.querySelectorAll(".galeria-slide");
  const viewport = document.querySelector(".galeria-viewport");

  // Solo inicializar si realmente existe el slider
  if (track && slides.length > 0 && viewport) {
    let currentIndex = 0;
    let slideWidth = 0;
    let maxIndex = 0;

    // Para drag
    let isDragging = false;
    let startPos = 0;
    let startScrollLeft = 0;

    // Autoplay
    const AUTO_TIME = 4500; // ms
    let autoPlayId = null;

    function actualizarMedidas() {
      // Calcular el ancho real del primer slide
      const firstSlide = slides[0];
      if (firstSlide) {
        slideWidth = firstSlide.getBoundingClientRect().width;
        // Incluir el gap (1.2rem = ~19px a tamaño base)
        const gap = 19;
        slideWidth += gap;
      }
      maxIndex = Math.max(slides.length - 1, 0);
    }

    function siguienteSlide() {
      currentIndex++;
      if (currentIndex > maxIndex) currentIndex = 0;

      const targetScroll = currentIndex * slideWidth;
      viewport.scrollTo({
        left: targetScroll,
        behavior: "smooth"
      });
    }

    function iniciarAutoplay() {
      detenerAutoplay();
      autoPlayId = setInterval(siguienteSlide, AUTO_TIME);
    }

    function detenerAutoplay() {
      if (autoPlayId) {
        clearInterval(autoPlayId);
        autoPlayId = null;
      }
    }

    // ---- Drag / swipe ----

    function getPosX(event) {
      return event.type.includes("mouse")
        ? event.pageX
        : event.touches[0].clientX;
    }

    function touchStart(event) {
      isDragging = true;
      startPos = getPosX(event);
      startScrollLeft = viewport.scrollLeft;
      detenerAutoplay();
    }

    function touchMove(event) {
      if (!isDragging) return;
      const currentPos = getPosX(event);
      const diff = currentPos - startPos;
      viewport.scrollLeft = startScrollLeft - diff;
    }

    function touchEnd() {
      if (!isDragging) return;
      isDragging = false;

      // Snap al slide más cercano
      const movedBy = Math.abs(viewport.scrollLeft - startScrollLeft);
      const threshold = slideWidth * 0.3;

      if (movedBy > threshold) {
        if (viewport.scrollLeft > startScrollLeft) {
          // Arrastraron a la derecha (retroceso)
          currentIndex--;
        } else {
          // Arrastraron a la izquierda (avance)
          currentIndex++;
        }
      }

      if (currentIndex < 0) currentIndex = maxIndex;
      if (currentIndex > maxIndex) currentIndex = 0;

      const targetScroll = currentIndex * slideWidth;
      viewport.scrollTo({
        left: targetScroll,
        behavior: "smooth"
      });

      iniciarAutoplay();
    }

    // Eventos de mouse
    viewport.addEventListener("mousedown", touchStart);
    window.addEventListener("mousemove", touchMove);
    window.addEventListener("mouseup", touchEnd);

    // Eventos táctiles
    viewport.addEventListener("touchstart", touchStart, { passive: true });
    viewport.addEventListener("touchmove", touchMove, { passive: true });
    viewport.addEventListener("touchend", touchEnd);

    // Evitar que se seleccione texto/imágenes durante el drag con mouse
    viewport.addEventListener("dragstart", (e) => e.preventDefault());

    // Recalcular en resize
    window.addEventListener("resize", actualizarMedidas);

    // Inicializar
    actualizarMedidas();
    iniciarAutoplay();
  }

  /* ==========================
     3. Slider vertical Rotulación Vehicular (auto scroll suave)
  =========================== */

  const vehViewport = document.querySelector(
    "#galeria-vehicular .galeria-viewport"
  );
  const vehSlides = document.querySelectorAll(
    "#galeria-vehicular .vehicular-track .galeria-slide"
  );

  if (vehViewport && vehSlides.length > 1) {
    let vehIndex = 0;

    function scrollVehicular() {
      const slide = vehSlides[0];
      if (!slide) return;

      const slideHeight = slide.offsetHeight + parseFloat(
        getComputedStyle(slide).marginBottom || "0"
      );

      vehIndex = (vehIndex + 1) % vehSlides.length;
      const top = slideHeight * vehIndex;

      vehViewport.scrollTo({
        top,
        behavior: "smooth",
      });
    }

    // Auto scroll cada 4 segundos
    setInterval(scrollVehicular, 4000);
  }

/* ==========================
   Slider Rotulación Vehicular (horizontal, 2 imágenes a la par)
========================== */

const vViewport = document.querySelector("#galeria-vehicular .vehicular-viewport");
const vTrack    = document.querySelector("#galeria-vehicular .vehicular-track");
const vSlides   = document.querySelectorAll("#galeria-vehicular .vehicular-slide");

if (vViewport && vTrack && vSlides.length > 1) {
  let vIndex = 0;
  const AUTO_TIME = 3800;
  let autoId = null;

  function goTo(index, withTransition = true) {
    vIndex = index;
    if (vIndex < 0) vIndex = vSlides.length - 1;
    if (vIndex >= vSlides.length) vIndex = 0;

    vTrack.style.transition = withTransition ? "transform .55s ease" : "none";
    vTrack.style.transform = `translateX(-${vIndex * vViewport.clientWidth}px)`;
  }

  function next() {
    goTo(vIndex + 1, true);
  }

  function startAuto() {
    stopAuto();
    autoId = setInterval(next, AUTO_TIME);
  }

  function stopAuto() {
    if (autoId) clearInterval(autoId);
    autoId = null;
  }

  // Recalcular en resize para que no se “corra”
  window.addEventListener("resize", () => goTo(vIndex, false));

  // (Opcional) pausar cuando el mouse entra
  vViewport.addEventListener("mouseenter", stopAuto);
  vViewport.addEventListener("mouseleave", startAuto);

  // Inicializar
  goTo(0, false);
  startAuto();
}

const header = document.querySelector(".header");
let lastY = window.scrollY;

window.addEventListener("scroll", () => {
  const y = window.scrollY;

  if (y > 80 && y > lastY) {
    // bajando
    header.classList.add("header-hide");
  } else {
    // subiendo o arriba
    header.classList.remove("header-hide");
  }

  lastY = y;
}, { passive: true });




});

/* ==========================
   Slider Rotulación Vehicular (autoplay + drag)
   usa .vehicular-item (SU HTML REAL)
========================== */
const vViewport = document.querySelector("#galeria-vehicular .vehicular-viewport");
const vTrack    = document.querySelector("#galeria-vehicular .vehicular-track");
const vItems    = document.querySelectorAll("#galeria-vehicular .vehicular-item");

if (vViewport && vTrack && vItems.length > 1) {
  let index = 0;
  const AUTO_TIME = 3500;
  let autoId = null;

  const getStep = () => {
    // ancho de 1 "card" + gap
    const item = vItems[0];
    const styles = getComputedStyle(vTrack);
    const gap = parseFloat(styles.columnGap || styles.gap || "0");
    return item.getBoundingClientRect().width + gap;
  };

  const goTo = (i) => {
    index = i;
    const maxIndex = vItems.length - 1;
    if (index < 0) index = maxIndex;
    if (index > maxIndex) index = 0;

    vViewport.scrollTo({
      left: index * getStep(),
      behavior: "smooth"
    });
  };

  const next = () => goTo(index + 1);

  const startAuto = () => {
    stopAuto();
    autoId = setInterval(next, AUTO_TIME);
  };

  const stopAuto = () => {
    if (autoId) clearInterval(autoId);
    autoId = null;
  };

  // Drag
  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;

  vViewport.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX;
    startScrollLeft = vViewport.scrollLeft;
    stopAuto();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    const walk = (e.pageX - startX);
    vViewport.scrollLeft = startScrollLeft - walk;
  });

  window.addEventListener("mouseup", () => {
    if (!isDown) return;
    isDown = false;

    // “snap” al item más cercano
    const step = getStep();
    index = Math.round(vViewport.scrollLeft / step);
    goTo(index);
    startAuto();
  });

  // Touch
  vViewport.addEventListener("touchstart", () => stopAuto(), { passive: true });
  vViewport.addEventListener("touchend", () => startAuto(), { passive: true });

  // Resize
  window.addEventListener("resize", () => goTo(index));

  startAuto();
}


