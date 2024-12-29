import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';

const app = express();

//  CORS
const corsOptions = {
  origin: ['https://api.triadfi.co', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));
app.use(express.json());

//
const executeCommand = (arg1: string, arg2: string, res: express.Response) => {
  const command = `npx tsx ${path.join(__dirname, 'agent.ts')} "${arg1}" "${arg2}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error.message}`);
      return res.status(500).json({ error: 'Failed to execute the agent script' });
    }
    if (stderr) {
      console.error(`stderr: ${stderr.trim()}`);
      return res.status(500).json({ error: stderr.trim() });
    }

    res.json({ result: stdout.trim() });
  });
};

// Endpoint POST
app.post('/ask', (req, res) => {
  const { question, additionalParam } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  executeCommand(question, additionalParam || 'default', res);
});

// Endpoint GET usando Query Strings
app.get('/ask', (req, res) => {
  const { arg1, arg2 } = req.query;

  if (!arg1 || !arg2) {
    return res.status(400).json({ error: 'Both arg1 and arg2 are required' });
  }

  executeCommand(arg1 as string, arg2 as string, res);
});

// server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
