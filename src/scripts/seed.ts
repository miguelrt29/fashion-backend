import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Product } from '../products/product.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Fashion2024*',
  database: process.env.DB_NAME || 'fashion_store',
  entities: [Product],
  synchronize: true,
});

const products = [
  // MUJER - VESTIDOS
  {
    name: 'Vestido Midi Floral',
    description:
      'Vestido corto con estampado floral refinado. Perfecto para ocasiones especiales.',
    price: 289000,
    stock: 18,
    category: 'vestidos',
    gender: 'mujer',
    brand: 'Elegance',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['floral rosa', 'floral azul'],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
    ],
    discount: 10,
    isActive: true,
  },
  {
    name: 'Vestido Evening Negro',
    description:
      'Vestido de noche clasico. Sofisticacion absoluta para eventos formales.',
    price: 350000,
    stock: 12,
    category: 'vestidos',
    gender: 'mujer',
    brand: 'LuxuryCouture',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['negro'],
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80',
    ],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Vestido Summer Amarillo',
    description:
      'Vestido ligero de verano en amarillo. Frescura y estilo playero.',
    price: 219000,
    stock: 22,
    category: 'vestidos',
    gender: 'mujer',
    brand: 'SunStyle',
    sizes: ['S', 'M', 'L'],
    colors: ['amarillo', 'coral', 'blanco'],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
    ],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Vestido Wrap Beige',
    description: 'Vestido envolvente con cinturon. Versatilidad elegante.',
    price: 245000,
    stock: 15,
    category: 'vestidos',
    gender: 'mujer',
    brand: 'OfficeWear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['beige', 'negro'],
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80',
    ],
    discount: 20,
    isActive: true,
  },
  // MUJER - PANTALONES
  {
    name: 'Jeans Skinny Negros',
    description: 'Jeans ajustados de tiro alto. Elegancia y estilo.',
    price: 175000,
    stock: 28,
    category: 'pantalones',
    gender: 'mujer',
    brand: 'DenimCo',
    sizes: ['26', '28', '30', '32', '34'],
    colors: ['negro'],
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
    ],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Pantalon Cargo Verde',
    description: 'Pantalon cargo multifuncional. Estilo utilitario.',
    price: 145000,
    stock: 35,
    category: 'pantalones',
    gender: 'mujer',
    brand: 'OutdoorPro',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['verde militar', 'negro', 'caqui'],
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
    ],
    discount: 15,
    isActive: true,
  },
  // MUJER - ZAPATOS
  {
    name: 'Zapatillas Urban Blancas',
    description:
      'Zapatillas urbanas clasicas en blanco. Versatilidad y estilo.',
    price: 195000,
    stock: 30,
    category: 'zapatos',
    gender: 'mujer',
    brand: 'UrbanStyle',
    sizes: ['35', '36', '37', '38', '39', '40'],
    colors: ['blanco', 'negro'],
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',
    ],
    discount: 0,
    isActive: true,
  },
  // MUJER - BLUSAS
  {
    name: 'Blusa Seda Rosa',
    description: 'Blusa de seda con acabado elegante.',
    price: 189000,
    stock: 20,
    category: 'blusas',
    gender: 'mujer',
    brand: 'Elegance',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['rosa', 'blanco', 'negro'],
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
    ],
    discount: 10,
    isActive: true,
  },
  // HOMBRE - CAMISETAS
  {
    name: 'Camiseta Oversized Gris',
    description: 'Camiseta oversized en gris. Estilo urbano moderno.',
    price: 85000,
    stock: 30,
    category: 'camisetas',
    gender: 'hombre',
    brand: 'StreetWear',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['gris', 'negro'],
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',
    ],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Camiseta Logo Negra',
    description: 'Camiseta basica con logo. Clasica para el dia.',
    price: 79000,
    stock: 40,
    category: 'camisetas',
    gender: 'hombre',
    brand: 'UrbanStyle',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['negro', 'blanco'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    ],
    discount: 0,
    isActive: true,
  },
  // HOMBRE - CAMISAS
  {
    name: 'Camisa Oxford Blanca',
    description: 'Camisa Oxford de algodon. Elegante para oficina.',
    price: 165000,
    stock: 25,
    category: 'camisas',
    gender: 'hombre',
    brand: 'OfficeWear',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['blanco', 'azul claro'],
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
    ],
    discount: 15,
    isActive: true,
  },
  {
    name: 'Camisa Jean Lavada',
    description: 'Camisa de mezclilla con lavado suave.',
    price: 145000,
    stock: 30,
    category: 'camisas',
    gender: 'hombre',
    brand: 'DenimCo',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['azul claro', 'azul indigo'],
    images: [
      'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80',
    ],
    discount: 0,
    isActive: true,
  },
  // HOMBRE - PANTALONES
  {
    name: 'Jeans Slim Fit Azules',
    description: 'Jeans Slim Fit con stretch. Ajuste perfecto.',
    price: 189000,
    stock: 45,
    category: 'pantalones',
    gender: 'hombre',
    brand: 'DenimCo',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['azul indigo', 'azul oscuro'],
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
    ],
    discount: 20,
    isActive: true,
  },
  {
    name: 'Pantalon Formal Negro',
    description: 'Pantalon formal para oficina.',
    price: 159000,
    stock: 20,
    category: 'pantalones',
    gender: 'hombre',
    brand: 'OfficeWear',
    sizes: ['30', '32', '34', '36', '38'],
    colors: ['negro', 'gris oscuro'],
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
    ],
    discount: 0,
    isActive: true,
  },
  // HOMBRE - CHACUETAS
  {
    name: 'Chaqueta de Cuero Negra',
    description: 'Chaqueta de cuero genuino. Iconica y atemporal.',
    price: 320000,
    stock: 10,
    category: 'chaquetas',
    gender: 'hombre',
    brand: 'RebelWear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['negro'],
    images: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80',
    ],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Chaqueta Jean Lavada',
    description: 'Chaqueta de mezclilla con lavado unico.',
    price: 195000,
    stock: 25,
    category: 'chaquetas',
    gender: 'hombre',
    brand: 'DenimCo',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['azul claro', 'azul indigo'],
    images: [
      'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&q=80',
    ],
    discount: 15,
    isActive: true,
  },
  {
    name: 'Chaqueta Bomber Verde',
    description: 'Chaqueta bomber con forro. Calidez urbana.',
    price: 275000,
    stock: 18,
    category: 'chaquetas',
    gender: 'hombre',
    brand: 'StreetWear',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['verde militar', 'negro'],
    images: [
      'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&q=80',
    ],
    discount: 0,
    isActive: true,
  },
  // HOMBRE - ZAPATOS
  {
    name: 'Zapatillas Running Negras',
    description: 'Zapatillas deportivas de alto rendimiento.',
    price: 289000,
    stock: 40,
    category: 'zapatos',
    gender: 'hombre',
    brand: 'SpeedRun',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['negro', 'blanco', 'gris'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    ],
    discount: 10,
    isActive: true,
  },
  {
    name: 'Botines Cuero Marrón',
    description: 'Botines de cuero para uso diario.',
    price: 265000,
    stock: 15,
    category: 'zapatos',
    gender: 'hombre',
    brand: 'UrbanStyle',
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['marron', 'negro'],
    images: [
      'https://images.unsplash.com/photo-1542280756-74b2f55e73ab?w=600&q=80',
    ],
    discount: 0,
    isActive: true,
  },
  // ACCESORIOS
  {
    name: 'Bolso Tote Cuero',
    description: 'Bolso tote de cuero para uso diario.',
    price: 245000,
    stock: 15,
    category: 'accesorios',
    gender: 'mujer',
    brand: 'LuxeBags',
    sizes: ['Unica'],
    colors: ['marron', 'negro', 'beige'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    ],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Gorra Snapback Negra',
    description: 'Gorra snapback con ajuste clasico.',
    price: 45000,
    stock: 60,
    category: 'accesorios',
    gender: 'hombre',
    brand: 'StreetWear',
    sizes: ['Unica'],
    colors: ['negro', 'azul', 'rojo'],
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80',
    ],
    discount: 0,
    isActive: true,
  },
];

async function seed() {
  console.log('Conectando a la base de datos...');

  await AppDataSource.initialize();
  console.log('Conexion establecida\n');

  const repo = AppDataSource.getRepository(Product);

  const count = await repo.count();
  if (count > 0) {
    console.log(`Ya existen ${count} productos en la base de datos.`);
    const confirm = process.env.SEED_OVERWRITE || 'n';
    if (confirm.toLowerCase() !== 'y') {
      console.log(
        'Seed cancelado. Establece SEED_OVERWRITE=y para reemplazar.',
      );
      process.exit(0);
    }
    await repo.clear();
    console.log('Productos anteriores eliminados.\n');
  }

  console.log(`Insertando ${products.length} productos...\n`);

  for (const productData of products) {
    const product = repo.create(productData);
    await repo.save(product);
    console.log(`✓ ${product.gender} | ${product.name}`);
  }

  console.log(`\nSeed completado: ${products.length} productos insertados`);
  console.log('\nDistribución:');
  console.log(
    `  Mujer: ${products.filter((p) => p.gender === 'mujer').length} productos`,
  );
  console.log(
    `  Hombre: ${products.filter((p) => p.gender === 'hombre').length} productos`,
  );

  await AppDataSource.destroy();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error durante el seed:', error);
  process.exit(1);
});
