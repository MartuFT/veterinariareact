import React, { useState, useRef, useEffect } from 'react';
import './MiComponente.css';
import logo from './imagenes/logo.png';

function MiComponente() {
  // Estado para selección de tamaño (solo visual, no se guarda)
  const [selectedPetSize, setSelectedPetSize] = useState(null);
  
  // Estados para archivos y previsualizaciones
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  
  // Estados para progreso y navegación
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1); // 1: selección tamaño, 2: carga, 3: procesando, 4: resultado
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  // Referencia para input de archivo
  const fileRef = useRef(null);

  // Deshabilitar scroll en pantallas de pantalla completa
  useEffect(() => {
    if (step === 3 || step === 4) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [step]);

  // Seleccionar tamaño de mascota (solo visual, no se guarda)
  const handlePetSizeSelect = (size) => {
    setSelectedPetSize(size);
  };

  // Avanzar al siguiente paso
  const handleNext = () => {
    if (!selectedPetSize) {
      alert('Por favor selecciona el tamaño del paciente');
      return;
    }
    setStep(2);
  };

  // Manejar cambio de archivo
  const handleFileChange = (e, setFileFn, setPreviewFn) => {
    const file = e.target.files[0];
    if (file) {
      setFileFn(file);
      setPreviewFn(URL.createObjectURL(file));
      setProgress(0);
    }
  };

  // Manejar arrastrar y soltar archivo
  const handleDrop = (event, setFileFn, setPreviewFn) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setFileFn(file);
      setPreviewFn(URL.createObjectURL(file));
      setProgress(0);
    }
  };

  const preventDefault = (event) => event.preventDefault();

  // Simular análisis (sin conexión a backend)
  const handleAnalyze = () => {
    if (!file) {
      alert('Por favor carga una imagen');
      return;
    }
    
    setProgress(0);
    setStep(3); // Ir a pantalla de procesamiento

    // Simular progreso de procesamiento
    let currentProgress = 0;
    const progressTimer = setInterval(() => {
      currentProgress = Math.min(currentProgress + 8, 95);
      setProgress(currentProgress);
      
      if (currentProgress >= 95) {
        clearInterval(progressTimer);
        setProgress(100);
        setTimeout(() => {
          setStep(4); // Ir a pantalla de resultado
        }, 500);
      }
    }, 200);
  };

  // Simular descarga de PDF (sin conexión a backend)
  const handleDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Simular progreso de descarga
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress = Math.min(currentProgress + 10, 90);
      setDownloadProgress(currentProgress);
      
      if (currentProgress >= 90) {
        clearInterval(progressInterval);
        setDownloadProgress(100);
        
        // Crear PDF simulado
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
        
        setTimeout(() => {
          setIsDownloading(false);
          setDownloadProgress(0);
        }, 500);
      }
    }, 150);
  };

  // Función para volver atrás desde el logo
  const handleLogoClick = () => {
    if (step === 2) {
      // Desde carga de imagen, volver a selección de tamaño
      setFile(null);
      setFilePreview(null);
      setStep(1);
    } else if (step === 3) {
      // Desde procesamiento, volver a carga de imagen
      setStep(2);
    } else if (step === 4) {
      // Desde resultado, volver a carga de imagen
      setStep(2);
    }
  };

  // Componente del Header (reutilizable)
  const Header = () => (
    <header className="header">
      <div className="header-inner">
        <div 
          className={`logo-container ${step >= 2 ? 'clickable' : ''}`}
          onClick={step >= 2 ? handleLogoClick : undefined}
        >
          <img className="logo" src={logo} alt="Logo VeterinarIA" />
          <span className="logo-text">VETERINARIA</span>
        </div>
        <div className="tagline">
          ¡Facilita la interpretacion de ecografias!
        </div>
      </div>
    </header>
  );

  // Pantalla de procesamiento (Step 3)
  if (step === 3) {
    return (
      <div className="veterinaria-app fullscreen-frame">
        <Header />
        <main className="main-content fullscreen-main">
          <h1 className="frame-title">Resultado</h1>
          <div className="loading-frame">
            <div className="loading-content">
              <h2 className="loading-title">Procesando</h2>
              <p className="loading-subtitle">Esto puede tomar un rato</p>
              <div className="progress-wrapper-fullscreen">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                  <div className="progress-label">{progress}%</div>
                </div>
              </div>
              <p className="loading-status">Analizando imágenes</p>
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
        <Header />
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
        <Header />
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
        </main>
      </div>
    );
  }

  // Pantallas principales (Step 1 y 2)
  return (
    <div className="veterinaria-app">
      <Header />

      <main className="main-content">
        {/* Paso 1: Selección de tamaño */}
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

        {/* Paso 2: Carga de imagen */}
        {step === 2 && (
          <>
            <h1 className="main-instruction">Subir Imagen</h1>
            
            <div className="upload-container">
              <div
                className={`dropzone ${filePreview ? 'has-file' : ''}`}
                onDragOver={preventDefault}
                onDragEnter={preventDefault}
                onDrop={(e) => handleDrop(e, setFile, setFilePreview)}
              >
                <input
                  ref={fileRef}
                  type="file"
                  id="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setFile, setFilePreview)}
                  className="file-input"
                />
                {filePreview && (
                  <img 
                    src={filePreview} 
                    alt="preview" 
                    className="preview-inside clickable-image"
                    onClick={() => fileRef.current?.click()}
                  />
                )}
                <label htmlFor="file" className={`dropzone-label ${filePreview ? 'hidden' : ''}`}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 18a4 4 0 0 1 0-8c.2 0 .4 0 .6.1A5 5 0 0 1 17 7a4 4 0 0 1 1 7.9V15a3 3 0 0 1-3 3H7z" stroke="#ffffff" strokeWidth="1.5" fill="none"/>
                    <path d="M12 12v6M9.5 14.5H14.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Cargar o arrastrar archivos aquí</span>
                </label>
              </div>
            </div>

            <button 
              className="analyze-btn" 
              onClick={handleAnalyze}
              disabled={!file}
            >
              Analizar
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default MiComponente;
