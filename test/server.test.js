const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../server');

function startServer() {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(0, () => {
      const address = server.address();
      resolve({ server, port: address.port });
    });
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

test('GET /api/health returns ok status', async () => {
  const { server, port } = await startServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, 'ok');
  } finally {
    await closeServer(server);
  }
});

test('GET /api/recommendations returns recommendation list', async () => {
  const { server, port } = await startServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/recommendations?skillLevel=advanced`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(payload.recommendations));
    assert.ok(payload.recommendations.length > 0);
    assert.ok(payload.recommendations[0].id);
    assert.ok(payload.recommendations[0].text);
  } finally {
    await closeServer(server);
  }
});

test('GET /api/workflow returns workflow steps', async () => {
  const { server, port } = await startServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/workflow?projectType=opensource`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.projectType, 'opensource');
    assert.ok(Array.isArray(payload.workflow));
    assert.ok(payload.workflow.length > 0);
  } finally {
    await closeServer(server);
  }
});

test('GET /api/recommendations rejects unsupported skill level', async () => {
  const { server, port } = await startServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/recommendations?skillLevel=expert`);
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(
      payload.error,
      'Unsupported skillLevel. Use beginner, intermediate, or advanced.'
    );
  } finally {
    await closeServer(server);
  }
});
