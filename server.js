const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const publicDir = path.join(__dirname, 'public');

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*'
  });
  res.end(body);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, 'utf8', (error, content) => {
    if (error) {
      sendJson(res, 500, { error: 'Unable to load file.' });
      return;
    }

    const ext = path.extname(filePath);
    const contentType = ext === '.html' ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

function createRecommendations({ skillLevel, goal }) {
  const level = (skillLevel || 'beginner').toLowerCase();
  const normalizedGoal = goal || 'build real-world projects';

  const baseline = {
    beginner: [
      'Start with guided issue-based tasks and pair each change with a test.',
      'Use AI explanations to understand pull request feedback before coding.'
    ],
    intermediate: [
      'Automate repetitive setup tasks with project templates and scripts.',
      'Use AI to generate implementation outlines before coding.'
    ],
    advanced: [
      'Set up workflow automation for CI checks and release readiness.',
      'Use AI-assisted code review prompts to improve maintainability.'
    ]
  };

  return {
    goal: normalizedGoal,
    recommendations: baseline[level] || baseline.beginner
  };
}

function createWorkflow({ projectType }) {
  const type = projectType || 'full-stack web app';

  return {
    projectType: type,
    workflow: [
      'Plan learning goals and break work into contributor-friendly issues.',
      'Implement modular frontend/backend changes in small pull requests.',
      'Run tests, gather AI suggestions, and iterate based on review feedback.'
    ]
  };
}

function requestHandler(req, res) {
  if (!req.url) {
    sendJson(res, 400, { error: 'Invalid request.' });
    return;
  }

  const parsedUrl = new URL(req.url, 'http://localhost');

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && parsedUrl.pathname === '/api/health') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  if (req.method === 'GET' && parsedUrl.pathname === '/api/recommendations') {
    const skillLevel = parsedUrl.searchParams.get('skillLevel');
    const goal = parsedUrl.searchParams.get('goal');
    sendJson(res, 200, createRecommendations({ skillLevel, goal }));
    return;
  }

  if (req.method === 'GET' && parsedUrl.pathname === '/api/workflow') {
    const projectType = parsedUrl.searchParams.get('projectType');
    sendJson(res, 200, createWorkflow({ projectType }));
    return;
  }

  if (req.method === 'GET' && (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html')) {
    sendFile(res, path.join(publicDir, 'index.html'));
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

function createServer() {
  return http.createServer(requestHandler);
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const server = createServer();
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`DevFlow AI server running at http://localhost:${port}`);
  });
}

module.exports = {
  createServer,
  createRecommendations,
  createWorkflow
};
