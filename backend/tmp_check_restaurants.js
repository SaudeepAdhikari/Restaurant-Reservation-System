const http = require('http');
const https = require('https');
const base = 'http://localhost:5000';
function get(u){
  return new Promise((res,rej)=>{
    const m = u.startsWith('https') ? https : http;
    m.get(u, r=>{
      let d = '';
      r.on('data', c=> d += c);
      r.on('end', ()=> res({ status: r.statusCode, body: d }));
    }).on('error', e=> rej(e));
  });
}

(async ()=>{
  try{
    const list = await get(base + '/api/restaurants');
    console.log('LIST_STATUS', list.status);
    console.log('LIST_BODY_FIRST_1500', list.body.slice(0,1500));
    if(list.status === 200){
      const data = JSON.parse(list.body);
      if(Array.isArray(data) && data.length){
        const id = data[0]._id || data[0].id;
        console.log('First id:', id);
        const one = await get(`${base}/api/restaurants/${id}`);
        console.log('ONE_STATUS', one.status);
        console.log('ONE_BODY_FIRST_1500', one.body.slice(0,1500));
      } else {
        console.log('No restaurants found in list');
      }
    }
  } catch(e){
    console.error('ERR', e && e.message);
  }
})();
