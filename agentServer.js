// Perplexity Agent Server for Code Editing
// Run this file to enable chat-driven code edits via Perplexity AI

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { PerplexityAIAgent } = require('./contracts/enhancedAudioStudioCommands');

const agent = new PerplexityAIAgent();
const app = express();
app.use(bodyParser.json());

// Endpoint: /edit-code
// Request: { filePath, userMessage }
app.post('/edit-code', async (req, res) => {
  const { filePath, userMessage } = req.body;
  if (!filePath || !userMessage) return res.status(400).send('Missing filePath or userMessage');

  try {
    const code = fs.readFileSync(path.resolve(filePath), 'utf8');
    const prompt = `Given the following code:\n${code}\n\nUser request: ${userMessage}\n\nSuggest the full edited code.`;
    const suggestion = await agent.getInsight(prompt);
    // Optionally, validate suggestion before writing
    fs.writeFileSync(path.resolve(filePath), suggestion, 'utf8');
    res.json({ success: true, suggestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: /agent-menu
app.get('/agent-menu', (req, res) => {
  res.json({ agents: ['PerplexityAIAgent', 'GPT', 'Claude'] });
});

const PORT = process.env.AGENT_PORT || 5050;
app.listen(PORT, () => {
  console.log(`Perplexity Agent Server running on port ${PORT}`);
});
