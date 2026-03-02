import "dotenv/config";
import express from "express";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false }));

const SPACE = process.env.CONTENTFUL_SPACE_ID;
const ENV = process.env.CONTENTFUL_ENV || "master";
const TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN;
const PORT = Number(process.env.PORT || 8787);

// CORS para Live Server / Vite
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  try {
    // 1) Turnstile (si hay secret configurado)
    const turnstileToken = req.body["cf-turnstile-response"];

    if (process.env.TURNSTILE_SECRET) {
      if (!turnstileToken) {
        return res.status(400).json({ error: "Captcha requerido." });
      }

      // IP opcional (no es obligatorio para Turnstile)
      const ip = (req.headers["cf-connecting-ip"] || req.ip || "").toString();

      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: process.env.TURNSTILE_SECRET,
            response: turnstileToken,
            ...(ip ? { remoteip: ip } : {})
          })
        }
      );

      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        return res.status(400).json({ error: "Captcha inválido." });
      }
    }

    // 2) Leer datos del form
    const { nombre, apellidos, empresa, correo, telefono, mensaje, website, formLoadedAt } = req.body;
    // 3) Anti-spam
    if (website) return res.status(400).json({ error: "Spam detectado" });

    const elapsed = Date.now() - parseInt(formLoadedAt || "0", 10);
    if (elapsed < 4000) return res.status(400).json({ error: "Muy rápido" });

    const linkCount = (String(mensaje || "").match(/https?:\/\//g) || []).length;
    if (linkCount > 1) return res.status(400).json({ error: "Demasiados enlaces" });

    if (!nombre || !apellidos || !empresa || !correo || !mensaje) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }

    // 4) Enviar correo

    if (!process.env.CONTACT_TO || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({ error: "Servidor sin configuración de correo." });
    } 

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_TO,
      replyTo: correo,
      subject: `Nuevo mensaje - ${nombre} ${apellidos}`,
      text:
      `Nombre: ${nombre} ${apellidos}
      Correo: ${correo}
      Teléfono: ${telefono || "No indicado"}
      Empresa: ${empresa}

      Mensaje:
      ${mensaje}`
          });

          return res.json({ success: true });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error enviando correo" });
      }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy Contentful en http://localhost:${PORT}`);
});
