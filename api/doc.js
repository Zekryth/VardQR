const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL not configured');
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get token from query string
  const { token } = req.query;

  console.log('[VARDQR] Request for token:', token);

  if (!token || token.length < 4) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  try {
    const db = getPool();
    
    // Get document by token
    const { rows } = await db.query(
      `SELECT id, token, nombre, descripcion, file_url, tipo, activo
       FROM qr_documents 
       WHERE token = $1 AND activo = true`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const doc = rows[0];

    // Update visit counter (fire and forget)
    db.query(
      'UPDATE qr_documents SET visitas = visitas + 1 WHERE id = $1',
      [doc.id]
    ).catch(err => console.error('Error updating visits:', err));

    // Return document info
    return res.status(200).json({
      nombre: doc.nombre,
      descripcion: doc.descripcion,
      file_url: doc.file_url,
      tipo: doc.tipo
    });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
