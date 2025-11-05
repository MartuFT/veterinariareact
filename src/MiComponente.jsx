import React, { useState, useRef } from 'react';
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
  const [showResult, setShowResult] = useState(false);
  const [step, setStep] = useState(1); // 1: pantalla inicial, 2: análisis
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileTransversalRef = useRef(null);
  const fileLongitudinalRef = useRef(null);

  const handlePetSizeSelect = (size) => {
    setSelectedPetSize(size);
  };

  const handleFileChange = (e, setFileObjFn, setPreviewFn) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFileObjFn(selectedFile);
      setPreviewFn(URL.createObjectURL(selectedFile));
      setProgress(0);
      setShowResult(false);
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
      setShowResult(false);
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
    setShowResult(false);
    setIsUploading(true);

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
      setShowResult(true);
    } catch (err) {
      setErrorMessage(err?.message || 'Error subiendo imágenes');
      setShowResult(false);
    } finally {
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
    try {
      const response = await fetch('https://backend-2-chi.vercel.app/api/subir-imagen', {
        method: 'GET'
      });
      if (!response.ok) {
        throw new Error(`No se pudo descargar el PDF (${response.status})`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Resultado-VeterinarIA.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage(err?.message || 'Error descargando el PDF');
    }
  };

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

            {progress > 0 && progress < 100 && (
          <div className="progress-wrapper">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
              <div className="progress-label">{progress}%</div>
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {errorMessage && (
        <div className="resultado">
          <div className="resultado-container">
            <div style={{ color: '#b00020' }}>{errorMessage}</div>
          </div>
        </div>
      )}
      {showResult && (
        <div className="resultado">
          <div className="resultado-container">
            <h2>Resultado</h2>
            <div className="caja-ia">
              <button className="button descargar" onClick={handleDownload}>
                Descargar resultado en PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MiComponente;
