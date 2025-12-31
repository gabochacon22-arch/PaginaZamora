# Configuración de EmailJS para el Formulario de Contacto

## Paso 1: Crear una Cuenta en EmailJS

1. Visita [emailjs.com](https://www.emailjs.com)
2. Haz clic en "Sign Up" o regístrate con Google/GitHub
3. Completa el formulario de registro

## Paso 2: Obtener tu Public Key

1. Inicia sesión en tu dashboard de EmailJS
2. Ve a la sección "Account" (Cuenta)
3. Copia tu **Public Key** (algo como: `htvGP5dHM1xXIH55g`)
4. Reemplaza en `funciones.js` línea ~9:
   ```javascript
   emailjs.init("TU_PUBLIC_KEY_AQUI"); // Reemplaza con tu clave
   ```

## Paso 3: Crear un Email Service

1. En el dashboard, ve a **Email Services** (Servicios de Email)
2. Haz clic en **"Add New Service"**
3. Elige tu proveedor de email (Gmail recomendado):
   - **Service Name:** `service_multiimagen`
   - Sigue las instrucciones para conectar tu email
4. Copia el **Service ID** y reemplaza en `funciones.js` línea ~27:
   ```javascript
   "service_multiimagen",  // Tu Service ID aquí
   ```

## Paso 4: Crear un Email Template

1. Ve a **Email Templates** en el dashboard
2. Haz clic en **"Create New Template"**
3. Usa este template HTML:

```html
<h2>Nuevo mensaje de {{from_name}}</h2>
<p><strong>Email:</strong> {{from_email}}</p>
<p><strong>Teléfono:</strong> {{phone}}</p>
<p><strong>Empresa:</strong> {{company}}</p>
<hr>
<h3>Mensaje:</h3>
<p>{{message}}</p>
```

4. Guarda con el nombre: `template_contacto`
5. Copia el **Template ID** y reemplaza en `funciones.js` línea ~28:
   ```javascript
   "template_contacto",    // Tu Template ID aquí
   ```

## Paso 5: Configurar Email Destino

En el mismo template, ve a la pestaña **"Settings"** y asegúrate de que:
- **To Email:** `ventas@multimagencr.com` (o tu email preferido)

## Verificación Final

Una vez configurado, prueba el formulario en tu página:
1. Llena todos los campos
2. Haz clic en "Enviar"
3. Deberías recibir un email en tu bandeja de entrada

## Notas Importantes

- **Límite gratuito:** EmailJS permite 200 emails/mes en el plan gratuito
- **Para producción:** Considera un plan de pago si esperas más de 200 emails mensuales
- **Seguridad:** Nunca compartas tu Public Key en el código cliente (es seguro, está diseñado para eso)
- **Debugging:** Si hay errores, revisa la consola del navegador (F12 → Console)

## Alternativa: Si prefieres usar Formspree

Si no quieres usar EmailJS, puedes usar [Formspree.io](https://formspree.io):
1. Crea una cuenta
2. Reemplaza el método de envío en `funciones.js`
3. Usar un endpoint HTTP POST en lugar de EmailJS

---

**¿Preguntas?** Revisa la documentación oficial: [emailjs.com/docs](https://www.emailjs.com/docs/)
