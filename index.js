const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const client = new dialogflow.SessionsClient({
  keyFilename: 'mia-gtbh-6a391b18aeac.json'
});

const projectId = process.env.PROJECT_ID;

app.post('/webhook', async (req, res) => {
  const sessionId = Date.now().toString();
  const sessionPath = client.projectAgentSessionPath(projectId, sessionId);

  const { query } = req.body;

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
