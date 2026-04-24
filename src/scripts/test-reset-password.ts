import * as dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:3000/api';

async function testResetPasswordFlow() {
  const email = process.argv[2] || 'miguelrt2903@gmail.com';
  const newPassword = process.argv[3] || 'Test1234';

  console.log('=== Probando flujo de recuperación de contraseña ===\n');
  console.log(`Email: ${email}`);
  console.log(`Nueva contraseña: ${newPassword}\n`);

  // Paso 1: Solicitar reset
  console.log('1. Solicitando enlace de recuperación...');
  const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const forgotData = await forgotRes.json();
  console.log('   Respuesta:', forgotData);

  if (!forgotRes.ok) {
    console.log('\n❌ Error en solicitud de recuperación');
    return;
  }

  // Paso 2: Obtener token de la BD
  console.log('\n2. Obteniendo token de la base de datos...');
  const { Pool } = await import('pg');
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const userResult = await pool.query(
    'SELECT id, "resetToken", "resetTokenExpiry" FROM users WHERE email = $1',
    [email]
  );

  if (userResult.rows.length === 0) {
    console.log('❌ No se encontró usuario');
    await pool.end();
    return;
  }

  const { resetToken, resetTokenExpiry } = userResult.rows[0];
  
  if (!resetToken) {
    console.log('❌ No hay token de reset (¿el paso 1 falló?)');
    await pool.end();
    return;
  }

  console.log(`   Token: ${resetToken}`);
  console.log(`   Expira: ${resetTokenExpiry}`);
  console.log('\n   📧 Revisa el email o verifica el token en la URL del enlace');
  console.log(`   URL: http://localhost:4200/reset-password?token=${resetToken}`);

  await pool.end();

  // Paso 3: Resetear contraseña (automático para testing)
  console.log('\n3. Restableciendo contraseña...');
  const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: resetToken, newPassword }),
  });
  const resetData = await resetRes.json();
  console.log('   Respuesta:', resetData);

  if (resetRes.ok) {
    console.log('\n✅ ¡Contraseña actualizada exitosamente!');
    console.log(`   Ahora puedes iniciar sesión con:`);
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${newPassword}`);
  } else {
    console.log('\n❌ Error al restablecer contraseña');
  }
}

testResetPasswordFlow().catch(console.error);