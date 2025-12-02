// seed-admin.js - Script para poblar la BD del admin_server (MongoDB)
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log(' Iniciando seed del Admin Server...\n');

  console.log('  Limpiando datos existentes...');
  await prisma.ticket.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.events.deleteMany();
  await prisma.categories.deleteMany();
  await prisma.users.deleteMany();
  await prisma.admin.deleteMany();
  console.log(' Datos limpiados\n');

  console.log(' Creando usuario admin...');
  const hashedPassword = await argon2.hash('admin123');
  const admin = await prisma.admin.create({
    data: {
      uid: 'admin_001',
      username: 'admin',
      email: 'admin@encore.com',
      password: hashedPassword,
      isActive: true
    }
  });
  console.log(` Admin creado: ${admin.email}\n`);

  console.log(' Creando usuarios de prueba...');
  const userPassword = await argon2.hash('password123');

  const user1 = await prisma.users.create({
    data: {
      uid: 'usr_001',
      slug: 'john-doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: userPassword,
      bio: 'Usuario de prueba 1',
      image: 'https://api.dicebear.com/7.x/identicon/svg?seed=john',
      isActive: true,
      status: 'active',
      role: 'client'
    }
  });

  const user2 = await prisma.users.create({
    data: {
      uid: 'usr_002',
      slug: 'jane-smith',
      username: 'janesmith',
      email: 'jane@example.com',
      password: userPassword,
      bio: 'Usuario de prueba 2',
      image: 'https://api.dicebear.com/7.x/identicon/svg?seed=jane',
      isActive: true,
      status: 'active',
      role: 'client'
    }
  });

  console.log(` Usuarios creados: ${user1.email}, ${user2.email}\n`);

  console.log('  Creando categorías...');
  const categories = await Promise.all([
    prisma.categories.create({
      data: {
        name: 'Conciertos',
        slug: 'conciertos',
        description: 'Grandes conciertos y giras',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
        isActive: true,
        status: 'active'
      }
    }),
    prisma.categories.create({
      data: {
        name: 'Festivales',
        slug: 'festivales',
        description: 'Festivales de música',
        image: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf',
        isActive: true,
        status: 'active'
      }
    }),
    prisma.categories.create({
      data: {
        name: 'Teatro',
        slug: 'teatro',
        description: 'Obras, musicales y clásicos',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
        isActive: true,
        status: 'active'
      }
    }),
    prisma.categories.create({
      data: {
        name: 'Deportes',
        slug: 'deportes',
        description: 'Partidos y grandes eventos deportivos',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
        isActive: true,
        status: 'active'
      }
    })
  ]);
  console.log(` ${categories.length} categorías creadas\n`);

  // 4. Crear eventos con STOCK
  console.log(' Creando eventos con stock...');
  const events = await Promise.all([
    prisma.events.create({
      data: {
        slug: 'hans-zimmer-valencia',
        title: 'Hans Zimmer — Valencia',
        date: new Date('2026-03-26T20:30:00.000Z'),
        price: 85,
        currency: 'EUR',
        location: 'Roig Arena, Valencia',
        description: 'El compositor Hans Zimmer presenta su tour "The Next Level" con banda completa en Valencia.',
        category: categories[0].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063',
        images: [
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'
        ],
        stock: 500,
        favouritesCount: 0
      }
    }),
    prisma.events.create({
      data: {
        slug: 'eric-clapton-madrid',
        title: 'Eric Clapton — Madrid',
        date: new Date('2026-05-07T21:00:00.000Z'),
        price: 110,
        currency: 'EUR',
        location: 'Movistar Arena, Madrid',
        description: 'El legendario guitarrista Eric Clapton regresa a Madrid dentro de su gira europea de 2026.',
        category: categories[0].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1',
        images: [
          'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc',
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4'
        ],
        stock: 300,
        favouritesCount: 0
      }
    }),
    prisma.events.create({
      data: {
        slug: 'tame-impala-barcelona',
        title: 'Tame Impala — Barcelona',
        date: new Date('2026-04-08T21:00:00.000Z'),
        price: 65,
        currency: 'EUR',
        location: 'Palau Sant Jordi, Barcelona',
        description: 'La banda australiana Tame Impala recala en Barcelona con su inconfundible sonido psicodélico.',
        category: categories[0].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044',
        images: [
          'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'
        ],
        stock: 100,
        favouritesCount: 0
      }
    }),
    prisma.events.create({
      data: {
        slug: 'primavera-sound-2026',
        title: 'Primavera Sound 2026',
        date: new Date('2026-06-04T17:00:00.000Z'),
        price: 280,
        currency: 'EUR',
        location: 'Parc del Fòrum, Barcelona',
        description: 'El festival más esperado del año con más de 200 artistas internacionales.',
        category: categories[1].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf',
        images: [
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
          'https://images.unsplash.com/photo-1506157786151-b8491531f063'
        ],
        stock: 1000,
        favouritesCount: 0
      }
    }),
    prisma.events.create({
      data: {
        slug: 'rey-leon-madrid',
        title: 'El Rey León — Madrid',
        date: new Date('2026-02-15T20:00:00.000Z'),
        price: 90,
        currency: 'EUR',
        location: 'Teatro Lope de Vega, Madrid',
        description: 'El musical más exitoso de la historia regresa a Madrid.',
        category: categories[2].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
        images: [],
        stock: null,
        favouritesCount: 0
      }
    }),
    prisma.events.create({
      data: {
        slug: 'real-madrid-barcelona',
        title: 'Real Madrid vs Barcelona',
        date: new Date('2026-04-20T21:00:00.000Z'),
        price: 150,
        currency: 'EUR',
        location: 'Santiago Bernabéu, Madrid',
        description: 'El clásico español en el Bernabéu.',
        category: categories[3].id,
        status: 'published',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
        images: [],
        stock: 50,
        favouritesCount: 0
      }
    })
  ]);
  console.log(` ${events.length} eventos creados con stock\n`);

  // 5. Crear productos de merchandising (opcional)
  console.log('🛍️  Creando productos...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Camiseta Hans Zimmer',
        description: 'Camiseta oficial del tour',
        price: 25,
        currency: 'EUR',
        stockTotal: 200,
        stockAvailable: 200,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'Poster Primavera Sound',
        description: 'Poster oficial del festival',
        price: 15,
        currency: 'EUR',
        stockTotal: 500,
        stockAvailable: 500,
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7',
        isActive: true
      }
    })
  ]);
  console.log(`✅ ${products.length} productos creados\n`);

  console.log('🎉 ¡Seed completado exitosamente!');
  console.log('\n📋 Resumen:');
  console.log(`   - ${1} Admin creado`);
  console.log(`   - ${2} Usuarios creados`);
  console.log(`   - ${categories.length} Categorías creadas`);
  console.log(`   - ${events.length} Eventos creados`);
  console.log(`   - ${products.length} Productos creados`);
  console.log('\n🔑 Credenciales de prueba:');
  console.log('   Admin: admin@encore.com / admin123');
  console.log('   Usuario: john@example.com / password123');
  console.log('   Usuario: jane@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
