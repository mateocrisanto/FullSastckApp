# QuestBoard

Dominio del proyecto: un minijuego de productividad personal donde cada tarea o hábito se convierte en una misión con XP, racha y progreso.

## Paso 1: dominio y flujo de ramas

- Nombre del proyecto: QuestBoard
- Rama principal: `main`
- Flujo recomendado: GitHub Flow con ramas por feature
- Ejemplo: `feature/dashboard-ui`, `feature/quest-api`

## Paso 2: frontend React

La app incluye:
- pantalla de dashboard
- lista de misiones
- formulario de creación
- componente de misión con estado de completado
- estilo inspirado en Duolingo

## Ejecutar localmente

```bash
npm install
npm run dev
```

Esto levanta:
- frontend en http://localhost:5174
- backend en http://localhost:4000

## Repositorio Git

Ejecuta en la terminal:

```bash
git init -b main
git add .
git commit -m "feat: initial project setup"
```

Luego conecta tu remoto de GitHub si lo deseas:

```bash
git remote add origin <tu-url-de-github>
git push -u origin main
```
