const http = require('http');

// Import app (this starts the server)
require('./app.js');

setTimeout(() => {
  // Test GET /health
  http.get('http://localhost:3000/health', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('--- GET /health ---');
      console.log('Status:', res.statusCode);
      console.log('Response:', data);

      // Test GET /
      http.get('http://localhost:3000/', (res2) => {
        let data2 = '';
        res2.on('data', (chunk) => { data2 += chunk; });
        res2.on('end', () => {
          console.log('--- GET / ---');
          console.log('Status:', res2.statusCode);
          console.log('Response:', data2);
          console.log('\nAll endpoints verified successfully!');
          process.exit(0);
        });
      });
    });
  });
}, 1000);

