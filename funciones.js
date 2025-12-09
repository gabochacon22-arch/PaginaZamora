document.addEventListener("DOMContentLoaded", () => {
  /* ==========================
     1. CAMBIO ENTRE CARDS Y GALERÍAS DE SERVICIOS
  =========================== */

  const cardsServicios = document.getElementById("cardsServicios");
  const botonesVerGaleria = document.querySelectorAll(".ver-galeria");
  const galerias = document.querySelectorAll(".galeria-servicio");
  const botonesVolver = document.querySelectorAll(".btn-volver");

  // Oculta todas las galerías
  function ocultarTodasLasGalerias() {
    galerias.forEach((g) => {
      g.classList.remove("activa");
      g.style.display = "none";
    });
  }

  // Muestra una galería específica
  function mostrarGaleria(idGaleria) {
    // Animar salida de los cards
    cardsServicios.classList.add("oculta");

    setTimeout(() => {
      // Ya no ocupa espacio
      cardsServicios.classList.add("escondida");

      ocultarTodasLasGalerias();

      const galeria = document.getElementById(`galeria-${idGaleria}`);
      if (!galeria) return;

      // Mostrar galería
      galeria.style.display = "block";
      // Forzar reflow para que tome el estado inicial antes de la animación
      void galeria.offsetWidth;
      galeria.classList.add("activa");
    }, 350); // debe coincidir con la duración de la transición en el CSS
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
        requestAnimationFrame(() => {
          cardsServicios.classList.remove("oculta");
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
     2. SLIDER DE GALERÍA (tipo albamedia)
  =========================== */

  const track = document.querySelector(".galeria-track");
  const slides = document.querySelectorAll(".galeria-slide");
  const btnPrev = document.querySelector(".galeria-btn.prev");
  const btnNext = document.querySelector(".galeria-btn.next");

  // Solo inicializar si realmente existe el slider
  if (track && slides.length > 0 && btnPrev && btnNext) {
    let currentIndex = 0;

    // 3 imágenes en desktop, 1 en móvil
    function getSlidesToShow() {
      return window.innerWidth <= 900 ? 1 : 3;
    }

    function actualizarSlider() {
      const slidesToShow = getSlidesToShow();
      const maxIndex = Math.max(slides.length - slidesToShow, 0);

      // Hacer que sea cíclico
      if (currentIndex < 0) currentIndex = maxIndex;
      if (currentIndex > maxIndex) currentIndex = 0;

      const porcentaje = (100 / slidesToShow) * currentIndex;
      track.style.transform = `translateX(-${porcentaje}%)`;
    }

    btnNext.addEventListener("click", () => {
      currentIndex++;
      actualizarSlider();
    });

    btnPrev.addEventListener("click", () => {
      currentIndex--;
      actualizarSlider();
    });

    // Recalcular cuando cambie el tamaño de la ventana
    window.addEventListener("resize", actualizarSlider);

    // Posición inicial
    actualizarSlider();
  }
});
