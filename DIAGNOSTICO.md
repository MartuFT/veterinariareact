# 🔍 Guía de Diagnóstico - Conexión Backend WiFi

## Problema: ERR_CONNECTION_TIMED_OUT

El navegador no puede conectarse a `http://10.12.222.75:3000`

## ✅ Checklist de Verificación

### En la PC del Backend:

1. **Verifica que el backend esté corriendo:**
   ```bash
   # Debe mostrar algo como:
   # "Servidor escuchando en puerto 3000"
   ```

2. **Verifica la IP correcta:**
   ```bash
   ipconfig
   # Busca "Adaptador de LAN inalámbrica Wi-Fi"
   # Copia la "Dirección IPv4"
   ```

3. **VERIFICA QUE EL SERVIDOR ESCUCHE EN 0.0.0.0:**
   
   En el código del backend, debe ser:
   ```javascript
   app.listen(3000, '0.0.0.0', () => {
     console.log('Servidor escuchando en puerto 3000');
   });
   ```
   
   O simplemente:
   ```javascript
   app.listen(3000, () => {
     console.log('Servidor escuchando en puerto 3000');
   });
   ```
   
   ❌ NO debe ser:
   ```javascript
   app.listen(3000, 'localhost', ...)  // ❌ MAL
   app.listen(3000, '127.0.0.1', ...)  // ❌ MAL
   ```

4. **Configura el Firewall de Windows:**
   - Abre: Panel de control > Firewall de Windows > Configuración avanzada
   - Reglas de entrada > Nueva regla
   - Tipo: Puerto
   - Protocolo: TCP
   - Puerto específico: 3000
   - Acción: Permitir la conexión
   - Perfiles: Marca todos (Dominio, Privada, Pública)
   - Nombre: "Backend Node.js Puerto 3000"

5. **Prueba desde la PC del backend:**
   - Abre el navegador en la PC del backend
   - Ve a: `http://localhost:3000`
   - Debe responder (aunque sea error 404)
   - Si no responde, el backend no está corriendo correctamente

### En esta PC (Frontend):

1. **Verifica la IP:**
   - Abre `src/config.js`
   - Verifica que `BACKEND_URL` tenga la IP correcta de la PC del backend

2. **Prueba la conexión:**
   - Abre en el navegador: `http://10.12.222.75:3000`
   - Si no carga, el problema es de red/firewall

3. **Prueba con telnet:**
   ```bash
   telnet 10.12.222.75 3000
   ```
   - Si conecta: el puerto está abierto
   - Si no conecta: el firewall está bloqueando

## 🔧 Soluciones Alternativas

### Opción 1: Usar ngrok (Túnel Público)

Si nada funciona, puedes usar ngrok para crear un túnel:

1. En la PC del backend, instala ngrok:
   ```bash
   # Descarga de https://ngrok.com/download
   ```

2. Ejecuta ngrok:
   ```bash
   ngrok http 3000
   ```

3. Copia la URL que te da (ej: `https://abc123.ngrok.io`)

4. Actualiza `src/config.js`:
   ```javascript
   export const BACKEND_URL = 'https://abc123.ngrok.io';
   ```

### Opción 2: Usar localtunnel (Alternativa a ngrok)

1. En la PC del backend:
   ```bash
   npm install -g localtunnel
   lt --port 3000
   ```

2. Copia la URL y actualiza `src/config.js`

### Opción 3: Verificar configuración del router

Algunos routers tienen "Aislamiento de AP" que bloquea comunicación entre dispositivos:
- Accede a la configuración del router
- Busca "AP Isolation" o "Client Isolation"
- Desactívalo si está activo

## 📝 Notas Importantes

- El ping puede fallar aunque HTTP funcione (firewall bloquea ICMP)
- Si el backend solo escucha en `localhost`, no será accesible desde otra PC
- El firewall debe permitir conexiones entrantes en el puerto 3000
- Ambas PCs deben estar en la misma red WiFi

