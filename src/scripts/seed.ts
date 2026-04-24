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
  {
    name: 'Camiseta Classic Blanca',
    description: 'Camiseta de algodon organico de corte clasico. Fresca, comoda y perfecta para cualquier ocasion casual. Calidad premium con acabado suave.',
    price: 89000,
    stock: 50,
    category: 'camisetas',
    brand: 'UrbanStyle',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['blanco', 'negro', 'gris'],
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Camiseta Fit Algodon',
    description: 'Camiseta deportiva de alto rendimiento con tecnologia moisture-wicking. Ideal para entrenamiento y actividades fisicas.',
    price: 119000,
    stock: 35,
    category: 'camisetas',
    brand: 'ActiveFit',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['negro', 'azul', 'rojo'],
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80'],
    discount: 15,
    isActive: true,
  },
  {
    name: 'Camiseta Relaxed Verde',
    description: 'Camiseta de corte holgado en verde militar. Prenda versatil para el dia a dia con estilo relajado.',
    price: 79000,
    stock: 40,
    category: 'camisetas',
    brand: 'EcoWear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['verde', 'negro', 'beige'],
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80'],
    discount: 10,
    isActive: true,
  },
  {
    name: 'Camiseta V-Neck Negra',
    description: 'Camiseta clasica con escote en V. Elegancia minimalista para looks formales o casuales.',
    price: 95000,
    stock: 25,
    category: 'camisetas',
    brand: 'UrbanStyle',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['negro', 'blanco'],
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Camiseta Oversized Gris',
    description: 'Camiseta de tendencia oversized en gris topo. Estilo urbano moderno con cada relajada.',
    price: 85000,
    stock: 30,
    category: 'camisetas',
    brand: 'StreetWear',
    sizes: ['M', 'L', 'XL'],
    colors: ['gris', 'negro'],
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80'],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Jeans Slim Fit Azules',
    description: 'Pantalon mezclilla de corte Slim Fit con stretch confortable. Ajuste perfecto que realza la figura.',
    price: 189000,
    stock: 45,
    category: 'pantalones',
    brand: 'DenimCo',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['azul indigo', 'azul oscuro'],
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'],
    discount: 20,
    isActive: true,
  },
  {
    name: 'Pantalon Formal Negro',
    description: 'Pantalon de mezclilla para oficina. Estilo profesional con comodidad todo el dia.',
    price: 159000,
    stock: 20,
    category: 'pantalones',
    brand: 'OfficeWear',
    sizes: ['30', '32', '34', '36', '38'],
    colors: ['negro', 'gris oscuro'],
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80'],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Jeans Skinny Negros',
    description: 'Jeans ajustados de tiro alto en negro clasico. Elegancia y estilo en una sola prenda.',
    price: 175000,
    stock: 28,
    category: 'pantalones',
    brand: 'DenimCo',
    sizes: ['26', '28', '30', '32', '34'],
    colors: ['negro'],
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Pantalon Cargo Verde',
    description: 'Pantalon cargo multifuncional con multiples bolsillos. Estilo utilitario para aventuras urbanas.',
    price: 145000,
    stock: 35,
    category: 'pantalones',
    brand: 'OutdoorPro',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['verde militar', 'negro', 'caqui'],
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80'],
    discount: 15,
    isActive: true,
  },
  {
    name: 'Vestido Midi Floral',
    description: 'Vestido corto con estampado floral refinado. Perfecto para ocasiones especiales y eventos elegantes.',
    price: 289000,
    stock: 18,
    category: 'vestidos',
    brand: 'Elegance',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['floral rosa', 'floral azul'],
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80'],
    discount: 10,
    isActive: true,
  },
  {
    name: 'Vestido Evening Negro',
    description: 'Vestido de noche clasico de largo completo. Sofisticacion absoluta para eventos formales.',
    price: 350000,
    stock: 12,
    category: 'vestidos',
    brand: 'LuxuryCouture',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['negro'],
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80'],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Vestido Summer Amarillo',
    description: 'Vestido ligero de verano en amarillo brillante. Frescura y alegria con estilo playero contemporaneo.',
    price: 219000,
    stock: 22,
    category: 'vestidos',
    brand: 'SunStyle',
    sizes: ['S', 'M', 'L'],
    colors: ['amarillo', 'coral', 'blanco'],
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80'],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Vestido Wrap Beige',
    description: 'Vestido envolvente tipo wrap con cinturon. Versatilidad elegante para trabajo o salidas.',
    price: 245000,
    stock: 15,
    category: 'vestidos',
    brand: 'OfficeWear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['beige', 'negro'],
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80'],
    discount: 20,
    isActive: true,
  },
  {
    name: 'Chaqueta de Cuero Negra',
    description: 'Chaqueta de cuero genuino estilo moto. Iconica, atemporal y con presencia magnetica.',
    price: 320000,
    stock: 10,
    category: 'chaquetas',
    brand: 'RebelWear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['negro'],
    images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80'],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Chaqueta Jean Lavada',
    description: 'Chaqueta de mezclilla con lavado unico. Estilo casual con personalidad.',
    price: 195000,
    stock: 25,
    category: 'chaquetas',
    brand: 'DenimCo',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['azul claro', 'azul indigo'],
    images: ['https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&q=80'],
    discount: 15,
    isActive: true,
  },
  {
    name: 'Chaqueta Bomber Verde',
    description: 'Chaqueta bomber shell con forro termico. Calidez con estilo urbano moderno.',
    price: 275000,
    stock: 18,
    category: 'chaquetas',
    brand: 'StreetWear',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['verde militar', 'negro'],
    images: ['https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&q=80'],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Zapatillas Running Negras',
    description: 'Zapatillas deportivas de alto rendimiento. Tecnologia de amortiguacion avanzada para running.',
    price: 289000,
    stock: 40,
    category: 'zapatos',
    brand: 'SpeedRun',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['negro', 'blanco', 'gris'],
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
    discount: 10,
    isActive: true,
  },
  {
    name: 'Zapatillas Urban Blancas',
    description: 'Zapatillas urbanas clasicas en blanco minimal. Versatilidad y estilo para cualquier outfit.',
    price: 195000,
    stock: 30,
    category: 'zapatos',
    brand: 'UrbanStyle',
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['blanco', 'negro'],
    images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80'],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Bolso Tote Cuero',
    description: 'Bolso tote de cuero para uso diario. Capacidad amplia con compartimentos organizados.',
    price: 245000,
    stock: 15,
    category: 'accesorios',
    brand: 'LuxeBags',
    sizes: ['Unica'],
    colors: ['marron', 'negro', 'beige'],
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'],
    discount: 0,
    isActive: true,
  },
  {
    name: 'Gorra Snapback Negra',
    description: 'Gorra snapback con ajuste clasico. Estilo urbano con logo minimal.',
    price: 45000,
    stock: 60,
    category: 'accesorios',
    brand: 'StreetWear',
    sizes: ['Unica'],
    colors: ['negro', 'azul', 'rojo'],
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'],
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
      console.log('Seed cancelado. Establece SEED_OVERWRITE=y para reemplazar.');
      process.exit(0);
    }
    await repo.clear();
    console.log('Productos anteriores eliminados.\n');
  }

  console.log('Insertando 20 productos...\n');

  for (const productData of products) {
    const product = repo.create(productData);
    await repo.save(product);
    console.log(`Producto creado: ${product.name}`);
  }

  console.log('\nSeed completado: 20 productos insertados');

  await AppDataSource.destroy();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error durante el seed:', error);
  process.exit(1);
});