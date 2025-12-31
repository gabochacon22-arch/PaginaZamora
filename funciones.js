document.addEventListener("DOMContentLoaded", () => {
  /* ==========================
     0. GOOGLE FORM EMBEBIDO
     (No requiere validación adicional)
  =========================== */
  
  console.log("✅ Google Form embebido listo");

  /* ==========================
     1. CAMBIO ENTRE CARDS Y GALERÍAS DE SERVICIOS
  =========================== */

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
    cardsServicios.classList.add("oculta");
    if (headerServicios) headerServicios.classList.add("oculta");

    setTimeout(() => {
      cardsServicios.classList.add("escondida");
      if (headerServicios) headerServicios.classList.add("escondida");

      ocultarTodasLasGalerias();
      const galeria = document.getElementById(`galeria-${idGaleria}`);
      if (!galeria) return;

      galeria.style.display = "block";
      void galeria.offsetWidth;
      galeria.classList.add("activa");

      const yOffset = -120;
      const y = galeria.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });
    }, 350);
  }

  function volverACards() {
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
    }
  }

  botonesVerGaleria.forEach((boton) => {
    boton.addEventListener("click", () => {
      const galeriaId = boton.dataset.galeria;
      mostrarGaleria(galeriaId);
    });
  });

  botonesVolver.forEach((boton) => {
    boton.addEventListener("click", volverACards);
  });

  /* ==========================
     2. SLIDER BANNER PRINCIPAL - VERSIÓN SIMPLE Y FUNCIONAL
  =========================== */

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

    // Obtener posición del evento (mouse o touch)
    function getPositionX(event) {
      return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    // Calcular ancho de slide
    function getSlideWidth() {
      return slides[0].getBoundingClientRect().width;
    }

    // Mover a un índice específico
    function moveToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      
      currentIndex = index;
      const slideWidth = getSlideWidth();
      currentTranslate = -slideWidth * currentIndex;
      prevTranslate = currentTranslate;
      setSliderPosition();
    }

    // Aplicar transformación
    function setSliderPosition() {
      track.style.transform = `translateX(${currentTranslate}px)`;
    }

    // Animación durante el drag
    function animation() {
      setSliderPosition();
      if (isDragging) requestAnimationFrame(animation);
    }

    // Autoplay
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

    // EVENTOS TOUCH/MOUSE START
    function touchStart(index) {
      return function(event) {
        currentIndex = index;
        startPos = getPositionX(event);
        isDragging = true;
        animationID = requestAnimationFrame(animation);
        viewport.style.cursor = 'grabbing';
        track.style.transition = 'none';
        stopAutoplay();
      }
    }

    // TOUCH/MOUSE MOVE
    function touchMove(event) {
      if (isDragging) {
        const currentPosition = getPositionX(event);
        currentTranslate = prevTranslate + currentPosition - startPos;
      }
    }

    // TOUCH/MOUSE END
    function touchEnd() {
      isDragging = false;
      cancelAnimationFrame(animationID);
      viewport.style.cursor = 'grab';
      track.style.transition = 'transform 0.4s ease-out';

      const movedBy = currentTranslate - prevTranslate;
      const slideWidth = getSlideWidth();

      // Si movió más del 25% del ancho, cambiar de slide
      if (movedBy < -slideWidth / 4 && currentIndex < slides.length - 1) {
        currentIndex += 1;
      }
      if (movedBy > slideWidth / 4 && currentIndex > 0) {
        currentIndex -= 1;
      }

      moveToSlide(currentIndex);
      
      // Reiniciar autoplay después de 2 segundos
      setTimeout(() => {
        startAutoplay();
      }, 2000);
    }

    // Configurar eventos para cada slide
    slides.forEach((slide, index) => {
      const slideImage = slide.querySelector('img');
      if (slideImage) {
        slideImage.addEventListener('dragstart', (e) => e.preventDefault());
      }

      // Touch events
      slide.addEventListener('touchstart', touchStart(index), { passive: true });
      slide.addEventListener('touchend', touchEnd);
      slide.addEventListener('touchmove', touchMove, { passive: true });

      // Mouse events
      slide.addEventListener('mousedown', touchStart(index));
      slide.addEventListener('mouseup', touchEnd);
      slide.addEventListener('mouseleave', () => {
        if (isDragging) touchEnd();
      });
      slide.addEventListener('mousemove', touchMove);
    });

    // Configuración inicial
    viewport.style.cursor = 'grab';
    track.style.transition = 'transform 0.4s ease-out';
    
    // Iniciar autoplay
    console.log("Iniciando autoplay...");
    startAutoplay();
  } else {
    console.log("No se encontró el slider");
  }

  /* ==========================
     3. SLIDER ROTULACIÓN VEHICULAR
  =========================== */

  const vViewport = document.querySelector("#galeria-vehicular .vehicular-viewport");
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
          vViewport.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          vViewport.scrollBy({ left: itemWidth + gap, behavior: 'smooth' });
        }
      }, 3500);
    }

    function vStopAutoplay() {
      if (vAutoTimer) {
        clearInterval(vAutoTimer);
        vAutoTimer = null;
      }
    }

    // Mouse
    vViewport.addEventListener("mousedown", (e) => {
      vIsDragging = true;
      vViewport.style.cursor = "grabbing";
      vStartX = e.pageX;
      vScrollLeft = vViewport.scrollLeft;
      vStopAutoplay();
    });

    window.addEventListener("mouseup", () => {
      if (vIsDragging) {
        vIsDragging = false;
        vViewport.style.cursor = "grab";
        setTimeout(vStartAutoplay, 2000);
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (!vIsDragging) return;
      e.preventDefault();
      const x = e.pageX;
      const walk = (vStartX - x);
      vViewport.scrollLeft = vScrollLeft + walk;
    });

    // Touch
    vViewport.addEventListener("touchstart", () => vStopAutoplay(), { passive: true });
    vViewport.addEventListener("touchend", () => setTimeout(vStartAutoplay, 2000), { passive: true });

    vStartAutoplay();
  }

  /* ==========================
     4. HEADER HIDE/SHOW
  =========================== */

  const header = document.querySelector(".header");
  let lastY = window.scrollY;

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y > 80 && y > lastY) {
      header.classList.add("header-hide");
    } else {
      header.classList.remove("header-hide");
    }
    lastY = y;
  }, { passive: true });

  /* ==========================
     5. LOGOS HOVER
  =========================== */

  document.querySelectorAll('.brand-logo').forEach(logo => {
    const normal = logo.dataset.normal;
    const rojo = logo.dataset.rojo;

    if (normal && rojo) {
      logo.addEventListener('mouseenter', () => {
        logo.src = normal;
      });
      logo.addEventListener('mouseleave', () => {
        logo.src = rojo;
      });
    }
  });

  /* ==========================
     6. FONDO DINÁMICO BANNER
  =========================== */

  (function () {
  const section = document.querySelector('.section-galeria');
  if (!section) return;

  const imgs = Array.from(section.querySelectorAll('.galeria-slide img'));
  if (!imgs.length) return;

  let i = 0;
  let bgTimer = null;

  function setBg(idx) {
    const src = imgs[idx]?.getAttribute('src');
    if (!src) return;

    // Se pasa la imagen a CSS
    section.style.setProperty('--banner-image', `url("${src}")`);
  }

  setBg(0);

  bgTimer = setInterval(() => {
    i = (i + 1) % imgs.length;
    setBg(i);
  }, 4000);

  section.addEventListener('mouseenter', () => {
    if (bgTimer) {
      clearInterval(bgTimer);
      bgTimer = null;
    }
  });

  section.addEventListener('mouseleave', () => {
    if (!bgTimer) {
      bgTimer = setInterval(() => {
        i = (i + 1) % imgs.length;
        setBg(i);
      }, 4000);
    }
  });
})();


});