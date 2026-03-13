const { CronJob } = require('cron');
const { registrarIngreso, registrarSalida } = require('./main');

// Zona horaria: GMT-5 (América/Lima)
const TIMEZONE = 'America/Lima';

// Función para generar un delay aleatorio entre 60 y 180 segundos (1-3 min)
function getRandomDelay() {
  return Math.floor(Math.random() * 121) + 60; // 60 a 180 segundos
}

// Función para pausar la ejecución
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para obtener la hora actual en GMT-5
function getCurrentTimeInTimezone() {
  return new Date().toLocaleString('es-ES', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

async function executeIngreso() {
  const delaySec = getRandomDelay();
  const delayMs = delaySec * 1000;
  
  const timestamp = getCurrentTimeInTimezone();
  
  console.log(`\n⏰ [${timestamp}] INGRESO programado. Esperando ${delaySec} segundos...\n`);
  await sleep(delayMs);
  
  const timestampExec = getCurrentTimeInTimezone();
  
  console.log(`\n⏰ [${timestampExec}] Ejecutando INGRESO...\n`);
  
  try {
    await registrarIngreso();
  } catch (error) {
    console.error('❌ Error en registro de ingreso:', error.message);
  }
}

async function executeSalida() {
  const delaySec = getRandomDelay();
  const delayMs = delaySec * 1000;
  
  const timestamp = getCurrentTimeInTimezone();
  
  console.log(`\n⏰ [${timestamp}] SALIDA programada. Esperando ${delaySec} segundos...\n`);
  await sleep(delayMs);
  
  const timestampExec = getCurrentTimeInTimezone();
  
  console.log(`\n⏰ [${timestampExec}] Ejecutando SALIDA...\n`);
  
  try {
    await registrarSalida();
  } catch (error) {
    console.error('❌ Error en registro de salida:', error.message);
  }
}

console.log('🚀 === SCHEDULER INICIADO ===\n');
console.log(`📍 Zona horaria: ${TIMEZONE} (GMT-5)\n`);
console.log('📅 Tareas programadas:');
console.log('  • INGRESO: 8:55 AM (GMT-5) + espera aleatoria 60-180 seg');
console.log('  • SALIDA:  6:35 PM (GMT-5) + espera aleatoria 60-180 seg');
console.log('\nFormato cron: segundo minuto hora día mes día-semana');
console.log('Presiona Ctrl+C para detener el scheduler\n');
console.log('='.repeat(50) + '\n');

// Tarea de ingreso a las 8:55 AM (GMT-5)
// Formato: segundo minuto hora día mes día-semana
// 1-5 = lunes a viernes (solo días de semana)
const jobIngreso = new CronJob(
  '0 55 8 * * 1-5', // 8:55 AM, lunes a viernes
  executeIngreso,
  null, // onComplete
  true, // start
  TIMEZONE
);

// Tarea de salida a las 6:35 PM (GMT-5)
// 1-5 = lunes a viernes (solo días de semana)
const jobSalida = new CronJob(
  '0 35 18 * * 1-5', // 6:35 PM (18:35 en formato 24h), lunes a viernes
  executeSalida,
  null, // onComplete
  true, // start
  TIMEZONE
);

console.log(`✅ Scheduler activo`);
console.log(`   • Próximo ingreso: 8:55 AM ${TIMEZONE}`);
console.log(`   • Próxima salida: 6:35 PM ${TIMEZONE}`);
