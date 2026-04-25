/**
 * Envio de alertas a contactos (Twilio SMS y/o SendGrid email).
 * Si faltan credenciales, devuelve omitido: true (sin error).
 */
async function notificarContactos(contactos, asunto, cuerpo) {
  const resultados = [];

  for (const c of contactos) {
    if (!c.activo) continue;
    const nombre = c.nombre || "Contacto";
    const etiqueta = c.parentesco
      ? `${nombre} (${c.parentesco})`
      : nombre;

    if (c.email && process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM) {
      try {
        const sg = require("@sendgrid/mail");
        sg.setApiKey(process.env.SENDGRID_API_KEY);
        await sg.send({
          to: c.email,
          from: process.env.SENDGRID_FROM,
          subject: asunto,
          text: cuerpo,
        });
        resultados.push({ destino: c.email, canal: "email", ok: true });
      } catch (e) {
        resultados.push({
          destino: c.email,
          canal: "email",
          ok: false,
          error: e.message,
        });
      }
    } else if (c.email) {
      resultados.push({
        destino: c.email,
        canal: "email",
        omitido: true,
        razon: "SENDGRID no configurado",
      });
    }

    if (c.telefono && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
      try {
        const twilio = require("twilio");
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        await client.messages.create({
          body: `${etiqueta}\n\n${asunto}\n\n${cuerpo}`,
          from: process.env.TWILIO_FROM,
          to: c.telefono,
        });
        resultados.push({ destino: c.telefono, canal: "sms", ok: true });
      } catch (e) {
        resultados.push({
          destino: c.telefono,
          canal: "sms",
          ok: false,
          error: e.message,
        });
      }
    } else if (c.telefono) {
      resultados.push({
        destino: c.telefono,
        canal: "sms",
        omitido: true,
        razon: "Twilio no configurado",
      });
    }
  }

  return resultados;
}

module.exports = { notificarContactos };
