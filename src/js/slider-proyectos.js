// src/js/slider-proyectos.js
(() => {
  function qs(sel, root = document) {
    return root.querySelector(sel);
  }
  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function initProyectosSlider() {
    const section = qs("#proyectos.section-galeria");
    if (!section) return;

    const viewport = qs(".galeria-viewport", section);
    const track = qs(".galeria-track", section);
    const slides = qsa(".galeria-slide", section);

    if (!viewport || !track || slides.length === 0) return;

    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let currentIndex = 0;
    let autoplayTimer = null;

    // bloquear drag de imágenes
    slides.forEach((slide) => {
      const img = qs("img", slide);
      if (img) {
        img.setAttribute("draggable", "false");
        img.style.userSelect = "none";
        img.style.webkitUserDrag = "none";
        img.addEventListener("dragstart", (e) => e.preventDefault());
        img.loading = "lazy";
      }
    });

    const getPositionX = (event) =>
      event.type.includes("mouse") ? event.pageX : event.touches[0].clientX;

    const getSlideWidth = () => slides[0].getBoundingClientRect().width;

    const setSliderPosition = () => {
      track.style.transform = `translateX(${currentTranslate}px)`;
    };

    const moveToSlide = (index) => {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      currentIndex = index;
      const w = getSlideWidth();
      currentTranslate = -w * currentIndex;
      prevTranslate = currentTranslate;
      setSliderPosition();
      setBg(currentIndex);
    };

    const animation = () => {
      setSliderPosition();
      if (isDragging) requestAnimationFrame(animation);
    };

    const startAutoplay = () => {
      stopAutoplay();
      autoplayTimer = setInterval(() => moveToSlide(currentIndex + 1), 4000);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = null;
    };

    const touchStart = (index) => (event) => {
      currentIndex = index;
      startPos = getPositionX(event);
      isDragging = true;
      animationID = requestAnimationFrame(animation);
      viewport.style.cursor = "grabbing";
      track.style.transition = "none";
      stopAutoplay();
    };

    const touchMove = (event) => {
      if (!isDragging) return;
      const currentPosition = getPositionX(event);
      currentTranslate = prevTranslate + currentPosition - startPos;
    };

    const touchEnd = () => {
      if (!isDragging) return;

      isDragging = false;
      cancelAnimationFrame(animationID);
      viewport.style.cursor = "grab";
      track.style.transition = "transform 0.4s ease-out";

      const movedBy = currentTranslate - prevTranslate;
      const w = getSlideWidth();

      if (movedBy < -w / 4) currentIndex += 1;
      if (movedBy > w / 4) currentIndex -= 1;

      moveToSlide(currentIndex);
      setTimeout(startAutoplay, 1500);
    };

    slides.forEach((slide, index) => {
      slide.addEventListener("touchstart", touchStart(index), { passive: true });
      slide.addEventListener("touchmove", touchMove, { passive: true });
      slide.addEventListener("touchend", touchEnd);

      slide.addEventListener("mousedown", touchStart(index));
      slide.addEventListener("mousemove", touchMove);
      slide.addEventListener("mouseup", touchEnd);
      slide.addEventListener("mouseleave", () => {
        if (isDragging) touchEnd();
      });
    });

    viewport.style.cursor = "grab";
    track.style.transition = "transform 0.4s ease-out";

    // Fondo dinámico usando --banner-image
    const imgs = slides.map((s) => qs("img", s)).filter(Boolean);
    function setBg(idx) {
      const src = imgs[idx]?.getAttribute("src");
      if (!src) return;
      section.style.setProperty("--banner-image", `url("${src}")`);
    }

    setBg(0);
    startAutoplay();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initProyectosSlider();
  });
})();