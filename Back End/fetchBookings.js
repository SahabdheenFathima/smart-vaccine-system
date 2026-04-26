const http = require('http');

http.get('http://localhost:5001/api/bookings', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data.substring(0, 1500));
  });
}).on('error', err => console.error(err));
