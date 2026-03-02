// src/js/contact-form.js
(() => {
  function setError(input, msg) {
    const group = input.closest(".form-group");
    const small = group ? group.querySelector(".error-msg") : null;
    if (small) small.textContent = msg || "";
    input.classList.toggle("has-error", Boolean(msg));
  }

  function clearError(input) {
    setError(input, "");
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function normalizePhone(v) {
    // deja solo dígitos
    const digits = (v || "").replace(/\D/g, "");
    // CR típico: 8 dígitos (sin +506). Si ponen +506, queda 11.
    if (digits.length === 11 && digits.startsWith("506"))
      return digits.slice(3);
    return digits;
  }

  async function submitJSON(endpoint, payload) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || "Error enviando formulario");
    }
    return res;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    if (!form) return;

    // marca el tiempo de carga (anti-bots básico)
    const loadedAt = document.getElementById("formLoadedAt");
    if (loadedAt) loadedAt.value = String(Date.now());

    const statusEl = document.getElementById("formStatus");
    const phoneInput = document.getElementById("phoneInput");
    const phoneHidden = document.getElementById("telefono");

    // formatea teléfono mientras escribe (opcional)
    if (phoneInput && phoneHidden) {
      phoneInput.addEventListener("input", () => {
        const digits = normalizePhone(phoneInput.value);
        phoneHidden.value = digits;
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (statusEl) statusEl.textContent = "";

      const endpoint = form.dataset.endpoint || "";
      const hp = form.querySelector('input[name="website"]'); // honeypot

      // honeypot lleno => bot
      if (hp && hp.value.trim().length > 0) {
        if (statusEl)
          statusEl.textContent = "No se pudo enviar. Intente de nuevo.";
        return;
      }

      // envío demasiado rápido => bot
      const loaded = Number(loadedAt?.value || "0");
      if (loaded && Date.now() - loaded < 4000) {
        if (statusEl)
          statusEl.textContent = "Espere un momento e intente de nuevo.";
        return;
      }

      const nombre = form.querySelector('input[name="nombre"]');
      const correo = form.querySelector('input[name="correo"]');
      const mensaje = form.querySelector('textarea[name="mensaje"]');
      const consentimiento = form.querySelector('input[name="consentimiento"]');

      let ok = true;

      // Validaciones
      if (!nombre || nombre.value.trim().length < 3) {
        ok = false;
        setError(nombre || form, "Ingrese su nombre.");
      } else clearError(nombre);

      if (!correo || !isEmail(correo.value.trim())) {
        ok = false;
        setError(correo || form, "Ingrese un email válido.");
      } else clearError(correo);

      if (!mensaje || mensaje.value.trim().length < 12) {
        ok = false;
        setError(
          mensaje || form,
          "Cuéntenos un poco más (mínimo 12 caracteres).",
        );
      } else clearError(mensaje);

      if (consentimiento && !consentimiento.checked) {
        ok = false;
        // mensaje debajo del textarea suele ser suficiente; aquí marcamos checkbox
        consentimiento.classList.add("has-error");
        if (statusEl)
          statusEl.textContent = "Debe aceptar la política para enviar.";
      } else if (consentimiento) {
        consentimiento.classList.remove("has-error");
      }

      // Teléfono (opcional)
      const phoneDigits = normalizePhone(phoneInput?.value || "");
      if (phoneHidden) phoneHidden.value = phoneDigits;

      if (!ok) return;

      // Payload
      const apellidos = form.querySelector('input[name="apellidos"]');
      const empresa = form.querySelector('input[name="empresa"]');
      const turnstile = form.querySelector(
        'input[name="cf-turnstile-response"]',
      );
      
      const payload = {
        nombre: nombre.value.trim(),
        apellidos: (apellidos?.value || "").trim(),
        correo: correo.value.trim(),
        telefono: phoneDigits,
        empresa: (empresa?.value || "").trim(),
        mensaje: mensaje.value.trim(),

        // Anti-spam (backend)
        website: hp?.value || "",
        formLoadedAt: loadedAt?.value || "",

        // Turnstile
        "cf-turnstile-response": turnstile?.value || "",

        page: location.href,
        ts: new Date().toISOString(),
      };

      // Si no hay endpoint, solo valida (modo demo)
      if (!endpoint) {
        if (statusEl)
          statusEl.textContent =
            "Formulario validado. Falta configurar el envío (endpoint).";
        return;
      }

      // Enviar
      try {
        if (statusEl) statusEl.textContent = "Enviando...";
        await submitJSON(endpoint, payload);
        if (statusEl) statusEl.textContent = "¡Listo! Su mensaje fue enviado.";
        form.reset();
        if (loadedAt) loadedAt.value = String(Date.now());
      } catch (err) {
        console.error(err);
        if (statusEl)
          statusEl.textContent = "No se pudo enviar. Intente nuevamente.";
      }
    });
  });
})();
