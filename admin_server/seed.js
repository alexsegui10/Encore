// seed.js - Script para poblar MongoDB con datos de prueba
import 'dotenv/config';
import { PrismaClient as PrismaAdmin } from '@prisma/client';
import { PrismaClient as PrismaEnterprise } from '../enterprise_server/microservices/product-service/node_modules/.prisma/client/index.js';
import argon2 from 'argon2';

const dbUrl = process.env.DATABASE_URL;
const admin = new PrismaAdmin({ datasources: { db: { url: dbUrl } } });
const enterprise = new PrismaEnterprise({ datasources: { db: { url: dbUrl } } });

function getRandomProducts(products, count) {
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description,
    image: p.image
  }));
}

function generateUID() {
  return 'uid_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Iniciando seed con datos expandidos...\n');

  console.log('Limpiando datos existentes...');
  await admin.ticket.deleteMany();
  await admin.payment.deleteMany();
  await admin.orderItem.deleteMany();
  await admin.order.deleteMany();
  await admin.events.deleteMany();
  await admin.categories.deleteMany();
  await admin.users.deleteMany();
  await admin.admin.deleteMany();
  await enterprise.product.deleteMany();
  await enterprise.productCategory.deleteMany();
  await enterprise.enterprise.deleteMany();
  console.log('Limpiado\n');

  // ============================================================
  // 1. CATEGORIAS DE EVENTOS (10 categorias)
  // ============================================================
  console.log('Creando categorias de eventos...');
  const eventCats = await Promise.all([
    admin.categories.create({
      data: {
        name: 'Conciertos',
        slug: 'conciertos',
        description: 'Grandes conciertos y giras musicales',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
        isActive: true,
        status: 'active'
      }
    }),
    admin.categories.create({
      data: {
        name: 'Festivales',
        slug: 'festivales',
        description: 'Festivales de musica y arte',
        image: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf',
        isActive: true,
        status: 'active'
      }
    }),
    admin.categories.create({
      data: {
        name: 'Teatro',
        slug: 'teatro',
        description: 'Obras de teatro y musicales',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
        isActive: true,
        status: 'active'
      }
    }),
    admin.categories.create({
      data: {
        name: 'Deportes',
        slug: 'deportes',
        description: 'Eventos deportivos y competiciones',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
        isActive: true,
        status: 'active'
      }
    }),
    admin.categories.create({
      data: {
        name: 'Comedia',
        slug: 'comedia',
        description: 'Stand-up comedy y espectaculos de humor',
        image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca',
        isActive: true,
        status: 'active'
      }
    }),
    admin.categories.create({
      data: {
        name: 'Opera',
        slug: 'opera',
        description: 'Opera clasica y contemporanea',
        image: 'https://images.unsplash.com/photo-1580809361436-42a7ec204889',
        isActive: true,
        status: 'active'
      }
    }),
    admin.categories.create({
      data: {
        name: 'Danza',
        slug: 'danza',
        description: 'Ballet, danza contemporanea y flamenco',
        image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434',
        isActive: true,
        status: 'active'
      }
    }),
    admin.categories.create({
      data: {
        name: 'Circo',
        slug: 'circo',
        description: 'Espectaculos circenses y acrobacias',
        image: 'https://images.unsplash.com/photo-1535467221272-0a325cc5acb9',
        isActive: true,
        status: 'active'
      }
    }),
    admin.categories.create({
      data: {
        name: 'Conferencias',
        slug: 'conferencias',
        description: 'Conferencias, charlas y eventos corporativos',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50a2f5f6',
        isActive: true,
        status: 'active'
      }
    }),
    admin.categories.create({
      data: {
        name: 'Exposiciones',
        slug: 'exposiciones',
        description: 'Exposiciones de arte y cultura',
        image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6',
        isActive: true,
        status: 'active'
      }
    })
  ]);
  console.log(`${eventCats.length} categorias de eventos creadas\n`);

  // ============================================================
  // 2. CATEGORIAS DE PRODUCTOS (6 categorias)
  // ============================================================
  console.log('Creando categorias de productos...');
  const prodCats = await Promise.all([
    enterprise.productCategory.create({
      data: {
        name: 'Ropa',
        description: 'Camisetas, sudaderas, gorras y mas',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        isActive: true
      }
    }),
    enterprise.productCategory.create({
      data: {
        name: 'Accesorios',
        description: 'Bolsas, pulseras, llaveros y complementos',
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b',
        isActive: true
      }
    }),
    enterprise.productCategory.create({
      data: {
        name: 'Coleccionables',
        description: 'Posters, vinilos, pins y ediciones limitadas',
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7',
        isActive: true
      }
    }),
    enterprise.productCategory.create({
      data: {
        name: 'Bebidas',
        description: 'Bebidas y refrescos del evento',
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e',
        isActive: true
      }
    }),
    enterprise.productCategory.create({
      data: {
        name: 'Tecnologia',
        description: 'Gadgets y accesorios tecnologicos',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
        isActive: true
      }
    }),
    enterprise.productCategory.create({
      data: {
        name: 'Hogar',
        description: 'Articulos para el hogar y decoracion',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
        isActive: true
      }
    })
  ]);
  console.log(`${prodCats.length} categorias de productos creadas\n`);

  // ============================================================
  // 3. PRODUCTOS (~30 productos)
  // ============================================================
  console.log('Creando productos...');
  const products = await Promise.all([
    // ROPA (8 productos)
    enterprise.product.create({
      data: {
        name: 'Camiseta Negra Encore',
        description: 'Camiseta 100% algodon con logo bordado',
        price: 25,
        currency: 'EUR',
        stockTotal: 500,
        stockAvailable: 500,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        status: 'active',
        categoryId: prodCats[0].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Sudadera Gris Premium',
        description: 'Sudadera con capucha de calidad premium',
        price: 55,
        currency: 'EUR',
        stockTotal: 300,
        stockAvailable: 300,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7',
        status: 'active',
        categoryId: prodCats[0].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Gorra Snapback Negra',
        description: 'Gorra ajustable con logo bordado',
        price: 22,
        currency: 'EUR',
        stockTotal: 400,
        stockAvailable: 400,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b',
        status: 'active',
        categoryId: prodCats[0].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Camiseta Blanca Oversized',
        description: 'Camiseta oversized de corte moderno',
        price: 28,
        currency: 'EUR',
        stockTotal: 450,
        stockAvailable: 450,
        image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68',
        status: 'active',
        categoryId: prodCats[0].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Sudadera Negra Zip',
        description: 'Sudadera con cremallera completa',
        price: 65,
        currency: 'EUR',
        stockTotal: 250,
        stockAvailable: 250,
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2',
        status: 'active',
        categoryId: prodCats[0].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Camiseta Tour 2025',
        description: 'Edicion limitada del tour 2025',
        price: 35,
        currency: 'EUR',
        stockTotal: 200,
        stockAvailable: 200,
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
        status: 'active',
        categoryId: prodCats[0].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Bufanda Oficial',
        description: 'Bufanda tejida de alta calidad',
        price: 18,
        currency: 'EUR',
        stockTotal: 350,
        stockAvailable: 350,
        image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20',
        status: 'active',
        categoryId: prodCats[0].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Chaqueta Bomber',
        description: 'Chaqueta bomber con parches bordados',
        price: 120,
        currency: 'EUR',
        stockTotal: 100,
        stockAvailable: 100,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
        status: 'active',
        categoryId: prodCats[0].id
      }
    }),
    // ACCESORIOS (6 productos)
    enterprise.product.create({
      data: {
        name: 'Tote Bag Ecologica',
        description: 'Bolsa de algodon organico',
        price: 12,
        currency: 'EUR',
        stockTotal: 600,
        stockAvailable: 600,
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b',
        status: 'active',
        categoryId: prodCats[1].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Pulsera LED',
        description: 'Pulsera LED recargable RGB',
        price: 10,
        currency: 'EUR',
        stockTotal: 1000,
        stockAvailable: 1000,
        image: 'https://images.unsplash.com/photo-1622122201714-77da0ca8e5d2',
        status: 'active',
        categoryId: prodCats[1].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Llavero Metalico',
        description: 'Llavero con logo grabado laser',
        price: 8,
        currency: 'EUR',
        stockTotal: 800,
        stockAvailable: 800,
        image: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e',
        status: 'active',
        categoryId: prodCats[1].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Mochila Premium',
        description: 'Mochila resistente al agua',
        price: 45,
        currency: 'EUR',
        stockTotal: 250,
        stockAvailable: 250,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
        status: 'active',
        categoryId: prodCats[1].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Gafas de Sol',
        description: 'Gafas de sol con funda incluida',
        price: 25,
        currency: 'EUR',
        stockTotal: 300,
        stockAvailable: 300,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083',
        status: 'active',
        categoryId: prodCats[1].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Rinonera Festival',
        description: 'Rinonera impermeable para festivales',
        price: 20,
        currency: 'EUR',
        stockTotal: 400,
        stockAvailable: 400,
        image: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6',
        status: 'active',
        categoryId: prodCats[1].id
      }
    }),
    // COLECCIONABLES (6 productos)
    enterprise.product.create({
      data: {
        name: 'Poster Oficial 50x70',
        description: 'Poster en papel premium mate',
        price: 15,
        currency: 'EUR',
        stockTotal: 500,
        stockAvailable: 500,
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7',
        status: 'active',
        categoryId: prodCats[2].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Vinilo Edicion Especial',
        description: 'Vinilo coloreado edicion limitada',
        price: 35,
        currency: 'EUR',
        stockTotal: 200,
        stockAvailable: 200,
        image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617',
        status: 'active',
        categoryId: prodCats[2].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Set de 5 Pins',
        description: 'Set de pins esmaltados coleccionables',
        price: 20,
        currency: 'EUR',
        stockTotal: 400,
        stockAvailable: 400,
        image: 'https://images.unsplash.com/photo-1610651692394-6125c1e0f0a5',
        status: 'active',
        categoryId: prodCats[2].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Libro Fotografico',
        description: 'Libro de fotografias del tour',
        price: 40,
        currency: 'EUR',
        stockTotal: 150,
        stockAvailable: 150,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
        status: 'active',
        categoryId: prodCats[2].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'CD Firmado',
        description: 'CD con firma del artista',
        price: 30,
        currency: 'EUR',
        stockTotal: 100,
        stockAvailable: 100,
        image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1',
        status: 'active',
        categoryId: prodCats[2].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Litografia Numerada',
        description: 'Litografia firmada y numerada',
        price: 75,
        currency: 'EUR',
        stockTotal: 50,
        stockAvailable: 50,
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
        status: 'active',
        categoryId: prodCats[2].id
      }
    }),
    // BEBIDAS (4 productos)
    enterprise.product.create({
      data: {
        name: 'Botella de Agua 500ml',
        description: 'Botella de agua reutilizable',
        price: 5,
        currency: 'EUR',
        stockTotal: 2000,
        stockAvailable: 2000,
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e',
        status: 'active',
        categoryId: prodCats[3].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Vaso Reutilizable',
        description: 'Vaso oficial del evento',
        price: 3,
        currency: 'EUR',
        stockTotal: 3000,
        stockAvailable: 3000,
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b',
        status: 'active',
        categoryId: prodCats[3].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Termo Acero Inox',
        description: 'Termo de acero inoxidable 750ml',
        price: 28,
        currency: 'EUR',
        stockTotal: 400,
        stockAvailable: 400,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8',
        status: 'active',
        categoryId: prodCats[3].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Pack Cerveza Artesana',
        description: 'Pack 4 cervezas artesanas',
        price: 15,
        currency: 'EUR',
        stockTotal: 500,
        stockAvailable: 500,
        image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13',
        status: 'active',
        categoryId: prodCats[3].id
      }
    }),
    // TECNOLOGIA (4 productos)
    enterprise.product.create({
      data: {
        name: 'Power Bank 10000mAh',
        description: 'Bateria portatil con logo',
        price: 30,
        currency: 'EUR',
        stockTotal: 300,
        stockAvailable: 300,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
        status: 'active',
        categoryId: prodCats[4].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Auriculares Bluetooth',
        description: 'Auriculares inalambricos edicion especial',
        price: 65,
        currency: 'EUR',
        stockTotal: 150,
        stockAvailable: 150,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        status: 'active',
        categoryId: prodCats[4].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Funda Movil',
        description: 'Funda para movil con diseno exclusivo',
        price: 18,
        currency: 'EUR',
        stockTotal: 600,
        stockAvailable: 600,
        image: 'https://images.unsplash.com/photo-1541877944-ac82a091518a',
        status: 'active',
        categoryId: prodCats[4].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Altavoz Portatil',
        description: 'Altavoz bluetooth resistente al agua',
        price: 45,
        currency: 'EUR',
        stockTotal: 200,
        stockAvailable: 200,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1',
        status: 'active',
        categoryId: prodCats[4].id
      }
    }),
    // HOGAR (4 productos)
    enterprise.product.create({
      data: {
        name: 'Taza Ceramica',
        description: 'Taza de ceramica con diseno artistico',
        price: 12,
        currency: 'EUR',
        stockTotal: 500,
        stockAvailable: 500,
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d',
        status: 'active',
        categoryId: prodCats[5].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Cojin Decorativo',
        description: 'Cojin con estampado exclusivo',
        price: 25,
        currency: 'EUR',
        stockTotal: 300,
        stockAvailable: 300,
        image: 'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b',
        status: 'active',
        categoryId: prodCats[5].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Vela Aromatica',
        description: 'Vela aromatica en envase de cristal',
        price: 20,
        currency: 'EUR',
        stockTotal: 400,
        stockAvailable: 400,
        image: 'https://images.unsplash.com/photo-1602607444584-c99c0e0ac4fd',
        status: 'active',
        categoryId: prodCats[5].id
      }
    }),
    enterprise.product.create({
      data: {
        name: 'Cuadro Enmarcado',
        description: 'Cuadro decorativo con marco de madera',
        price: 55,
        currency: 'EUR',
        stockTotal: 150,
        stockAvailable: 150,
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca',
        status: 'active',
        categoryId: prodCats[5].id
      }
    })
  ]);
  console.log(`${products.length} productos creados\n`);

  // ============================================================
  // 4. EVENTOS (25 eventos)
  // ============================================================
  console.log('Creando eventos...');
  const events = await Promise.all([
    // CONCIERTOS (6)
    admin.events.create({
      data: {
        slug: 'hans-zimmer-valencia-2026',
        title: 'Hans Zimmer Live - Valencia',
        date: new Date('2026-03-26T20:30:00.000Z'),
        price: 85,
        currency: 'EUR',
        location: 'Roig Arena, Valencia',
        description: 'El compositor Hans Zimmer presenta su tour "The Next Level" con orquesta en directo.',
        category: eventCats[0].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063',
        images: [],
        stock: 5000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 4)
      }
    }),
    admin.events.create({
      data: {
        slug: 'eric-clapton-madrid-2026',
        title: 'Eric Clapton - Madrid',
        date: new Date('2026-05-07T21:00:00.000Z'),
        price: 110,
        currency: 'EUR',
        location: 'Movistar Arena, Madrid',
        description: 'El legendario guitarrista Eric Clapton en su gira de despedida.',
        category: eventCats[0].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1',
        images: [],
        stock: 3000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 5)
      }
    }),
    admin.events.create({
      data: {
        slug: 'tame-impala-barcelona-2026',
        title: 'Tame Impala - Barcelona',
        date: new Date('2026-04-08T21:00:00.000Z'),
        price: 65,
        currency: 'EUR',
        location: 'Palau Sant Jordi, Barcelona',
        description: 'Tame Impala presenta su sonido psicodelico unico en Barcelona.',
        category: eventCats[0].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044',
        images: [],
        stock: 10000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 3)
      }
    }),
    admin.events.create({
      data: {
        slug: 'rosalia-world-tour-madrid',
        title: 'Rosalia - Motomami World Tour',
        date: new Date('2026-06-15T21:30:00.000Z'),
        price: 75,
        currency: 'EUR',
        location: 'WiZink Center, Madrid',
        description: 'Rosalia continua su exitoso Motomami World Tour.',
        category: eventCats[0].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
        images: [],
        stock: 15000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 4)
      }
    }),
    admin.events.create({
      data: {
        slug: 'coldplay-barcelona-2026',
        title: 'Coldplay - Music of the Spheres',
        date: new Date('2026-07-20T20:00:00.000Z'),
        price: 95,
        currency: 'EUR',
        location: 'Estadio Olimpico, Barcelona',
        description: 'Coldplay trae su espectacular gira mundial a Barcelona.',
        category: eventCats[0].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1501612780327-45045538702b',
        images: [],
        stock: 50000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 5)
      }
    }),
    admin.events.create({
      data: {
        slug: 'bad-bunny-sevilla-2026',
        title: 'Bad Bunny - Most Wanted Tour',
        date: new Date('2026-08-10T22:00:00.000Z'),
        price: 120,
        currency: 'EUR',
        location: 'Estadio La Cartuja, Sevilla',
        description: 'Bad Bunny presenta su nuevo album en directo.',
        category: eventCats[0].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
        images: [],
        stock: 40000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 4)
      }
    }),
    // FESTIVALES (4)
    admin.events.create({
      data: {
        slug: 'primavera-sound-2026',
        title: 'Primavera Sound 2026',
        date: new Date('2026-06-04T17:00:00.000Z'),
        price: 280,
        currency: 'EUR',
        location: 'Parc del Forum, Barcelona',
        description: 'El festival mas esperado del ano con mas de 200 artistas.',
        category: eventCats[1].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf',
        images: [],
        stock: 60000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 6)
      }
    }),
    admin.events.create({
      data: {
        slug: 'mad-cool-2026',
        title: 'Mad Cool Festival 2026',
        date: new Date('2026-07-08T16:00:00.000Z'),
        price: 220,
        currency: 'EUR',
        location: 'Espacio Mad Cool, Madrid',
        description: 'El gran festival madrileno regresa con un cartel espectacular.',
        category: eventCats[1].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
        images: [],
        stock: 45000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 5)
      }
    }),
    admin.events.create({
      data: {
        slug: 'sonar-2026',
        title: 'Sonar Barcelona 2026',
        date: new Date('2026-06-18T14:00:00.000Z'),
        price: 195,
        currency: 'EUR',
        location: 'Fira Montjuic, Barcelona',
        description: 'Festival internacional de musica avanzada y arte multimedia.',
        category: eventCats[1].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
        images: [],
        stock: 35000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 4)
      }
    }),
    admin.events.create({
      data: {
        slug: 'bbk-live-2026',
        title: 'BBK Live 2026',
        date: new Date('2026-07-07T15:00:00.000Z'),
        price: 175,
        currency: 'EUR',
        location: 'Kobetamendi, Bilbao',
        description: 'El festival vasco celebra su aniversario con grandes artistas.',
        category: eventCats[1].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
        images: [],
        stock: 40000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 4)
      }
    }),
    // TEATRO (3)
    admin.events.create({
      data: {
        slug: 'rey-leon-madrid-2026',
        title: 'El Rey Leon - El Musical',
        date: new Date('2026-02-15T20:00:00.000Z'),
        price: 90,
        currency: 'EUR',
        location: 'Teatro Lope de Vega, Madrid',
        description: 'El musical mas exitoso de Disney celebra 10 anos en Madrid.',
        category: eventCats[2].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
        images: [],
        stock: null,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 3)
      }
    }),
    admin.events.create({
      data: {
        slug: 'phantom-opera-barcelona',
        title: 'El Fantasma de la Opera',
        date: new Date('2026-03-20T19:30:00.000Z'),
        price: 85,
        currency: 'EUR',
        location: 'Teatre Tivoli, Barcelona',
        description: 'El clasico musical de Andrew Lloyd Webber llega a Barcelona.',
        category: eventCats[2].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1503095396549-807759245b35',
        images: [],
        stock: 800,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 2)
      }
    }),
    admin.events.create({
      data: {
        slug: 'les-miserables-madrid',
        title: 'Los Miserables',
        date: new Date('2026-04-10T20:00:00.000Z'),
        price: 95,
        currency: 'EUR',
        location: 'Teatro Rialto, Madrid',
        description: 'La produccion espanola del legendario musical.',
        category: eventCats[2].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf',
        images: [],
        stock: 600,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 2)
      }
    }),
    // DEPORTES (3)
    admin.events.create({
      data: {
        slug: 'real-madrid-barcelona-2026',
        title: 'Real Madrid vs FC Barcelona',
        date: new Date('2026-04-20T21:00:00.000Z'),
        price: 150,
        currency: 'EUR',
        location: 'Santiago Bernabeu, Madrid',
        description: 'El Clasico de La Liga 2025-2026.',
        category: eventCats[3].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
        images: [],
        stock: 80000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 4)
      }
    }),
    admin.events.create({
      data: {
        slug: 'final-copa-rey-2026',
        title: 'Final Copa del Rey 2026',
        date: new Date('2026-05-25T21:30:00.000Z'),
        price: 180,
        currency: 'EUR',
        location: 'La Cartuja, Sevilla',
        description: 'La gran final de la Copa del Rey.',
        category: eventCats[3].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
        images: [],
        stock: 55000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 3)
      }
    }),
    admin.events.create({
      data: {
        slug: 'moto-gp-valencia-2026',
        title: 'MotoGP Gran Premio de Valencia',
        date: new Date('2026-11-15T14:00:00.000Z'),
        price: 95,
        currency: 'EUR',
        location: 'Circuito Ricardo Tormo, Valencia',
        description: 'Ultima carrera del campeonato mundial de MotoGP.',
        category: eventCats[3].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
        images: [],
        stock: 30000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 3)
      }
    }),
    // COMEDIA (2)
    admin.events.create({
      data: {
        slug: 'david-broncano-tour-2026',
        title: 'David Broncano - La Resistencia Live',
        date: new Date('2026-03-15T21:00:00.000Z'),
        price: 35,
        currency: 'EUR',
        location: 'Teatro Olympia, Valencia',
        description: 'David Broncano lleva La Resistencia al teatro.',
        category: eventCats[4].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca',
        images: [],
        stock: 1500,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 2)
      }
    }),
    admin.events.create({
      data: {
        slug: 'ignatius-farray-2026',
        title: 'Ignatius Farray - Nuevo Show',
        date: new Date('2026-04-22T20:30:00.000Z'),
        price: 28,
        currency: 'EUR',
        location: 'Teatro Circo Price, Madrid',
        description: 'Ignatius Farray presenta su nuevo espectaculo de stand-up.',
        category: eventCats[4].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260',
        images: [],
        stock: 2000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 2)
      }
    }),
    // OPERA (2)
    admin.events.create({
      data: {
        slug: 'la-traviata-liceu-2026',
        title: 'La Traviata - Gran Teatre del Liceu',
        date: new Date('2026-02-28T19:00:00.000Z'),
        price: 120,
        currency: 'EUR',
        location: 'Gran Teatre del Liceu, Barcelona',
        description: 'La opera de Verdi en una nueva produccion del Liceu.',
        category: eventCats[5].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1580809361436-42a7ec204889',
        images: [],
        stock: 2200,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 2)
      }
    }),
    admin.events.create({
      data: {
        slug: 'carmen-real-madrid-2026',
        title: 'Carmen - Teatro Real',
        date: new Date('2026-05-12T20:00:00.000Z'),
        price: 135,
        currency: 'EUR',
        location: 'Teatro Real, Madrid',
        description: 'La opera de Bizet en el Teatro Real de Madrid.',
        category: eventCats[5].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1516307365426-bea591f05011',
        images: [],
        stock: 1800,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 2)
      }
    }),
    // DANZA (2)
    admin.events.create({
      data: {
        slug: 'ballet-moscow-valencia',
        title: 'Ballet de Moscu - El Lago de los Cisnes',
        date: new Date('2026-01-20T19:30:00.000Z'),
        price: 65,
        currency: 'EUR',
        location: 'Palau de les Arts, Valencia',
        description: 'El clasico ballet interpretado por la compania de Moscu.',
        category: eventCats[6].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434',
        images: [],
        stock: 1500,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 2)
      }
    }),
    admin.events.create({
      data: {
        slug: 'flamenco-real-2026',
        title: 'Flamenco Real - Sara Baras',
        date: new Date('2026-06-08T20:30:00.000Z'),
        price: 55,
        currency: 'EUR',
        location: 'Teatro Real, Madrid',
        description: 'Sara Baras presenta su nuevo espectaculo de flamenco.',
        category: eventCats[6].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea',
        images: [],
        stock: 1600,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 2)
      }
    }),
    // CIRCO (1)
    admin.events.create({
      data: {
        slug: 'cirque-soleil-barcelona-2026',
        title: 'Cirque du Soleil - Kooza',
        date: new Date('2026-09-15T20:00:00.000Z'),
        price: 75,
        currency: 'EUR',
        location: 'Carpa Cirque du Soleil, Barcelona',
        description: 'El espectaculo Kooza del Cirque du Soleil llega a Barcelona.',
        category: eventCats[7].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1535467221272-0a325cc5acb9',
        images: [],
        stock: 2500,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 3)
      }
    }),
    // CONFERENCIAS (1)
    admin.events.create({
      data: {
        slug: 'ted-talks-madrid-2026',
        title: 'TEDx Madrid 2026',
        date: new Date('2026-10-20T10:00:00.000Z'),
        price: 45,
        currency: 'EUR',
        location: 'Teatro Circulo de Bellas Artes, Madrid',
        description: 'Ideas que merecen ser difundidas. Un dia de charlas inspiradoras.',
        category: eventCats[8].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1540575467063-178a50a2f5f6',
        images: [],
        stock: 500,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 1)
      }
    }),
    // EXPOSICIONES (1)
    admin.events.create({
      data: {
        slug: 'banksy-madrid-2026',
        title: 'Banksy - The Art of Protest',
        date: new Date('2026-02-01T10:00:00.000Z'),
        price: 18,
        currency: 'EUR',
        location: 'Espacio Ibercaja, Madrid',
        description: 'Exposicion no autorizada de las obras del artista anonimo.',
        category: eventCats[9].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1531058020387-3be344556be6',
        images: [],
        stock: null,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 2)
      }
    })
  ]);
  console.log(`${events.length} eventos creados\n`);

  // ============================================================
  // 5. USUARIOS DE PRUEBA (8 usuarios)
  // ============================================================
  console.log('Creando usuarios de prueba...');
  const hashedPassword = await argon2.hash('Test1234!');
  const hashedAdminPassword = await argon2.hash('Admin1234!');

  const users = await Promise.all([
    // Admins (2)
    admin.users.create({
      data: {
        uid: generateUID(),
        slug: 'admin-principal',
        username: 'admin',
        email: 'admin@encore.com',
        password: hashedAdminPassword,
        bio: 'Administrador principal del sistema',
        image: 'https://api.dicebear.com/7.x/identicon/svg?seed=admin',
        isActive: true,
        status: 'active',
        role: 'admin',
        favouriteEvents: [],
        followingUsers: [],
        comentarios: [],
        reservas: []
      }
    }),
    admin.users.create({
      data: {
        uid: generateUID(),
        slug: 'admin-soporte',
        username: 'soporte',
        email: 'soporte@encore.com',
        password: hashedAdminPassword,
        bio: 'Equipo de soporte tecnico',
        image: 'https://api.dicebear.com/7.x/identicon/svg?seed=soporte',
        isActive: true,
        status: 'active',
        role: 'admin',
        favouriteEvents: [],
        followingUsers: [],
        comentarios: [],
        reservas: []
      }
    }),
    // Clientes (6)
    admin.users.create({
      data: {
        uid: generateUID(),
        slug: 'maria-garcia',
        username: 'mariagarcia',
        email: 'maria.garcia@email.com',
        password: hashedPassword,
        bio: 'Amante de la musica en directo',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
        isActive: true,
        status: 'active',
        role: 'client',
        favouriteEvents: [],
        followingUsers: [],
        comentarios: [],
        reservas: []
      }
    }),
    admin.users.create({
      data: {
        uid: generateUID(),
        slug: 'carlos-martinez',
        username: 'carlosmartinez',
        email: 'carlos.martinez@email.com',
        password: hashedPassword,
        bio: 'Fan del teatro y la opera',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
        isActive: true,
        status: 'active',
        role: 'client',
        favouriteEvents: [],
        followingUsers: [],
        comentarios: [],
        reservas: []
      }
    }),
    admin.users.create({
      data: {
        uid: generateUID(),
        slug: 'laura-fernandez',
        username: 'laurafernandez',
        email: 'laura.fernandez@email.com',
        password: hashedPassword,
        bio: 'Festivales son mi pasion',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=laura',
        isActive: true,
        status: 'active',
        role: 'client',
        favouriteEvents: [],
        followingUsers: [],
        comentarios: [],
        reservas: []
      }
    }),
    admin.users.create({
      data: {
        uid: generateUID(),
        slug: 'pablo-sanchez',
        username: 'pablosanchez',
        email: 'pablo.sanchez@email.com',
        password: hashedPassword,
        bio: 'Aficionado al deporte',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pablo',
        isActive: true,
        status: 'active',
        role: 'client',
        favouriteEvents: [],
        followingUsers: [],
        comentarios: [],
        reservas: []
      }
    }),
    admin.users.create({
      data: {
        uid: generateUID(),
        slug: 'ana-lopez',
        username: 'analopez',
        email: 'ana.lopez@email.com',
        password: hashedPassword,
        bio: 'Coleccionista de experiencias',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
        isActive: true,
        status: 'active',
        role: 'client',
        favouriteEvents: [],
        followingUsers: [],
        comentarios: [],
        reservas: []
      }
    }),
    admin.users.create({
      data: {
        uid: generateUID(),
        slug: 'david-ruiz',
        username: 'davidruiz',
        email: 'david.ruiz@email.com',
        password: hashedPassword,
        bio: 'Musica electronica y tecnologia',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
        isActive: true,
        status: 'active',
        role: 'client',
        favouriteEvents: [],
        followingUsers: [],
        comentarios: [],
        reservas: []
      }
    })
  ]);
  console.log(`${users.length} usuarios creados\n`);

  // ============================================================
  // 5b. ADMIN PANEL USERS (colección Admin para login en admin panel)
  // ============================================================
  console.log('Creando admins del panel...');
  const admins = await Promise.all([
    admin.admin.create({
      data: {
        uid: generateUID(),
        username: 'admin',
        email: 'admin@encore.com',
        password: hashedAdminPassword,
        isActive: true
      }
    }),
    admin.admin.create({
      data: {
        uid: generateUID(),
        username: 'soporte',
        email: 'soporte@encore.com',
        password: hashedAdminPassword,
        isActive: true
      }
    })
  ]);
  console.log(`${admins.length} admins del panel creados\n`);

  // ============================================================
  // 6. EMPRESAS (5 empresas con credenciales de login)
  // ============================================================
  console.log('Creando empresas...');
  const hashedEnterprisePassword = await argon2.hash('Enterprise1234!');

  const enterprises = await Promise.all([
    enterprise.enterprise.create({
      data: {
        uid: generateUID(),
        email: 'livenation@encore.com',
        password: hashedEnterprisePassword,
        name: 'Live Nation Espana',
        description: 'Promotora de conciertos y festivales lider mundial',
        logo: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d',
        website: 'https://www.livenation.es',
        contactEmail: 'info@livenation.es',
        phone: '+34 91 123 4567',
        status: 'active',
        isVerified: true
      }
    }),
    enterprise.enterprise.create({
      data: {
        uid: generateUID(),
        email: 'ticketmaster@encore.com',
        password: hashedEnterprisePassword,
        name: 'Ticketmaster Espana',
        description: 'Plataforma de venta de entradas',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43',
        website: 'https://www.ticketmaster.es',
        contactEmail: 'soporte@ticketmaster.es',
        phone: '+34 902 150 025',
        status: 'active',
        isVerified: true
      }
    }),
    enterprise.enterprise.create({
      data: {
        uid: generateUID(),
        email: 'stage@encore.com',
        password: hashedEnterprisePassword,
        name: 'Stage Entertainment Espana',
        description: 'Productora de musicales y teatro',
        logo: 'https://images.unsplash.com/photo-1503095396549-807759245b35',
        website: 'https://www.stage-entertainment.es',
        contactEmail: 'info@stage-entertainment.es',
        phone: '+34 91 456 7890',
        status: 'active',
        isVerified: true
      }
    }),
    enterprise.enterprise.create({
      data: {
        uid: generateUID(),
        email: 'doctormusic@encore.com',
        password: hashedEnterprisePassword,
        name: 'Doctor Music',
        description: 'Organizador de festivales independientes',
        logo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
        website: 'https://www.doctormusic.com',
        contactEmail: 'info@doctormusic.com',
        phone: '+34 93 567 8901',
        status: 'active',
        isVerified: true
      }
    }),
    enterprise.enterprise.create({
      data: {
        uid: generateUID(),
        email: 'fever@encore.com',
        password: hashedEnterprisePassword,
        name: 'Fever',
        description: 'Plataforma de descubrimiento de experiencias',
        logo: 'https://images.unsplash.com/photo-1531058020387-3be344556be6',
        website: 'https://feverup.com',
        contactEmail: 'hola@feverup.com',
        phone: '+34 91 789 0123',
        status: 'active',
        isVerified: true
      }
    })
  ]);
  console.log(`${enterprises.length} empresas creadas\n`);

  // ============================================================
  // RESUMEN FINAL
  // ============================================================
  console.log('========================================');
  console.log('SEED COMPLETADO CON EXITO');
  console.log('========================================');
  console.log(`Categorias de eventos: ${eventCats.length}`);
  console.log(`Categorias de productos: ${prodCats.length}`);
  console.log(`Productos: ${products.length}`);
  console.log(`Eventos: ${events.length}`);
  console.log(`Usuarios: ${users.length}`);
  console.log(`Empresas: ${enterprises.length}`);
  console.log('========================================');
  console.log('\nCredenciales de prueba:');
  console.log('Admin: admin@encore.com / Admin1234!');
  console.log('Usuario: maria.garcia@email.com / Test1234!');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await admin.$disconnect();
    await enterprise.$disconnect();
  });
