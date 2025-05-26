const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const credentialsJSON = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, 'base64').toString('utf-8');
const credentials = JSON.parse(credentialsJSON);

const client = new dialogflow.SessionsClient({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key
  }
});


const projectId = process.env.PROJECT_ID;

app.post('/webhook', async (req, res) => {
  const sessionId = Date.now().toString();

if (!projectId) {
  console.error('❌ PROJECT_ID no está definido. Revisa tu archivo .env o variable de entorno.');
  return res.status(500).json({ reply: 'Error interno de configuración. Falta PROJECT_ID.' });
}
  const sessionPath = client.projectAgentSessionPath(projectId, sessionId);

  const { query } = req.body;

if (!query) {
  return res.status(400).json({ reply: 'No recibí ninguna pregunta.' });
}


  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: 'es'
      }
    }
  };

  try {
    const responses = await client.detectIntent(request);
    const result = responses[0].queryResult;

console.log('🎯 Respuesta Dialogflow:', result.fulfillmentText);


    res.json({ reply: result.fulfillmentText });
  } catch (error) {
    console.error('❌ Error en Dialogflow:', error);
    res.status(500).json({ error: 'No se pudo procesar tu consulta' });
  }
});

app.use(express.static('public'));
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ MIA backend activo en http://localhost:${PORT}`);
});
