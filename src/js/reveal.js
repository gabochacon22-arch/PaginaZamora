// src/js/reveal.js
(() => {
  function initRevealOnScroll() {
    const candidates = document.querySelectorAll(`
      section,
      .card,
      .cta-card,
      .about-grid > *,
      .contact-grid > *
    `);

    candidates.forEach((el) => el.classList.add("reveal"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }

  document.addEventListener("DOMContentLoaded", initRevealOnScroll);
})();