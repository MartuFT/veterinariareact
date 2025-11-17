import React, { useState, useRef, useEffect } from 'react';
import './MiComponente.css';
import logo from './imagenes/logo.png';
import nube from './imagenes/nube.png';
import jsPDF from 'jspdf';
import { API_ENDPOINTS } from './config.js';

function MiComponente() {
  // Estado para splash screen
  const [showSplash, setShowSplash] = useState(true);
  const [splashFadeOut, setSplashFadeOut] = useState(false);
  
  // Estado para selección de tamaño 
  const [selectedPetSize, setSelectedPetSize] = useState(null);
  
  // Estados para previsualizar
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  
  // Estados para la de progreso 
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1); // 1: selección tamaño, 2: carga, 3: procesando, 4: resultado
  const [resultadoTexto, setResultadoTexto] = useState('');
  
  
  const fileRef = useRef(null);

  // Mostrar splash screen por 2 segundos con y dsp se vaya despacito
  useEffect(() => {
    const timer = setTimeout(() => {
      // Iniciar fade out
      setSplashFadeOut(true);
      // Ocultar splash después de la animación 
      setTimeout(() => {
        setShowSplash(false);
      }, 500);
    }, 2000); // 2 segundos

    return () => clearTimeout(timer);
  }, []);

  
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

  // cambio de archivo
  const handleFileChange = (e, setFileFn, setPreviewFn) => {
    const file = e.target.files[0];
    if (file) {
      setFileFn(file);
      setPreviewFn(URL.createObjectURL(file));
      setProgress(0);
    }
  };

  // arrastrar y soltar archivo
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
    setStep(3); // Ir a pantalla de procesarr

    try {
      // Crear FormData para enviar la imagen
      const formData = new FormData();
    
      formData.append('image', file);

      setProgress(20);

      // URL del backend configurada en src/config.js
      console.log('Intentando conectar a:', API_ENDPOINTS.SUBIR_IMAGEN);
      
      // Crear AbortController para timeout (conexiones WiFi pueden ser lentas)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Timeout: La conexión tardó más de 2 minutos');
        controller.abort();
      }, 120000); // 2 minutos de timeout para conexiones WiFi
      
      // Enviar imagen al backend
      let response;
      try {
        response = await fetch(API_ENDPOINTS.SUBIR_IMAGEN, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        // Relanzar el error para que se maneje en el catch principal
        throw fetchError;
      }

      setProgress(60);

      if (!response.ok) {
        // solo para cuando tenemos mala leche y no funca
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
    
      console.log('Imagen enviada correctamente al backend');
      const data = await response.json();
      console.log(data);
      
      // Guardar el texto del resultado del backend
    
      const textoResultado = data.resultado || data.mensaje || data.texto || JSON.stringify(data, null, 2);
      setResultadoTexto(textoResultado);
      
      setProgress(100);
      
      // Esperar un momento antes de cambiar a la pantalla de resultado
      setTimeout(() => {
        setStep(4); // Ir a pantalla de resultado
      }, 500);
//errooooooooor nooooooooo
    } catch (error) {
      console.error('Error completo al analizar la imagen:', error);
      console.error('Tipo de error:', error.constructor.name);
      console.error('Stack trace:', error.stack);
      
      // Mostrar información más detallada del error
      let errorMessage = 'Error al procesar la imagen.\n\n';
      errorMessage += `Mensaje: ${error.message}\n`;
      errorMessage += `Tipo: ${error.constructor.name}\n`;
      
      // Detectar diferentes tipos de errores
      if (error.name === 'AbortError') {
        errorMessage += '\n⏱️ Tiempo de espera agotado (más de 2 minutos).\n\n';
        errorMessage += 'La conexión WiFi tardó demasiado. Posibles causas:\n';
        errorMessage += '- Conexión WiFi lenta o inestable\n';
        errorMessage += '- Imagen muy grande para enviar por WiFi\n';
        errorMessage += '- El servidor no responde\n\n';
        errorMessage += '💡 Intenta:\n';
        errorMessage += '- Verificar la velocidad de tu WiFi\n';
        errorMessage += '- Reducir el tamaño de la imagen\n';
        errorMessage += '- Verificar que ambas PCs estén en la misma red WiFi\n';
        errorMessage += '- Intentar nuevamente';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += '\n⚠️ Error de conexión WiFi: No se pudo conectar al backend.\n\n';
        errorMessage += '🔍 Pasos para solucionar (Backend en otra PC vía WiFi):\n\n';
        errorMessage += '1. Verifica la IP correcta de la PC del backend:\n';
        errorMessage += '   - En la PC del backend, ejecuta: ipconfig\n';
        errorMessage += '   - Busca "Adaptador de LAN inalámbrica Wi-Fi" → "Dirección IPv4"\n';
        errorMessage += '   - Copia esa IP y actualiza src/config.js si es diferente\n';
        errorMessage += `   - IP actual configurada: ${API_ENDPOINTS.SUBIR_IMAGEN.replace('/api/subir-imagen', '').replace('http://', '')}\n\n`;
        errorMessage += '2. Verifica que el backend esté corriendo:\n';
        errorMessage += '   - En la PC del backend, debe mostrar: "Servidor escuchando en puerto 3000"\n';
        errorMessage += '   - IMPORTANTE: El servidor debe escuchar en 0.0.0.0, no solo en localhost\n';
        errorMessage += '   - Ejemplo: app.listen(3000, "0.0.0.0", ...)\n\n';
        errorMessage += '3. Prueba la conexión HTTP (más confiable que ping):\n';
        errorMessage += `   - Abre en el navegador: ${API_ENDPOINTS.SUBIR_IMAGEN.replace('/api/subir-imagen', '')}\n`;
        errorMessage += '   - Si ves una respuesta (aunque sea error 404), la conexión funciona\n';
        errorMessage += '   - Si no carga, el problema es de red o firewall\n\n';
        errorMessage += '4. Verifica el firewall en la PC del backend:\n';
        errorMessage += '   - Windows: Panel de control > Firewall > Configuración avanzada\n';
        errorMessage += '   - Reglas de entrada > Nueva regla > Puerto > TCP > 3000\n';
        errorMessage += '   - Permitir la conexión > Aplicar a todos los perfiles\n\n';
        errorMessage += '5. Nota sobre ping:\n';
        errorMessage += '   - Si el ping falla pero HTTP funciona, es normal (firewall bloquea ICMP)\n';
        errorMessage += '   - Prueba con: telnet 10.12.222.75 3000 (debe conectar)\n\n';
        errorMessage += '6. Verifica CORS en el backend:\n';
        errorMessage += '   - El backend debe tener CORS configurado\n';
        errorMessage += '   - Debe permitir: http://localhost:5173';
      }
      
      alert(errorMessage);
      setStep(2); // Volver a la pantalla de carga de imagen
      setProgress(0);
    }
  };

  // Generar y descargar PDF con el resultado del backend
  const handleDownload = () => {
    // Crear nuevo documento PDF
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Resultado VeterinarIA', 105, 20, { align: 'center' });
    
    // Línea separadora del pdf para tunearlo
    doc.setLineWidth(0.5);
    doc.line(20, 30, 190, 30);
    
    // Contenido del resultado del backend
    if (resultadoTexto) {
      doc.setFontSize(12);
      // Dividir el texto en líneas que quepan en el ancho de la página
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      
      // Dividir el texto en líneas
      const lines = doc.splitTextToSize(resultadoTexto, maxWidth);
      
      let yPosition = 45;
      const lineHeight = 7;
      const pageHeight = doc.internal.pageSize.getHeight();
      const bottomMargin = 20;
      
      // Agregar texto línea por línea, creando nuevas páginas si es necesario
      lines.forEach((line) => {
        if (yPosition + lineHeight > pageHeight - bottomMargin) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    } else {
      doc.setFontSize(12);
      doc.text('No hay resultado disponible', 20, 45);
    }
    
    // Guardar el PDF
    doc.save('Resultado-VeterinarIA.pdf');
  };

  // volver atrás desde el logo 
  const handleLogoClick = () => {
    // Limpiar archivos si hay alguno cargado
    setFile(null);
    setFilePreview(null);
    // Limpiar resultado anterior
    setResultadoTexto('');
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

  // Pantalla de procesar (Step 3)
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
              {resultadoTexto || 'Procesando resultado...'}
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

  // Splash Screen la step 0 seria
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
