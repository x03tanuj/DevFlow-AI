const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const publicDir = path.join(__dirname, 'public');

function isWithinPublicDirectory(targetPath) {
  const normalizedBase = path.normalize(publicDir + path.sep);
  const normalizedTarget = path.normalize(targetPath);

  if (process.platform === 'win32') {
    return normalizedTarget.toLowerCase().startsWith(normalizedBase.toLowerCase());
  }

  return normalizedTarget.startsWith(normalizedBase);
}

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
  const resolvedPath = path.resolve(filePath);
  if (!isWithinPublicDirectory(resolvedPath)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  fs.readFile(resolvedPath, (error, content) => {
    if (error) {
      sendJson(res, 500, { error: 'Unable to load file.' });
      return;
    }

    const ext = path.extname(resolvedPath);
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8'
    };
    const contentType = contentTypes[ext] || 'text/plain; charset=utf-8';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

function createRecommendations({ skillLevel, goal }) {
  const level = (skillLevel || 'beginner').toLowerCase();
  const normalizedGoal = goal || 'build real-world projects';

  const baseline = {
    beginner: [
      {
        id: 'beginner-guided-issues',
        text: 'Start with guided issue-based tasks and pair each change with a test.'
      },
      {
        id: 'beginner-ai-explanations',
        text: 'Use AI explanations to understand pull request feedback before coding.'
      }
    ],
    intermediate: [
      {
        id: 'intermediate-setup-automation',
        text: 'Automate repetitive setup tasks with project templates and scripts.'
      },
      {
        id: 'intermediate-ai-outline',
        text: 'Use AI to generate implementation outlines before coding.'
      }
    ],
    advanced: [
      {
        id: 'advanced-ci-automation',
        text: 'Set up workflow automation for CI checks and release readiness.'
      },
      {
        id: 'advanced-ai-code-review',
        text: 'Use AI-assisted code review prompts to improve maintainability.'
      }
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
    const supportedSkillLevels = ['beginner', 'intermediate', 'advanced'];

    if (skillLevel && !supportedSkillLevels.includes(skillLevel.toLowerCase())) {
      sendJson(res, 400, {
        error: 'Unsupported skillLevel. Use beginner, intermediate, or advanced.'
      });
      return;
    }

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
