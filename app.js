// Import Express.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const accessToken = process.env.ACCESS_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = message?.from;
  const text = message?.text?.body;

  if (from && text) {
    let respuesta = 'Gracias por tu mensaje. ¿Quieres comenzar el reto de 3 días sin fumar?';
const texto = text.toLowerCase().trim();

if (texto.includes('hola') || texto.includes('/hola')) {
  respuesta = '¡Hola! ¿Cómo te sientes hoy en tu reto sin fumar?';
} else if (
  texto.includes('reto') ||
  texto.includes('/reto') ||
  texto.includes('registro') ||
  texto.includes('quiero participar')
) {
  respuesta = '🟢 ¡Bienvenido al Reto de 3 Días Sin Fumar, Vape o Hookah!\nEste reto te ayudará a reflexionar sobre tus hábitos, emociones y salud.\n\n👉 Para comenzar, autoriza tu participación completando este formulario:\nhttps://docs.google.com/forms/d/e/1FAIpQLScR13_YvHb5slEl3eSjcRZcZbAJKx_zMwFRQRY4d7KHzK3BJg/viewform\n\nCuando lo completes, vuelve al chat y escribe “Acepto” para continuar.';
} else if (
  texto.includes('acepto') ||
  texto.includes('completé') ||
  texto.includes('listo')
) {
  respuesta = '✅ ¡Perfecto! Gracias por sumarte.\nAntes de comenzar, te invito a ver este video de concienciación sobre tu salud pulmonar y el impacto del vapeo.\n(Video pendiente de integración)\n\nLuego escribe “Día 1” para iniciar tu reto.';
} else if (texto.includes('día 1') || texto.includes('/dia1')) {
  respuesta = '📅 Día 1: Reconocer el hábito.\n¿Qué te impulsa a fumar? Registra tus emociones y detonantes. Estoy aquí para acompañarte.';
} else if (texto.includes('día 2') || texto.includes('/dia2')) {
  respuesta = '📅 Día 2: Sustituir el impulso.\n¿Qué estrategias estás usando para resistir el deseo de fumar? ¿Qué te ha funcionado mejor hoy?';
} else if (texto.includes('día 3') || texto.includes('/dia3')) {
  respuesta = '📅 Día 3: Reflexionar sobre tu progreso.\n¿Qué has aprendido sobre ti en estos días? ¿Qué te motiva a seguir sin fumar?';
} else if (
  texto.includes('quiero fumar') ||
  texto.includes('tengo ganas de fumar') ||
  texto.includes('necesito fumar') ||
  texto.includes('registrar emoción') ||
  texto.includes('/registrar')
) {
  respuesta = '🧠 Es normal sentir deseos. ¿Qué estás sintiendo en este momento? ¿Qué lo está provocando? Escríbelo aquí para ayudarte a procesarlo.';
} else if (
  texto.includes('certificado') ||
  texto.includes('/certificado') ||
  texto.includes('terminé') ||
  texto.includes('completé el reto')
) {
  respuesta = '🎉 ¡Felicidades! Has completado el reto de 3 días sin fumar.\nTu esfuerzo merece reconocimiento. Puedes subir una foto que represente tu logro.\n\n🌟 *Tu salud es tu victoria. Tu decisión de cambiar es tu poder.* 🌟';
} else {
  respuesta = 'Estoy aquí para acompañarte en tu reto. Puedes escribir “Reto”, “Acepto”, “Día 1”, “Registrar emoción” o “Certificado” para continuar.';
}


    try {
      await axios.post(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: from,
          text: { body: respuesta }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`Respuesta enviada: ${respuesta}`);
    } catch (error) {
      console.error('Error al enviar la respuesta:', error.response?.data || error.message);
    }
  }

  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
