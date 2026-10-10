const localtunnel = require('localtunnel');

(async () => {
  try {
    console.log('Starting tunnel on port 5173...');
    const tunnel = await localtunnel({ port: 5173, subdomain: 'quickbite-food' });
    console.log('TUNNEL URL: ' + tunnel.url);
    
    tunnel.on('close', () => {
      console.log('tunnel closed');
      process.exit(0);
    });
    
    tunnel.on('error', (err) => {
      console.error('tunnel error:', err);
    });
  } catch (err) {
    console.error('Failed to start tunnel:', err.message);
    process.exit(1);
  }
})();
