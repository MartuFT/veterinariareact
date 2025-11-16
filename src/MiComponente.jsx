import React, { useState, useRef, useEffect } from 'react';
import './MiComponente.css';
import logo from './imagenes/logo.png';
import nube from './imagenes/nube.png';

function MiComponente() {
  // Estado para splash screen
  const [showSplash, setShowSplash] = useState(true);
  const [splashFadeOut, setSplashFadeOut] = useState(false);
  
  // Estado para selección de tamaño (solo visual, no se guarda)
  const [selectedPetSize, setSelectedPetSize] = useState(null);
  
  // Estados para archivos y previsualizaciones
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  
  // Estados para progreso y navegación
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1); // 1: selección tamaño, 2: carga, 3: procesando, 4: resultado
  
  // Referencia para input de archivo
  const fileRef = useRef(null);

  // Mostrar splash screen por 2 segundos con fade out
  useEffect(() => {
    const timer = setTimeout(() => {
      // Iniciar fade out
      setSplashFadeOut(true);
      // Ocultar splash después de la animación (500ms)
      setTimeout(() => {
        setShowSplash(false);
      }, 500);
    }, 2000); // 2 segundos

    return () => clearTimeout(timer);
  }, []);

  // Deshabilitar scroll en pantallas de pantalla completa y splash
  useEffect(() => {
    if (showSplash || step === 3 || step === 4) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [step, showSplash]);

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

  // Analizar imagen enviándola al backend
  const handleAnalyze = async () => {
    if (!file) {
      alert('Por favor carga una imagen');
      return;
    }
    
    setProgress(0);
    setStep(3); // Ir a pantalla de procesamiento

    try {
      // Crear FormData para enviar la imagen
      const formData = new FormData();
      // Enviar una sola imagen con el nombre 'imagen'
      formData.append('imagen', file);

      setProgress(20);

      // Enviar imagen al backend
      const response = await fetch('https://backend-2-chi.vercel.app/api/subir-imagen', {
        method: 'POST',
        body: formData,
     
      });

      setProgress(60);

      if (!response.ok) {
        // Intentar obtener más información del error
        let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Error del backend:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          try {
            const errorText = await response.text();
            console.error('Error del backend (texto):', errorText);
            if (errorText) {
              errorMessage += `\nRespuesta: ${errorText}`;
            }
          } catch (textError) {
            console.error('No se pudo leer la respuesta de error:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      // La imagen se envió correctamente al backend
      // La respuesta se usará en el futuro, por ahora solo verificamos que se envió
      console.log('Imagen enviada correctamente al backend');
      const data = await response.json();
      console.log(data);
      
      setProgress(100);
      
      // Esperar un momento antes de cambiar a la pantalla de resultado
      setTimeout(() => {
        setStep(4); // Ir a pantalla de resultado
      }, 500);

    } catch (error) {
      console.error('Error completo al analizar la imagen:', error);
      console.error('Tipo de error:', error.constructor.name);
      console.error('Stack trace:', error.stack);
      
      // Mostrar información más detallada del error
      let errorMessage = 'Error al procesar la imagen.\n\n';
      errorMessage += `Mensaje: ${error.message}\n`;
      errorMessage += `Tipo: ${error.constructor.name}\n`;
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += '\n⚠️ Error de red: No se pudo conectar al backend.\n';
        errorMessage += 'Verifica que el backend esté disponible en:\n';
        errorMessage += 'https://backend-2-chi.vercel.app/api/subir-imagen';
      }
      
      alert(errorMessage);
      setStep(2); // Volver a la pantalla de carga de imagen
      setProgress(0);
    }
  };

  // Simular descarga de PDF (sin conexión a backend)
  const handleDownload = () => {
    // Crear PDF simulado directamente sin cambiar de pantalla
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
  };

  // Función para volver atrás desde el logo - siempre vuelve a seleccionar tamaño
  const handleLogoClick = () => {
    // Limpiar archivos si hay alguno cargado
    setFile(null);
    setFilePreview(null);
    // Siempre volver a la pantalla de seleccionar tamaño (step 1)
    setStep(1);
  };

  // Componente del Header (reutilizable)
  const Header = ({ stepType, handleLogoClick }) => (
    <header className="header">
      <div className="header-inner">
        <div 
          className={`logo-container ${stepType >= 2 ? 'clickable' : ''} step-${stepType}`}
          onClick={stepType >= 2 && handleLogoClick ? handleLogoClick : undefined}
        >
          <img className="logo" src={logo} alt="Logo VeterinarIA" />
        </div>
  
        {stepType === 1 && (
          <div className="tagline">
            ¡Facilita la interpretación de radiografías!
          </div>
        )}
      </div>
    </header>
  );

  // Pantalla de procesamiento (Step 3)
  if (step === 3) {
    return (
      <div className="veterinaria-app fullscreen-frame">
        <Header stepType={3} handleLogoClick={handleLogoClick} />
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


  // Pantalla de resultado (Step 4)
  if (step === 4) {
    return (
      <div className="veterinaria-app fullscreen-frame">
        <Header stepType={4} handleLogoClick={handleLogoClick} />
        <main className="main-content fullscreen-main">
          <h1 className="frame-title">Resultado</h1>
          <div className="result-frame">
            <button className="button-download-icon" onClick={handleDownload}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15V3M12 15L8 11M12 15L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="result-text">
              Textitoo
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Pantalla de carga de imagen (Step 2)
  if (step === 2) {
    return (
      <div className="veterinaria-app fullscreen-frame">
        <Header stepType={2} handleLogoClick={handleLogoClick} />
        <main className="main-content fullscreen-main">
          <h1 className="frame-title">Subir imagen</h1>
          <div className="upload-frame">
            <div className="upload-frame-content">
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
                    <img src={nube} alt="Subir imagen" className="upload-icon" />
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
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Splash Screen
  if (showSplash) {
    return (
      <div className={`splash-screen ${splashFadeOut ? 'fade-out' : ''}`}>
        <div className="splash-content">
          <img src={logo} alt="VeterinarIA Logo" className="splash-logo" />
        </div>
      </div>
    );
  }

  // Pantalla principal (Step 1)
  return (
    <div className="veterinaria-app">
      <Header stepType={1} handleLogoClick={handleLogoClick} />

      <main className="main-content">
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
      </main>
    </div>
  );
}

export default MiComponente;
