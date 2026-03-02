// src/js/header.js
(() => {
  function loadComponent(selector, filePath) {
    return fetch(filePath)
      .then((r) => {
        if (!r.ok) throw new Error(`No se pudo cargar ${filePath}`);
        return r.text();
      })
      .then((html) => {
        const el = document.querySelector(selector);
        if (el) el.innerHTML = html;
      })
      .catch((err) => console.error("Error cargando componente:", filePath, err));
  }

  function initSmoothScroll() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const id = link.getAttribute("href");
      if (!id || id.length < 2) return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", id);
    });

    // Botones que van a contacto (hero / header)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".js-go-contact");
      if (!btn) return;
      const target = document.querySelector("#contacto");
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", "#contacto");
    });
  }

  function initHeaderHideShow() {
    const header = document.querySelector(".header");
    if (!header) return;

    let lastY = window.scrollY;

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

  document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
      loadComponent("#header", "/src/components/Header.html"),
      loadComponent("#footer", "/src/components/Footer.html"),
    ]);

    initSmoothScroll();
    initHeaderHideShow();
  });
})();