# Deploy final

## 1) Backend en Render

1. Entrá a https://render.com
2. Crear nuevo servicio > Web Service
3. Conectá este repositorio
4. Configurá:
   - root directory: `server`
   - build command: `npm install`
   - start command: `npm start`
5. Agregá variables de entorno:
   - `PORT=4000`
   - `CLIENT_URL=https://<tu-app>.vercel.app`
   - `MONGO_URI=<tu-string-de-atlas>`
6. Deploy

## 2) Frontend en Vercel

1. Entrá a https://vercel.com
2. Importá el repositorio
3. Configurá:
   - framework: Vite
   - root directory: `client`
4. Agregá variable de entorno:
   - `VITE_API_URL=https://<tu-render-url>/api`
5. Deploy

## 3) Verificar

- Frontend: https://<tu-app>.vercel.app
- API: https://<tu-render-url>/api/health

## 4) Demo final

Muestra:
- dashboard con misiones
- crear misión nueva
- completar misión
- cambios en UI y API
- enlace público funcionando
