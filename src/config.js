// Configuración del backend
// Ajusta esta URL según tu configuración local

// Si el backend está en la misma máquina que el frontend:
// export const BACKEND_URL = 'http://localhost:3000';

// Si el backend está en otra máquina de la red local (WiFi):
// IMPORTANTE: Verifica la IP correcta en la PC del backend con: ipconfig
export const BACKEND_URL = 'http://10.12.222.75:3000';

// Si el backend está en la nube:
// export const BACKEND_URL = 'https://tu-backend.vercel.app';

export const API_ENDPOINTS = {
  SUBIR_IMAGEN: `${BACKEND_URL}/api/subir-imagen`,
};

