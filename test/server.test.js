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

test('GET /api/health returns ok status', async () => {
  const { server, port } = await startServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, 'ok');
  } finally {
    server.close();
  }
});

test('GET /api/recommendations returns recommendation list', async () => {
  const { server, port } = await startServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/recommendations?skillLevel=advanced`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(Array.isArray(payload.recommendations), true);
    assert.equal(payload.recommendations.length > 0, true);
  } finally {
    server.close();
  }
});
