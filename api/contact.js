const nodemailer = require("nodemailer");

// Validación simple de email
function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

module.exports = async function handler(req, res) {
  // Solo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    res.setHeader("Cache-Control", "no-store");

    const body = req.body || {};

    // Compatibilidad: acepta llaves en inglés (name/email/message) y en español (nombre/correo/mensaje)
    const name = body.name ?? body.nombre ?? "";
    const email = body.email ?? body.correo ?? "";
    const message = body.message ?? body.mensaje ?? "";

    // Honeypot (si viene lleno, casi seguro es bot)
    const website = body.website ?? "";

    // Tiempo de carga del form (anti-bot)
    const tsStart = body.tsStart ?? body.formLoadedAt ?? 0;

    // Turnstile (puede venir como token o como "cf-turnstile-response")
    const token = body.token ?? body["cf-turnstile-response"] ?? "";

    // 1) Honeypot
    if (String(website).trim().length > 0) {
      // Respuesta silenciosa (no le da feedback al bot)
      return res.status(200).json({ ok: true });
    }

    // 2) Normalizar
    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim();
    const cleanMsg = String(message).trim();

    // 3) Validaciones
    if (!cleanName || !cleanEmail || !cleanMsg) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Correo inválido." });
    }
    if (cleanMsg.length < 10) {
      return res.status(400).json({ error: "Mensaje muy corto." });
    }
    if (cleanMsg.length > 4000) {
      return res.status(400).json({ error: "Mensaje demasiado largo." });
    }

    // Anti-spam simple: límite de links
    const linkCount = (cleanMsg.match(/https?:\/\//gi) || []).length;
    if (linkCount > 2) {
      return res.status(400).json({ error: "Demasiados enlaces en el mensaje." });
    }

    // Anti-bot por tiempo mínimo (si usted lo manda desde el front)
    const elapsed = Date.now() - Number(tsStart || 0);
    if (tsStart && elapsed < 1500) {
      return res.status(429).json({ error: "Envío demasiado rápido." });
    }

    // 4) Variables de entorno (Vercel / .env local)
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      CONTACT_TO,
      CONTACT_FROM,
      TURNSTILE_SECRET,
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
      return res.status(500).json({
        error: "Servidor sin configuración de correo (faltan variables).",
      });
    }

    // 5) Verificar Turnstile (solo si existe TURNSTILE_SECRET)
    // Si usted todavía no tiene Turnstile listo, puede dejar TURNSTILE_SECRET vacío
    if (TURNSTILE_SECRET) {
      if (!token) {
        return res.status(403).json({ error: "Captcha requerido." });
      }

      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: TURNSTILE_SECRET,
            response: token,
          }),
        }
      );

      const verifyJson = await verifyRes.json();
      if (!verifyJson.success) {
        return res.status(403).json({ error: "Captcha inválido." });
      }
    }

    // 6) Enviar correo
    const port = Number(SMTP_PORT);
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465, // 465 = TLS directo, 587 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const fromAddress = CONTACT_FROM || SMTP_USER;

    await transporter.sendMail({
      from: `"Formulario Web" <${fromAddress}>`,
      to: CONTACT_TO,
      replyTo: cleanEmail,
      subject: `Nuevo mensaje de ${cleanName}`,
      text: `Nombre: ${cleanName}\nCorreo: ${cleanEmail}\n\nMensaje:\n${cleanMsg}\n`,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error /api/contact:", err);
    return res.status(500).json({ error: "Error enviando el mensaje." });
  }
};