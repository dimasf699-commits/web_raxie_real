const https = require('https');

const options = {
  hostname: 'api.biteship.com',
  path: '/v1/maps/areas?countries=ID&input=pasirwangi&type=single',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer biteship_live.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoicmF4aWUiLCJ1c2VySWQiOiI2YTVkMmRkMWVjNzhmMDQwYzExY2FiZGMiLCJpYXQiOjE3ODQ0OTE5NDZ9.ub9CptvSshdrcJ1HcX9Pw21tj4_FIatC1GslXFhc3jA'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const json = JSON.parse(data);
    const area = json.areas.find(a => a.administrative_division_level_2_name.toLowerCase().includes('garut'));
    if (area) {
      console.log('\n✅ KETEMU AREA ID GUDANG ANDA:');
      console.log('ID:', area.id);
      console.log('Nama:', area.name, ',', area.administrative_division_level_2_name);
      console.log('\n👉 Copy ID tersebut dan masukkan ke .env sebagai STORE_AREA_ID=...\n');
    } else {
      console.log('Tidak ditemukan, ini hasil mentahnya:', json);
    }
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
