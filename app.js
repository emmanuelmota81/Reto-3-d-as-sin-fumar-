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
    } else if (texto.includes('ansiedad') || texto.includes('/ansiedad')) {
      respuesta = 'Entiendo que sientas ansiedad. Respira profundo, estás haciendo un gran esfuerzo.';
    } else if (texto.includes('certificado') || texto.includes('/certificado')) {
      respuesta = '¡Felicidades! Has completado el reto. Aquí tienes tu certificado 🎉';
    } else if (texto.includes('reto') || texto.includes('/reto')) {
      respuesta = '¡Bienvenido al Reto de 3 Días Sin Fumar, Vape o Hookah!';
    } else if (texto.includes('hoy') || texto.includes('/hoy')) {
      respuesta = 'Hoy es el primer paso hacia tu libertad. ¿Estás listo para comenzar?';
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
