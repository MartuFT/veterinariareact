import React, { useState, useRef } from 'react';
import './MiComponente.css';
import logo from './imagenes/logo.png';

function MiComponente() {
  const [selectedPetSize, setSelectedPetSize] = useState(null);
  const [fileTransversal, setFileTransversal] = useState(null);
  const [fileLongitudinal, setFileLongitudinal] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [step, setStep] = useState(1); // 1: pantalla inicial, 2: análisis
  const fileTransversalRef = useRef(null);
  const fileLongitudinalRef = useRef(null);

  const handlePetSizeSelect = (size) => {
    setSelectedPetSize(size);
  };

  const handleFileChange = (e, setFileFn) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFileFn(URL.createObjectURL(selectedFile));
      setProgress(0);
      setShowResult(false);
    }
  };

  const handleDrop = (event, setFileFn) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files && event.dataTransfer.files[0];
    if (droppedFile) {
      setFileFn(URL.createObjectURL(droppedFile));
      setProgress(0);
      setShowResult(false);
    }
  };

  const preventDefault = (event) => event.preventDefault();

  const handleAnalyze = () => {
    if (!selectedPetSize) {
      alert('Por favor selecciona el tamaño del paciente');
      return;
    }
    
    setProgress(0);
    setShowResult(false);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setShowResult(true);
      }
    }, 200);
  };

  const handleNext = () => {
    if (!selectedPetSize) {
      alert('Por favor selecciona el tamaño del paciente');
      return;
    }
    setStep(2);
  };

  const handleDownload = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Informe de VeterinarIA", 20, 30);
    doc.setFontSize(12);
    doc.text(
      "El análisis de la imagen indica signos compatibles con enfermedad canina. \n\nSe recomienda seguimiento veterinario especializado para confirmar el diagnóstico.",
      20,
      50
    );
    doc.save("Resultado-VeterinarIA.pdf");
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
                  className={`dropzone ${fileTransversal ? 'has-file' : ''}`}
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                  onDrop={(e) => handleDrop(e, setFileTransversal)}
                >
                  <input
                    ref={fileTransversalRef}
                    type="file"
                    id="fileTransversal"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setFileTransversal)}
                    className="file-input"
                  />
                  {fileTransversal && (
                    <img 
                      src={fileTransversal} 
                      alt="transversal" 
                      className="preview-inside clickable-image"
                      onClick={() => fileTransversalRef.current?.click()}
                    />
                  )}
                  <label htmlFor="fileTransversal" className={`dropzone-label ${fileTransversal ? 'hidden' : ''}`}>
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
                  className={`dropzone ${fileLongitudinal ? 'has-file' : ''}`}
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                  onDrop={(e) => handleDrop(e, setFileLongitudinal)}
                >
                  <input
                    ref={fileLongitudinalRef}
                    type="file"
                    id="fileLongitudinal"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setFileLongitudinal)}
                    className="file-input"
                  />
                  {fileLongitudinal && (
                    <img 
                      src={fileLongitudinal} 
                      alt="longitudinal" 
                      className="preview-inside clickable-image"
                      onClick={() => fileLongitudinalRef.current?.click()}
                    />
                  )}
                  <label htmlFor="fileLongitudinal" className={`dropzone-label ${fileLongitudinal ? 'hidden' : ''}`}>
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
              disabled={!selectedPetSize || !fileTransversal || !fileLongitudinal}
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
