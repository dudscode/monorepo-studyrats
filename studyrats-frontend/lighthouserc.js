module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/login'],
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready on',
    },
    assert: {
      assertions: {
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'interaction-to-next-paint': ['warn', { maxNumericValue: 200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
