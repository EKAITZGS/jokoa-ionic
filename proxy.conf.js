// Proxy de ng serve hacia la API. El DNS del router de casa tarda hasta 20 s en algunas consultas,
// así que se reutiliza la conexión y se recuerda la dirección unos minutos: solo afecta al desarrollo
const dns = require('dns');
const https = require('https');

const recuerdo = new Map();
const TTL = 5 * 60 * 1000;

function buscar(host, opciones, cb) {
  const guardado = recuerdo.get(host);
  if (guardado && Date.now() - guardado.cuando < TTL) {
    return opciones.all ? cb(null, guardado.lista) : cb(null, guardado.lista[0].address, guardado.lista[0].family);
  }
  dns.lookup(host, { all: true, family: 4 }, (error, lista) => {
    if (error) return cb(error);
    recuerdo.set(host, { cuando: Date.now(), lista });
    return opciones.all ? cb(null, lista) : cb(null, lista[0].address, lista[0].family);
  });
}

module.exports = {
  '/ws': {
    target: 'https://jokoa.duckdns.org',
    secure: true,
    changeOrigin: true,
    agent: new https.Agent({ keepAlive: true, lookup: buscar }),
  },
};
