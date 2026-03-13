const fetch = require('node-fetch');

// URLs
const baseUrl = process.env.URL;
const loginPageUrl = `${baseUrl}/login.jsp`;
const loginUrl = `${baseUrl}/login.usuario`;
const asistenciaUrl = `${baseUrl}/insertarIngreso.asistencia?method=insertarAsistencia`;

// Leer credenciales de variables de entorno
const credentials = {
  txtUsername: process.env.USERNAME || '',
  txtPassword: process.env.PASSWORD || '',
  method: 'login',
  movil_: false,
  ippublica: 'desactivado'
};

// Validar que las credenciales estén definidas
if (!credentials.txtUsername || !credentials.txtPassword) {
  console.error('❌ Error: Credenciales no configuradas');
  console.error('Define las siguientes variables de entorno:');
  console.error('  - USERNAME: usuario');
  console.error('  - PASSWORD: contraseña');
  console.error('\nEjemplo:');
  console.error('  export USERNAME="user@example.com"');
  console.error('  export PASSWORD="password123"');
  console.error('\nO crea un archivo .env con el contenido:');
  console.error('  USERNAME=user@example.com');
  console.error('  PASSWORD=password123');
  process.exit(1);
}

// Headers realistas de navegador
const browserHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'max-age=0',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none'
};

// Almacenar cookies
let cookies = {};

async function fetchWithCookies(url, options = {}) {
  // Construir header de cookies
  const cookieHeader = Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');

  const headers = {
    ...browserHeaders,
    ...options.headers
  };

  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    redirect: 'follow'
  });

  // Capturar Set-Cookie
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    const cookieLines = Array.isArray(setCookie) ? setCookie : [setCookie];
    cookieLines.forEach(line => {
      const parts = line.split(';')[0].split('=');
      if (parts.length === 2) {
        cookies[parts[0].trim()] = parts[1].trim();
      }
    });
  }

  return response;
}

async function step1LoadLoginPage() {
  console.log('📝 === PASO 1: CARGAR PÁGINA DE LOGIN ===\n');
  console.log(`🔗 URL: ${loginPageUrl}\n`);

  try {
    const response = await fetchWithCookies(loginPageUrl, {
      method: 'GET'
    });

    console.log(`✓ Status: ${response.status}`);
    const body = await response.text();

    if (body.includes('login') || body.includes('Login')) {
      console.log('✓ Página de login cargada correctamente\n');
      return true;
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    return false;
  }
}

async function step2SubmitLogin() {
  console.log('🔐 === PASO 2: ENVIAR FORMULARIO DE LOGIN ===\n');
  console.log(`Usuario: ${credentials.txtUsername}\n`);

  try {
    // Preparar datos del formulario
    const formData = new URLSearchParams();
    Object.entries(credentials).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetchWithCookies(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': baseUrl,
        'Referer': loginPageUrl
      },
      body: formData.toString()
    });

    console.log(`✓ Status: ${response.status}`);

    // Mostrar cookies capturadas
    console.log('\n🍪 Cookies capturadas:');
    Object.entries(cookies).forEach(([key, value]) => {
      console.log(`  • ${key}=${value}`);
      if (key === 'JSESSIONID') {
        console.log(`\n  🎫 JSESSIONID encontrada!`);
      }
    });

    const body = await response.text();
    if (body && body.length > 0) {
      console.log('\n✓ Login enviado correctamente\n');
      return true;
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    return false;
  }
}

async function registrarAsistencia(flag) {
  console.log(`📨 === REGISTRANDO ${flag.toUpperCase()} ===\n`);
  console.log(`🔗 URL: ${asistenciaUrl}\n`);

  try {
    console.log('Cookies enviadas:');
    Object.entries(cookies).forEach(([key, value]) => {
      console.log(`  • ${key}=${value}`);
    });
    console.log();

    const response = await fetchWithCookies(asistenciaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': baseUrl,
        'Referer': loginPageUrl
      },
      body: new URLSearchParams({
        flag: flag,
        lat: '',
        lng: '',
        ubicacion: 'ubicacion'
      })
    });

    console.log(`✓ Status: ${response.status}`);
    const body = await response.text();

    if (response.status === 200) {
      console.log(`✅ ${flag.charAt(0).toUpperCase() + flag.slice(1)} registrado exitosamente\n`);
    } else {
      console.log(`⚠️ Código: ${response.status}\n`);
    }

    console.log('📄 Respuesta del servidor:\n');
    if (body) {
      const preview = body.substring(0, 500);
      console.log(preview);
      if (body.length > 500) {
        console.log(`(... ${body.length - 500} caracteres más ...)`);
      }
    }

    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    return false;
  }
}

async function registrarIngreso() {
  console.log('🚀 Iniciando registro de INGRESO\n');
  console.log('='.repeat(50) + '\n');

  // Ignorar verificación de certificados SSL
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const step1 = await step1LoadLoginPage();
  if (!step1) return false;

  const step2 = await step2SubmitLogin();
  if (!step2) return false;

  const ingreso = await registrarAsistencia('ingreso');
  if (!ingreso) return false;

  console.log('='.repeat(50));
  console.log('\n✅ Ingreso registrado exitosamente');
  return true;
}

async function registrarSalida() {
  console.log('🚀 Iniciando registro de SALIDA\n');
  console.log('='.repeat(50) + '\n');

  // Ignorar verificación de certificados SSL
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const step1 = await step1LoadLoginPage();
  if (!step1) return false;

  const step2 = await step2SubmitLogin();
  if (!step2) return false;

  const salida = await registrarAsistencia('salida');
  if (!salida) return false;

  console.log('='.repeat(50));
  console.log('\n✅ Salida registrada exitosamente');
  return true;
}

async function main() {
  console.log('🚀 Iniciando registro de INGRESO Y SALIDA\n');
  console.log('='.repeat(50) + '\n');

  // Ignorar verificación de certificados SSL
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const step1 = await step1LoadLoginPage();
  if (!step1) return;

  const step2 = await step2SubmitLogin();
  if (!step2) return;

  const ingreso = await registrarAsistencia('ingreso');
  if (!ingreso) return;

  const salida = await registrarAsistencia('salida');
  if (!salida) return;

  console.log('='.repeat(50));
  console.log('\n✅ Ingreso y salida registrados exitosamente');
}

// Exportar funciones para que puedan ser usadas como módulos
module.exports = { main, registrarIngreso, registrarSalida };

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  const action = process.argv[2];
  
  if (action === 'ingreso') {
    registrarIngreso().catch(console.error);
  } else if (action === 'salida') {
    registrarSalida().catch(console.error);
  } else {
    console.log('Uso:');
    console.log('  node main.js ingreso  - Registra ingreso');
    console.log('  node main.js salida   - Registra salida');
    console.log('');
    console.log('Para crones, usa:');
    console.log('  0 8 * * * node /ruta/main.js ingreso   # Ingreso a las 8:00 AM');
    console.log('  0 18 * * * node /ruta/main.js salida   # Salida a las 6:00 PM');
  }
}
