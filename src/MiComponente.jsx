import React, { useState, useRef, useEffect } from 'react';
import './MiComponente.css';
import logo from './imagenes/logo.png';

function MiComponente() {
  const [selectedPetSize, setSelectedPetSize] = useState(null);
  // Keep actual File objects + previews
  const [fileTransversalFile, setFileTransversalFile] = useState(null);
  const [fileLongitudinalFile, setFileLongitudinalFile] = useState(null);
  const [fileTransversalPreview, setFileTransversalPreview] = useState(null);
  const [fileLongitudinalPreview, setFileLongitudinalPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  // step 1: selección de tamaño, step 2: carga de imágenes, step 3: pantalla de carga, step 4: resultado
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileTransversalRef = useRef(null);
  const fileLongitudinalRef = useRef(null);

  // Deshabilitar scroll del body cuando estamos en un frame de pantalla completa
  useEffect(() => {
    if (step === 3 || step === 4) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup cuando el componente se desmonte
    return () => {
      document.body.style.overflow = '';
    };
  }, [step]);

  const handlePetSizeSelect = (size) => {
    setSelectedPetSize(size);
  };

  const handleFileChange = (e, setFileObjFn, setPreviewFn) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFileObjFn(selectedFile);
      setPreviewFn(URL.createObjectURL(selectedFile));
      setProgress(0);
      setErrorMessage('');
    }
  };

  const handleDrop = (event, setFileObjFn, setPreviewFn) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files && event.dataTransfer.files[0];
    if (droppedFile) {
      setFileObjFn(droppedFile);
      setPreviewFn(URL.createObjectURL(droppedFile));
      setProgress(0);
      setErrorMessage('');
    }
  };

  const preventDefault = (event) => event.preventDefault();

  const handleAnalyze = async () => {
    if (!selectedPetSize) {
      alert('Por favor selecciona el tamaño del paciente');
      return;
    }
    if (!fileTransversalFile || !fileLongitudinalFile) {
      alert('Por favor carga ambas imágenes (Transversal y Longitudinal)');
      return;
    }
    
    setErrorMessage('');
    setProgress(0);
    setIsUploading(true);
    setStep(3); // Ir a pantalla de carga

    try {
    let prog = 0;
      const progressTimer = setInterval(() => {
        prog = Math.min(prog + 8, 95);
      setProgress(prog);
      }, 200);

      const formData = new FormData();
      formData.append('transversal', fileTransversalFile);
      formData.append('longitudinal', fileLongitudinalFile);
      formData.append('petSize', selectedPetSize);

      const response = await fetch('https://backend-2-chi.vercel.app/api/subir-imagen', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Error del servidor (${response.status})`);
      }
      clearInterval(progressTimer);
      setProgress(100);
      // Esperar un momento antes de cambiar a la pantalla de resultado
      setTimeout(() => {
        setStep(4); // Ir a pantalla de resultado
        setIsUploading(false);
      }, 500);
    } catch (err) {
      setErrorMessage(err?.message || 'Error subiendo imágenes');
      setStep(2); // Volver a la pantalla de carga de imágenes en caso de error
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (!selectedPetSize) {
      alert('Por favor selecciona el tamaño del paciente');
      return;
    }
    setStep(2);
  };

  const handleDownload = async () => {
    setErrorMessage('');
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      // Simular progreso de descarga
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 150);

      // Simular espera de descarga (no hacer fetch todavía)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      // Crear un PDF simulado (placeholder)
      // En producción, esto vendría del servidor
      const pdfContent = '%PDF-1.4\n' +
        '1 0 obj\n' +
        '<< /Type /Catalog /Pages 2 0 R >>\n' +
        'endobj\n' +
        '2 0 obj\n' +
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n' +
        'endobj\n' +
        '3 0 obj\n' +
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\n' +
        'endobj\n' +
        '4 0 obj\n' +
        '<< /Length 44 >>\n' +
        'stream\n' +
        'BT\n' +
        '/F1 12 Tf\n' +
        '100 700 Td\n' +
        '(Resultado VeterinarIA) Tj\n' +
        'ET\n' +
        'endstream\n' +
        'endobj\n' +
        '5 0 obj\n' +
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n' +
        'endobj\n' +
        'xref\n' +
        '0 6\n' +
        '0000000000 65535 f \n' +
        '0000000009 00000 n \n' +
        '0000000058 00000 n \n' +
        '0000000115 00000 n \n' +
        '0000000294 00000 n \n' +
        '0000000384 00000 n \n' +
        'trailer\n' +
        '<< /Size 6 /Root 1 0 R >>\n' +
        'startxref\n' +
        '478\n' +
        '%%EOF';
      
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Resultado-VeterinarIA.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      // Volver a la pantalla de resultado después de un momento
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 500);
    } catch (err) {
      setErrorMessage(err?.message || 'Error descargando el PDF');
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Pantalla de carga completa (Step 3)
  if (step === 3) {
    return (
      <div className="veterinaria-app fullscreen-frame">
        <header className="header">
          <div className="header-inner">
            <div className="logo-container">
              <img
                className="logo"
                src={logo}
                alt="Logo VeterinarIA"
              />
              <span className="logo-text">VETERINAR<span className="logo-ia">IA</span></span>
            </div>
            <div className="tagline">
              ¡Facilita la interpretación de ecografías!
            </div>
          </div>
        </header>

        <main className="main-content fullscreen-main">
          <h1 className="frame-title">Resultado</h1>
          
          <div className="loading-frame">
            <div className="loading-content">
              <h2 className="loading-title">Descargando</h2>
              <p className="loading-subtitle">Esto puede tomar un rato</p>
              
              <div className="progress-wrapper-fullscreen">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                  <div className="progress-label">{progress}%</div>
                </div>
              </div>
              
              <p className="loading-status">Subiendo</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Pantalla de descarga (cuando se está descargando el PDF)
  if (isDownloading && step === 4) {
    return (
      <div className="veterinaria-app fullscreen-frame">
        <header className="header">
          <div className="header-inner">
            <div className="logo-container">
              <img
                className="logo"
                src={logo}
                alt="Logo VeterinarIA"
              />
              <span className="logo-text">VETERINAR<span className="logo-ia">IA</span></span>
            </div>
            <div className="tagline">
              ¡Facilita la interpretación de ecografías!
            </div>
          </div>
        </header>

        <main className="main-content fullscreen-main">
          <h1 className="frame-title">Resultado</h1>
          
          <div className="loading-frame">
            <div className="loading-content">
              <h2 className="loading-title">Descargando</h2>
              <p className="loading-subtitle">Esto puede tomar un rato</p>
              
              <div className="progress-wrapper-fullscreen">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${downloadProgress}%` }} />
                  <div className="progress-label">{downloadProgress}%</div>
                </div>
              </div>
              
              <p className="loading-status">Descargando PDF</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Pantalla de resultado (Step 4)
  if (step === 4) {
    return (
      <div className="veterinaria-app fullscreen-frame">
        <header className="header">
          <div className="header-inner">
            <div className="logo-container">
              <img
                className="logo"
                src={logo}
                alt="Logo VeterinarIA"
              />
              <span className="logo-text">VETERINAR<span className="logo-ia">IA</span></span>
            </div>
            <div className="tagline">
              ¡Facilita la interpretación de ecografías!
            </div>
          </div>
        </header>

        <main className="main-content fullscreen-main">
          <h1 className="frame-title">Resultado</h1>
          
          <div className="result-frame">
            <div className="result-content">
              <button className="button-download-pdf" onClick={handleDownload}>
                <span>descargar pdf</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V3M12 15L8 11M12 15L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="error-message-fullscreen">
              <div style={{ color: '#b00020' }}>{errorMessage}</div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Pantallas normales (Step 1 y 2)
  return (
    <div className="veterinaria-app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div 
            className={`logo-container ${step === 2 ? 'clickable' : ''}`}
            onClick={step === 2 ? () => setStep(1) : undefined}
          >
            <img
              className="logo"
              src={logo}
              alt="Logo VeterinarIA"
            />
            <span className="logo-text">VETERINAR<span className="logo-ia">IA</span></span>
          </div>
          <div className="tagline">
            ¡Facilita la interpretación de ecografías!
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {step === 1 && (
          <>
            <h1 className="main-instruction">
              Clickea la opción que más se asemeje al paciente.
            </h1>
            <div className="pet-size-selection">
              <button 
                className={`pet-size-btn ${selectedPetSize === 'small' ? 'selected' : ''}`}
                onClick={() => handlePetSizeSelect('small')}
              >
                Perro pequeño/gato
              </button>
              <button 
                className={`pet-size-btn ${selectedPetSize === 'medium' ? 'selected' : ''}`}
                onClick={() => handlePetSizeSelect('medium')}
              >
                Perro mediano
              </button>
              <button 
                className={`pet-size-btn ${selectedPetSize === 'large' ? 'selected' : ''}`}
                onClick={() => handlePetSizeSelect('large')}
              >
                Perro grande
              </button>
            </div>
            <div className="actions">
              <button className="next-btn" onClick={handleNext}>Avanzar</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="upload-grid">
              <div className="upload-column">
                <h3 className="upload-title">Transversal</h3>
                <div
                  className={`dropzone ${fileTransversalPreview ? 'has-file' : ''}`}
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                  onDrop={(e) => handleDrop(e, setFileTransversalFile, setFileTransversalPreview)}
                >
                  <input
                    ref={fileTransversalRef}
                    type="file"
                    id="fileTransversal"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setFileTransversalFile, setFileTransversalPreview)}
                    className="file-input"
                  />
                  {fileTransversalPreview && (
                    <img 
                      src={fileTransversalPreview} 
                      alt="transversal" 
                      className="preview-inside clickable-image"
                      onClick={() => fileTransversalRef.current?.click()}
                    />
                  )}
                  <label htmlFor="fileTransversal" className={`dropzone-label ${fileTransversalPreview ? 'hidden' : ''}`}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 18a4 4 0 0 1 0-8c.2 0 .4 0 .6.1A5 5 0 0 1 17 7a4 4 0 0 1 1 7.9V15a3 3 0 0 1-3 3H7z" stroke="#d7e8ff" strokeWidth="1.5" fill="none"/>
                      <path d="M12 12v6M9.5 14.5H14.5" stroke="#d7e8ff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span>Cargar o arrastrar archivos aquí</span>
                  </label>
                </div>
              </div>

              <div className="upload-column">
                <h3 className="upload-title">Longitudinal</h3>
                <div
                  className={`dropzone ${fileLongitudinalPreview ? 'has-file' : ''}`}
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                  onDrop={(e) => handleDrop(e, setFileLongitudinalFile, setFileLongitudinalPreview)}
                >
                  <input
                    ref={fileLongitudinalRef}
                    type="file"
                    id="fileLongitudinal"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setFileLongitudinalFile, setFileLongitudinalPreview)}
                    className="file-input"
                  />
                  {fileLongitudinalPreview && (
                    <img 
                      src={fileLongitudinalPreview} 
                      alt="longitudinal" 
                      className="preview-inside clickable-image"
                      onClick={() => fileLongitudinalRef.current?.click()}
                    />
                  )}
                  <label htmlFor="fileLongitudinal" className={`dropzone-label ${fileLongitudinalPreview ? 'hidden' : ''}`}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 18a4 4 0 0 1 0-8c.2 0 .4 0 .6.1A5 5 0 0 1 17 7a4 4 0 0 1 1 7.9V15a3 3 0 0 1-3 3H7z" stroke="#d7e8ff" strokeWidth="1.5" fill="none"/>
                      <path d="M12 12v6M9.5 14.5H14.5" stroke="#d7e8ff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span>Cargar o arrastrar archivos aquí</span>
                  </label>
                </div>
              </div>
            </div>

            <button 
              className="analyze-btn" 
              onClick={handleAnalyze}
              disabled={!selectedPetSize || !fileTransversalFile || !fileLongitudinalFile || isUploading}
            >
              Analizar
            </button>

            {errorMessage && (
              <div className="error-message" style={{ color: '#b00020', marginTop: '20px' }}>
                {errorMessage}
          </div>
        )}
          </>
        )}
      </main>
    </div>
  );
}

export default MiComponente;
