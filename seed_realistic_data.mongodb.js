// Script de población de base de datos con datos realistas
// Ejecutar con: mongosh encore < seed_realistic_data.mongodb.js

// Limpiar datos anteriores (opcional - comentar si quieres mantener datos existentes)
// db.events.deleteMany({});
// db.users.deleteMany({ role: 'user', email: { $ne: 'admin@encore.local' } });
// db.comments.deleteMany({});
// db.Product.deleteMany({});

print('📅 Insertando eventos...');

// Eventos musicales realistas
const events = [
    {
        slug: 'coldplay-music-of-spheres-2025',
        title: 'Coldplay - Music of the Spheres World Tour',
        date: new Date('2025-06-15T21:00:00Z'),
        price: 89.50,
        currency: 'EUR',
        location: 'Estadi Olímpic Lluís Companys, Barcelona',
        description: 'Coldplay llega a Barcelona con su espectacular gira Music of the Spheres. Una experiencia única llena de luces, color y los mejores hits de la banda británica.',
        category: ObjectId(),
        status: 'active',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
        favouritesCount: 342,
        images: ['https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800'],
        merchandising: [{ productId: 'prod_001', quantity: 50 }, { productId: 'prod_002', quantity: 30 }],
        comments: [],
        stock: 15000,
        createdAt: new Date('2024-11-01T10:00:00Z'),
        updatedAt: new Date('2024-12-01T14:30:00Z')
    },
    {
        slug: 'rosalia-motomami-tour-madrid',
        title: 'ROSALÍA - MOTOMAMI WORLD TOUR',
        date: new Date('2025-07-20T22:00:00Z'),
        price: 75.00,
        currency: 'EUR',
        location: 'WiZink Center, Madrid',
        description: 'ROSALÍA presenta MOTOMAMI en Madrid. Un espectáculo único que fusiona flamenco, reggaeton y experimentación musical.',
        category: ObjectId(),
        status: 'active',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
        favouritesCount: 567,
        images: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'],
        merchandising: [{ productId: 'prod_004', quantity: 40 }],
        comments: [],
        stock: 12000,
        createdAt: new Date('2024-11-05T09:00:00Z'),
        updatedAt: new Date('2024-12-01T16:20:00Z')
    },
    {
        slug: 'bad-bunny-most-wanted-tour',
        title: 'Bad Bunny - Most Wanted Tour',
        date: new Date('2025-08-10T21:30:00Z'),
        price: 95.00,
        currency: 'EUR',
        location: 'Estadio Santiago Bernabéu, Madrid',
        description: 'Bad Bunny regresa a España con su espectacular Most Wanted Tour. El conejo malo trae todos sus éxitos.',
        category: ObjectId(),
        status: 'active',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        favouritesCount: 892,
        images: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'],
        merchandising: [{ productId: 'prod_001', quantity: 60 }],
        comments: [],
        stock: 80000,
        createdAt: new Date('2024-10-20T08:00:00Z'),
        updatedAt: new Date('2024-12-02T10:15:00Z')
    },
    {
        slug: 'the-weeknd-after-hours-barcelona',
        title: 'The Weeknd - After Hours til Dawn',
        date: new Date('2025-09-05T21:00:00Z'),
        price: 110.00,
        currency: 'EUR',
        location: 'Estadi Olímpic, Barcelona',
        description: 'The Weeknd llega a Barcelona con After Hours til Dawn. Una experiencia audiovisual espectacular.',
        category: ObjectId(),
        status: 'active',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
        favouritesCount: 723,
        images: ['https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'],
        merchandising: [{ productId: 'prod_002', quantity: 45 }],
        comments: [],
        stock: 50000,
        createdAt: new Date('2024-11-10T11:00:00Z'),
        updatedAt: new Date('2024-12-01T18:45:00Z')
    },
    {
        slug: 'dua-lipa-radical-optimism-valencia',
        title: 'Dua Lipa - Radical Optimism Tour',
        date: new Date('2025-06-28T22:00:00Z'),
        price: 68.50,
        currency: 'EUR',
        location: 'Palau de les Arts, Valencia',
        description: 'Dua Lipa presenta Radical Optimism en Valencia. La estrella del pop británica trae su nuevo álbum.',
        category: ObjectId(),
        status: 'active',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800',
        favouritesCount: 456,
        images: ['https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800'],
        merchandising: [{ productId: 'prod_003', quantity: 35 }],
        comments: [],
        stock: 8000,
        createdAt: new Date('2024-11-15T10:30:00Z'),
        updatedAt: new Date('2024-12-01T12:00:00Z')
    },
    {
        slug: 'taylor-swift-eras-tour-barcelona',
        title: 'Taylor Swift - The Eras Tour',
        date: new Date('2025-07-12T20:30:00Z'),
        price: 125.00,
        currency: 'EUR',
        location: 'Camp Nou, Barcelona',
        description: 'Taylor Swift llega a Barcelona con The Eras Tour, el espectáculo más esperado del año.',
        category: ObjectId(),
        status: 'active',
        isActive: true,
        mainImage: 'https://images.unsplash.com/photo-1499415479124-43c32433a620?w=800',
        favouritesCount: 1234,
        images: ['https://images.unsplash.com/photo-1499415479124-43c32433a620?w=800'],
        merchandising: [{ productId: 'prod_001', quantity: 80 }],
        comments: [],
        stock: 99000,
        createdAt: new Date('2024-10-01T07:00:00Z'),
        updatedAt: new Date('2024-12-02T09:30:00Z')
    }
];

const eventIds = db.events.insertMany(events).insertedIds;
print(`✅ ${Object.keys(eventIds).length} eventos insertados`);

print('👥 Insertando usuarios...');

// Usuarios realistas
const users = [
    {
        uid: 'client_maria001',
        slug: 'maria_music_lover',
        username: 'maria_music_lover',
        email: 'maria.garcia@email.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$w3MEKlR4iKVKNlOgIHbWqw$9Ist4XnjzaVNkCk/cemxUexirYgzZnIX',
        bio: '🎵 Amante de la música en vivo | Coleccionista de camisetas de conciertos | Barcelona',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        role: 'user',
        isActive: true,
        status: 'active',
        favouriteEvents: [],
        followingUsers: [],
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-12-01T14:30:00Z')
    },
    {
        uid: 'client_carlos002',
        slug: 'carlos_concerts',
        username: 'carlos_concerts',
        email: 'carlos.martinez@email.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$w3MEKlR4iKVKNlOgIHbWqw$9Ist4XnjzaVNkCk/cemxUexirYgzZnIX',
        bio: 'Ingeniero de día, rockero de noche 🎸 | Madrid | +100 conciertos',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        role: 'user',
        isActive: true,
        status: 'active',
        favouriteEvents: [],
        followingUsers: [],
        createdAt: new Date('2024-02-20T11:30:00Z'),
        updatedAt: new Date('2024-12-01T16:45:00Z')
    },
    {
        uid: 'client_laura003',
        slug: 'laura_indie',
        username: 'laura_indie',
        email: 'laura.fernandez@email.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$w3MEKlR4iKVKNlOgIHbWqw$9Ist4XnjzaVNkCk/cemxUexirYgzZnIX',
        bio: 'Indie music enthusiast 🎧 | Photographer | Valencia vibes',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        role: 'user',
        isActive: true,
        status: 'active',
        favouriteEvents: [],
        followingUsers: [],
        createdAt: new Date('2024-03-10T09:15:00Z'),
        updatedAt: new Date('2024-12-02T08:20:00Z')
    },
    {
        uid: 'client_javier004',
        slug: 'javier_festival_king',
        username: 'javier_festival_king',
        email: 'javier.lopez@email.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$w3MEKlR4iKVKNlOgIHbWqw$9Ist4XnjzaVNkCk/cemxUexirYgzZnIX',
        bio: '🎪 Festival addict | Primavera Sound veteran | Barcelona',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        role: 'user',
        isActive: true,
        status: 'active',
        favouriteEvents: [],
        followingUsers: [],
        createdAt: new Date('2024-04-05T13:00:00Z'),
        updatedAt: new Date('2024-12-01T19:10:00Z')
    },
    {
        uid: 'client_ana005',
        slug: 'ana_pop_queen',
        username: 'ana_pop_queen',
        email: 'ana.rodriguez@email.com',
        password: '$argon2id$v=19$m=65536,t=3,p=4$w3MEKlR4iKVKNlOgIHbWqw$9Ist4XnjzaVNkCk/cemxUexirYgzZnIX',
        bio: 'Pop music is life 💖 | Swiftie forever | Madrid',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        role: 'user',
        isActive: true,
        status: 'active',
        favouriteEvents: [],
        followingUsers: [],
        createdAt: new Date('2024-05-12T15:20:00Z'),
        updatedAt: new Date('2024-12-02T11:00:00Z')
    }
];

const userIds = db.users.insertMany(users).insertedIds;
print(`✅ ${Object.keys(userIds).length} usuarios insertados`);

print('💬 Insertando comentarios...');

// Comentarios realistas
const comments = [
    {
        body: '¡Increíble experiencia! Coldplay nunca decepciona. El show de luces fue espectacular 🌟',
        author: userIds[0],
        evento: eventIds[0],
        createdAt: new Date('2024-11-25T18:30:00Z'),
        updatedAt: new Date('2024-11-25T18:30:00Z')
    },
    {
        body: 'ROSALÍA es arte puro. Su voz en vivo te deja sin palabras 🔥',
        author: userIds[1],
        evento: eventIds[1],
        createdAt: new Date('2024-11-28T20:15:00Z'),
        updatedAt: new Date('2024-11-28T20:15:00Z')
    },
    {
        body: 'Bad Bunny siempre pone el estadio a vibrar. Ya tengo mis entradas! 🐰',
        author: userIds[2],
        evento: eventIds[2],
        createdAt: new Date('2024-12-01T10:00:00Z'),
        updatedAt: new Date('2024-12-01T10:00:00Z')
    },
    {
        body: 'The Weeknd es otro nivel. Vi su tour anterior y fue increíble!',
        author: userIds[3],
        evento: eventIds[3],
        createdAt: new Date('2024-11-30T14:45:00Z'),
        updatedAt: new Date('2024-11-30T14:45:00Z')
    },
    {
        body: 'Dua Lipa tiene una presencia escénica increíble. No os lo perdáis! 💃',
        author: userIds[4],
        evento: eventIds[4],
        createdAt: new Date('2024-12-01T16:20:00Z'),
        updatedAt: new Date('2024-12-01T16:20:00Z')
    },
    {
        body: 'Taylor Swift es la reina absoluta de los conciertos. The Eras Tour es magia ✨',
        author: userIds[0],
        evento: eventIds[5],
        createdAt: new Date('2024-12-02T09:10:00Z'),
        updatedAt: new Date('2024-12-02T09:10:00Z')
    },
    {
        body: '¿Alguien más va al concierto de Coldplay? Me encantaría conocer gente!',
        author: userIds[3],
        evento: eventIds[0],
        createdAt: new Date('2024-11-26T12:00:00Z'),
        updatedAt: new Date('2024-11-26T12:00:00Z')
    },
    {
        body: 'Ya tengo mi camiseta del merchandising de ROSALÍA. La calidad es brutal! 👕',
        author: userIds[2],
        evento: eventIds[1],
        createdAt: new Date('2024-11-29T19:30:00Z'),
        updatedAt: new Date('2024-11-29T19:30:00Z')
    }
];

db.comments.insertMany(comments);
print(`✅ ${comments.length} comentarios insertados`);

print('🛍️ Insertando productos de merchandising...');

// Productos de merchandising
const products = [
    {
        productId: 'prod_001',
        name: 'Camiseta Tour Oficial',
        description: 'Camiseta oficial del tour 2025. Algodón 100%, diseño exclusivo.',
        price: 35.00,
        currency: 'EUR',
        stockTotal: 500,
        stockAvailable: 450,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        productId: 'prod_002',
        name: 'Gorra Bordada',
        description: 'Gorra ajustable con logo bordado. Material de alta calidad.',
        price: 25.00,
        currency: 'EUR',
        stockTotal: 300,
        stockAvailable: 280,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        productId: 'prod_003',
        name: 'Sudadera Oversize',
        description: 'Sudadera oversize con capucha. Diseño exclusivo del tour.',
        price: 55.00,
        currency: 'EUR',
        stockTotal: 200,
        stockAvailable: 175,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        productId: 'prod_004',
        name: 'Tote Bag Canvas',
        description: 'Bolsa de algodón resistente con diseño serigrafiado.',
        price: 18.00,
        currency: 'EUR',
        stockTotal: 400,
        stockAvailable: 390,
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        productId: 'prod_005',
        name: 'Poster Tour 2025',
        description: 'Poster oficial del tour en alta calidad. Tamaño: 50x70cm.',
        price: 12.00,
        currency: 'EUR',
        stockTotal: 600,
        stockAvailable: 550,
        image: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=400',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        productId: 'prod_006',
        name: 'Pulsera de Tela',
        description: 'Pulsera de tela oficial del tour. Colección limitada.',
        price: 8.00,
        currency: 'EUR',
        stockTotal: 1000,
        stockAvailable: 920,
        image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=400',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        productId: 'prod_007',
        name: 'Vinilo Edición Limitada',
        description: 'Vinilo del último álbum en edición limitada.',
        price: 40.00,
        currency: 'EUR',
        stockTotal: 150,
        stockAvailable: 120,
        image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        productId: 'prod_008',
        name: 'Pins Pack Coleccionable',
        description: 'Pack de 5 pins esmaltados con diseños exclusivos.',
        price: 15.00,
        currency: 'EUR',
        stockTotal: 500,
        stockAvailable: 470,
        image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

db.Product.insertMany(products);
print(`✅ ${products.length} productos insertados`);

print('\n🎉 ¡Base de datos poblada con éxito!');
print('📊 Resumen:');
print(`   - ${Object.keys(eventIds).length} eventos de conciertos`);
print(`   - ${Object.keys(userIds).length} usuarios`);
print(`   - ${comments.length} comentarios`);
print(`   - ${products.length} productos de merchandising`);
