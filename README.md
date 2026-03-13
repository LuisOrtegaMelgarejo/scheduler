# Script de Login 

Emulador de navegador ligero para automatizar login y acceso al formulario de asistencia

## Configuración

### Opción 1: Variables de entorno

```bash
export USERNAME="your-email@example.com"
export PASSWORD="your-password"
npm start
```

### Opción 2: Archivo .env (Recomendado)

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Edita `.env` y agrega tus credenciales:
```
USERNAME=usuario@domain.com
PASSWORD=password
URL=https://domain.com
```

3. Ejecuta:
```bash
npm install
npm start
```

⚠️ **IMPORTANTE**: El archivo `.env` está en `.gitignore` y no se commitrá al repositorio (las credenciales son sensibles).

## Uso

### Ejecución Manual (una sola vez)

```bash
npm start
```

### Scheduler Automático (Cron)

Ejecuta el script automáticamente a una hora aleatoria entre **8:50 AM y 8:55 AM** cada día:

```bash
npm run schedule
```

El scheduler:
- 🎲 Elige una hora aleatoria entre 8:50 y 8:55 AM cada día
- ⏰ Ejecuta el login automáticamente a esa hora
- 🔄 Regenera la hora aleatoria cada noche a las 11:59 PM
- 📅 Corre continuamente (presiona Ctrl+C para detener)

## Proceso

El script realiza 3 pasos:

1. **PASO 1**: Carga la página de login (`login.jsp`)
2. **PASO 2**: Envía el formulario con credenciales y captura la cookie `JSESSIONID`
3. **PASO 3**: Accede al formulario de asistencia usando la sesión autenticada

## Output

- ✓ Status codes HTTP
- 🍪 Cookies capturadas (incluyendo JSESSIONID)
- 📄 Contenido de la respuesta del servidor
- ⏰ Timestamps de ejecución en modo scheduler

## Scripts Disponibles

- `npm start` - Ejecuta el script una sola vez
- `npm run schedule` - Inicia el scheduler cron
