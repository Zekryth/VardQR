import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function Viewer() {
  const { token } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/doc?token=${token}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Documento no encontrado');
          } else {
            setError('Error al cargar el documento');
          }
          return;
        }

        const data = await response.json();
        setDoc(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDocument();
    } else {
      setError('Token inválido');
      setLoading(false);
    }
  }, [token]);

  const handleDownload = () => {
    if (doc?.file_url) {
      window.open(doc.file_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando documento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2>Página no encontrada</h2>
        <p>El enlace que has seguido no es válido o ha expirado.</p>
      </div>
    );
  }

  const isPDF = doc?.tipo === 'pdf' || doc?.file_url?.toLowerCase().endsWith('.pdf');
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => 
    doc?.file_url?.toLowerCase().endsWith(`.${ext}`)
  );

  return (
    <div className="viewer-container">
      <header className="viewer-header">
        <div className="viewer-title">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{doc?.nombre || 'Documento'}</span>
        </div>
        
        <button className="download-btn" onClick={handleDownload}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Descargar</span>
        </button>
      </header>

      <main className="viewer-content">
        {isPDF ? (
          <iframe 
            src={doc.file_url} 
            className="pdf-frame"
            title={doc.nombre}
          />
        ) : isImage ? (
          <img 
            src={doc.file_url} 
            alt={doc.nombre}
            className="image-viewer"
          />
        ) : (
          <div className="file-info">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3>{doc.nombre}</h3>
            <p>{doc.descripcion || 'Documento disponible para descarga'}</p>
            <button className="download-btn" onClick={handleDownload}>
              Descargar archivo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
