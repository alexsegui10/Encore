// seed.js - Script para poblar MongoDB compartida
import 'dotenv/config';
import { PrismaClient as PrismaAdmin } from '@prisma/client';
import { PrismaClient as PrismaEnterprise } from '../enterprise_server/microservices/product-service/node_modules/.prisma/client/index.js';

const admin = new PrismaAdmin();
const enterprise = new PrismaEnterprise();

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

async function main() {
  console.log('🚀 Iniciando seed...\n');

  console.log('🧹 Limpiando datos...');
  await admin.ticket.deleteMany();
  await admin.payment.deleteMany();
  await admin.orderItem.deleteMany();
  await admin.order.deleteMany();
  await admin.events.deleteMany();
  await admin.categories.deleteMany();
  await enterprise.product.deleteMany();
  await enterprise.productCategory.deleteMany();
  console.log('✅ Limpiado\n');

  // 1. CATEGORÍAS DE EVENTOS
  console.log('📁 Categorías de eventos...');
  const eventCats = await Promise.all([
    admin.categories.create({
      data: {
        name: 'Conciertos',
        slug: 'conciertos',
        description: 'Grandes conciertos y giras',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
        isActive: true,
        status: 'active'
      }
    }),
    admin.categories.create({
      data: {
        name: 'Festivales',
        slug: 'festivales',
        description: 'Festivales de música',
        image: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf',
        isActive: true,
        status: 'active'
      }
    }),
    admin.categories.create({
      data: {
        name: 'Teatro',
        slug: 'teatro',
        description: 'Obras y musicales',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
        isActive: true,
        status: 'active'
      }
    }),
    admin.categories.create({
      data: {
        name: 'Deportes',
        slug: 'deportes',
        description: 'Eventos deportivos',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
        isActive: true,
        status: 'active'
      }
    })
  ]);
  console.log(`✅ ${eventCats.length} categorías de eventos\n`);

  // 2. CATEGORÍAS DE PRODUCTOS
  console.log('📦 Categorías de productos...');
  const prodCats = await Promise.all([
    enterprise.productCategory.create({
      data: {
        name: 'Ropa',
        description: 'Camisetas, sudaderas y gorras',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        isActive: true
      }
    }),
    enterprise.productCategory.create({
      data: {
        name: 'Accesorios',
        description: 'Bolsas, pulseras y llaveros',
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b',
        isActive: true
      }
    }),
    enterprise.productCategory.create({
      data: {
        name: 'Coleccionables',
        description: 'Posters, vinilos y pins',
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7',
        isActive: true
      }
    })
  ]);
  console.log(`✅ ${prodCats.length} categorías de productos\n`);

  // 3. PRODUCTOS
  console.log('🛍️  Productos...');
  const products = await Promise.all([
    // Ropa
    enterprise.product.create({
      data: {
        name: 'Camiseta Negra Encore',
        description: 'Camiseta 100% algodón con logo',
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
        name: 'Sudadera Gris',
        description: 'Sudadera con capucha premium',
        price: 45,
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
        name: 'Gorra Snapback',
        description: 'Gorra ajustable con bordado',
        price: 20,
        currency: 'EUR',
        stockTotal: 400,
        stockAvailable: 400,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b',
        status: 'active',
        categoryId: prodCats[0].id
      }
    }),
    // Accesorios
    enterprise.product.create({
      data: {
        name: 'Tote Bag Ecológica',
        description: 'Bolsa de algodón orgánico',
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
        description: 'Pulsera LED recargable',
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
        name: 'Llavero Metálico',
        description: 'Llavero con logo grabado',
        price: 8,
        currency: 'EUR',
        stockTotal: 800,
        stockAvailable: 800,
        image: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e',
        status: 'active',
        categoryId: prodCats[1].id
      }
    }),
    // Coleccionables
    enterprise.product.create({
      data: {
        name: 'Poster Oficial',
        description: 'Poster 50x70cm papel premium',
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
        name: 'Vinilo Edición Especial',
        description: 'Vinilo coloreado edición limitada',
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
        name: 'Set de Pins',
        description: 'Set de 5 pins esmaltados',
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
        name: 'Mochila Premium',
        description: 'Mochila de alta calidad',
        price: 40,
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
        name: 'Camiseta Blanca Premium',
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
    })
  ]);
  console.log(`✅ ${products.length} productos\n`);

  // 4. EVENTOS
  console.log('🎵 Eventos...');
  const events = await Promise.all([
    admin.events.create({
      data: {
        slug: 'hans-zimmer-valencia',
        title: 'Hans Zimmer — Valencia',
        date: new Date('2026-03-26T20:30:00.000Z'),
        price: 85,
        currency: 'EUR',
        location: 'Roig Arena, Valencia',
        description: 'El compositor Hans Zimmer presenta su tour "The Next Level".',
        category: eventCats[0].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063',
        images: [],
        stock: 500,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 3)
      }
    }),
    admin.events.create({
      data: {
        slug: 'eric-clapton-madrid',
        title: 'Eric Clapton — Madrid',
        date: new Date('2026-05-07T21:00:00.000Z'),
        price: 110,
        currency: 'EUR',
        location: 'Movistar Arena, Madrid',
        description: 'El legendario guitarrista Eric Clapton en Madrid.',
        category: eventCats[0].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1',
        images: [],
        stock: 300,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 4)
      }
    }),
    admin.events.create({
      data: {
        slug: 'tame-impala-barcelona',
        title: 'Tame Impala — Barcelona',
        date: new Date('2026-04-08T21:00:00.000Z'),
        price: 65,
        currency: 'EUR',
        location: 'Palau Sant Jordi, Barcelona',
        description: 'Tame Impala en Barcelona con su sonido psicodélico.',
        category: eventCats[0].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044',
        images: [],
        stock: 100,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 2)
      }
    }),
    admin.events.create({
      data: {
        slug: 'primavera-sound-2026',
        title: 'Primavera Sound 2026',
        date: new Date('2026-06-04T17:00:00.000Z'),
        price: 280,
        currency: 'EUR',
        location: 'Parc del Fòrum, Barcelona',
        description: 'El festival más esperado con 200+ artistas.',
        category: eventCats[1].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf',
        images: [],
        stock: 1000,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 5)
      }
    }),
    admin.events.create({
      data: {
        slug: 'rey-leon-madrid',
        title: 'El Rey León — Madrid',
        date: new Date('2026-02-15T20:00:00.000Z'),
        price: 90,
        currency: 'EUR',
        location: 'Teatro Lope de Vega, Madrid',
        description: 'El musical más exitoso regresa a Madrid.',
        category: eventCats[2].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
        images: [],
        stock: null,
        favouritesCount: 0,
        merchandising: []
      }
    }),
    admin.events.create({
      data: {
        slug: 'real-madrid-barcelona',
        title: 'Real Madrid vs Barcelona',
        date: new Date('2026-04-20T21:00:00.000Z'),
        price: 150,
        currency: 'EUR',
        location: 'Santiago Bernabéu, Madrid',
        description: 'El clásico español.',
        category: eventCats[3].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
        images: [],
        stock: 50,
        favouritesCount: 0,
        merchandising: getRandomProducts(products, 3)
      }
    })
  ]);
  console.log(`✅ ${events.length} eventos\n`);

  console.log('🎉 Seed completado!');
  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ ${eventCats.length} categorías de eventos`);
  console.log(`   ✅ ${prodCats.length} categorías de productos`);
  console.log(`   ✅ ${products.length} productos`);
  console.log(`   ✅ ${events.length} eventos\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await admin.$disconnect();
    await enterprise.$disconnect();
  });
