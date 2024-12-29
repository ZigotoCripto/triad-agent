// server.ts

import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';

const app = express();


const corsOptions = {
  origin: ['https://api.triadfi.co', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
};


app.use(cors(corsOptions));
app.post('/ask', express.json(), (req, res) => {
  const { question, additionalParam } = req.body;

  //
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  // 
  const command = `npx tsx ${path.join(__dirname, 'agent.ts')} "${question}" "${additionalParam || 'default'}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Failed to execute the agent script' });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: 'Error occurred while executing the script' });
    }

    // 
    res.json({ result: stdout });
  });
});
// get endpoint
app.get('/ask/:arg1/:arg2', (req, res) => {
  const { arg1, arg2 } = req.params;

  // Validação
  if (!arg1 || !arg2) {
    return res.status(400).json({ error: 'Both arg1 and arg2 are required' });
  }

  // Comando para execução
  const command = `npx tsx ${path.join(__dirname, 'agent.ts')} "${arg1}" "${arg2}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Failed to execute the agent script' });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: 'Error occurred while executing the script' });
    }

    res.json({ result: stdout.trim() });
  });
});


// 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
