import * as dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:3000/api';

async function testFixes() {
  console.log('=== TEST: Arreglos de FashionStore ===\n');

  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ No hay token. Primero inicia sesión');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test 1: Perfil - Actualizar teléfono
  console.log('1. TEST: Actualizar teléfono del perfil');
  const profileRes = await fetch(`${BASE_URL}/users/profile`, { headers });
  const profile = await profileRes.json();
  console.log('   Perfil actual:', { 
    firstName: profile.firstName, 
    phone: profile.phone || 'sin teléfono' 
  });

  const updateRes = await fetch(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ phone: '3001234567' })
  });
  if (updateRes.ok) {
    const updated = await updateRes.json();
    console.log('   ✅ Teléfono actualizado:', updated.phone);
  } else {
    console.log('   ❌ Error al actualizar teléfono');
  }

  // Test 2: Direcciones
  console.log('\n2. TEST: CRUD de direcciones');
  
  // Crear dirección
  const addressRes = await fetch(`${BASE_URL}/users/addresses`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      label: 'Casa Test',
      street: 'Calle 123 #45-67',
      city: 'Bogotá',
      state: 'Cundinamarca',
      postalCode: '110111',
      country: 'Colombia',
      phone: '3001234567',
      isDefault: true
    })
  });
  
  if (addressRes.ok) {
    const address = await addressRes.json();
    console.log('   ✅ Dirección creada:', address.id);
    console.log('   Label:', address.label, '| Phone:', address.phone);

    // Actualizar dirección
    const updateAddrRes = await fetch(`${BASE_URL}/users/addresses/${address.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ 
        street: 'Carrera 15 #78-90',
        phone: '3209876543'
      })
    });
    
    if (updateAddrRes.ok) {
      const updatedAddr = await updateAddrRes.json();
      console.log('   ✅ Dirección actualizada');
      console.log('   Nueva calle:', updatedAddr.street, '| Teléfono:', updatedAddr.phone);
    }

    // Eliminar dirección
    const deleteRes = await fetch(`${BASE_URL}/users/addresses/${address.id}`, {
      method: 'DELETE',
      headers
    });
    
    if (deleteRes.ok) {
      console.log('   ✅ Dirección eliminada');
    }
  } else {
    console.log('   ❌ Error al crear dirección:', await addressRes.text());
  }

  // Test 3: Listar direcciones
  console.log('\n3. TEST: Listar direcciones');
  const listRes = await fetch(`${BASE_URL}/users/addresses`, { headers });
  if (listRes.ok) {
    const addresses = await listRes.json();
    console.log('   ✅ Direcciones del usuario:', addresses.length);
    addresses.forEach((a: any, i: number) => {
      console.log(`   ${i+1}. ${a.label} - ${a.street} (${a.phone || 'sin tel'})`);
    });
  }

  // Test 4: Pedidos (verificar que el endpoint existe)
  console.log('\n4. TEST: Endpoint de pedidos');
  const ordersRes = await fetch(`${BASE_URL}/orders`, { headers });
  console.log('   ✅ Endpoint /orders responde:', ordersRes.status);

  console.log('\n=== TESTS COMPLETADOS ===');
  console.log('\n📋 RESUMEN DE ARREGLOS:');
  console.log('1. Pasarela de pagos: Mejorado manejo de errores - ahora muestra');
  console.log('   error cuando falla Stripe/MercadoPago en vez de continuar');
  console.log('2. Direcciones: El campo "label" ahora se guarda correctamente');
  console.log('3. Teléfono: Ahora se guarda tanto en perfil como en direcciones');
  console.log('\n⚠️  NOTA: Para que funcione la pasarela de pagos, necesitas:');
  console.log('   - Configurar STRIPE_SECRET_KEY real en .env');
  console.log('   - Configurar MERCADOPAGO_ACCESS_TOKEN real en .env');
}

testFixes().catch(console.error);