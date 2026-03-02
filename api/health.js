module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  return res.status(200).json({ 
    status: 'ok',
    message: 'VardQR API is working',
    time: new Date().toISOString()
  });
};
