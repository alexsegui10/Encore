// Limpiar base de datos encore
db = db.getSiblingDB('encore');
db.dropDatabase();

// Recrear base de datos
db = db.getSiblingDB('encore');

print('=== Insertando Admin ===');
db.Admin.insertOne({
  _id: ObjectId('6904d41d8144fcac0973518b'),
  uid: 'adm_admin001',
  username: 'admin1',
  email: 'admin@encore.com',
  password: '$argon2id$v=19$m=65536,t=3,p=4$lrx37dVF/1ZYjDEbbxbLUQ$TAeSQOveKjRSTpkXHY/LJ2GtFU9jP++yVFV1sZe+/to',
  isActive: true,
  createdAt: ISODate('2025-10-31T15:22:05.855Z'),
  updatedAt: ISODate('2025-11-07T15:22:51.674Z')
});
print('✓ Admin insertado');

print('\n=== Insertando Usuarios ===');
db.users.insertMany([
  {
    _id: ObjectId('66fca0000000000000000001'),
    __v: 0,
    bio: 'Administrador del sistema',
    createdAt: ISODate('2025-10-24T16:20:29.553Z'),
    email: 'admin@encore.local',
    favouriteEvents: [],
    followingUsers: [],
    image: 'https://images.unsplash.com/photo-1531123414780-f742a9dce067',
    password: '$argon2id$v=19$m=65536,t=3,p=4$w3MEKlR4iKVKNlOgIHbWqw$9Ist4XnjzaVNkCk/cemxUexirYgzZnIXA1ph0zxX+tc',
    role: 'admin',
    updatedAt: ISODate('2025-11-06T19:13:06.168Z'),
    username: 'admin',
    uid: 'client_66fca0000000000000000001',
    isActive: true,
    status: 'active',
    slug: 'admin'
  },
  {
    _id: ObjectId('66fca0000000000000000002'),
    __v: 0,
    bio: 'Amante de los conciertos y festivales',
    createdAt: ISODate('2025-10-24T16:20:29.559Z'),
    email: 'cliente1@encore.local',
    favouriteEvents: [],
    followingUsers: [],
    image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12',
    password: '$argon2id$v=19$m=65536,t=3,p=4$owRxrSkKgGp5v2ZEGg3+dg$5rIKZqSWLFxM3ifrfI3vUjQdbG1uWEbqI6A0Rj+HuBw',
    role: 'user',
    updatedAt: ISODate('2025-11-06T19:13:06.168Z'),
    username: 'cliente1',
    uid: 'client_66fca0000000000000000002',
    isActive: true,
    status: 'active',
    slug: 'cliente1'
  },
  {
    _id: ObjectId('66fca0000000000000000003'),
    __v: 0,
    bio: 'Teatro y comedia son mi plan perfecto',
    createdAt: ISODate('2025-10-24T16:20:29.563Z'),
    email: 'cliente2@encore.local',
    favouriteEvents: [],
    followingUsers: [],
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    password: '$argon2id$v=19$m=65536,t=3,p=4$PCtXaPpENI4dTMk42ePDqw$OwVBe79oexvvPLkZ+yTywB+R7pgvRDFMM4usDqlH3X8',
    role: 'user',
    updatedAt: ISODate('2025-11-06T19:13:06.168Z'),
    username: 'cliente2',
    uid: 'client_66fca0000000000000000003',
    isActive: true,
    status: 'active',
    slug: 'cliente2'
  },
  {
    _id: ObjectId('66fca0000000000000000004'),
    __v: 0,
    bio: 'Tech y conferencias',
    createdAt: ISODate('2025-10-24T16:20:29.565Z'),
    email: 'cliente3@encore.local',
    favouriteEvents: [],
    followingUsers: [],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    password: '$argon2id$v=19$m=65536,t=3,p=4$jopqmIUgA7a5F7DsfbiBPg$SJD5Mp6F3Z84zcyN2UUX8y7LpJ3DvgZY2rJ6ULpAUKo',
    role: 'user',
    updatedAt: ISODate('2025-11-06T19:13:06.168Z'),
    username: 'cliente3',
    uid: 'client_66fca0000000000000000004',
    isActive: true,
    status: 'active',
    slug: 'cliente3'
  }
]);
print('✓ ' + db.users.countDocuments() + ' usuarios insertados');

print('\n=== Insertando Categorías ===');
db.categories.insertMany([
  {
    _id: ObjectId('693064f3abac04b90f735189'),
    name: 'Conciertos',
    shortDescription: 'Los mejores artistas en directo. Desde pop hasta rock, vive la música en vivo.',
    description: 'Disfruta de los mejores',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    status: 'active',
    slug: 'conciertos',
    events: [],
    createdAt: ISODate('2025-12-03T16:27:31.415Z'),
    updatedAt: ISODate('2025-12-03T18:16:00.903Z')
  },
  {
    _id: ObjectId('693064f3abac04b90f73518a'),
    name: 'Festivales',
    shortDescription: 'Experiencias musicales únicas. Varios artistas, múltiples escenarios, días de diversión.',
    description: 'Festivales de música ',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    status: 'active',
    slug: 'festivales',
    events: [],
    createdAt: ISODate('2025-12-03T16:27:31.419Z'),
    updatedAt: ISODate('2025-12-03T18:15:47.120Z')
  },
  {
    _id: ObjectId('693064f3abac04b90f73518b'),
    name: 'Deportes',
    shortDescription: 'Emociones al máximo. Fútbol, baloncesto, y más. Vive el deporte en primera persona.',
    description: 'Los mejores eventos ',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    status: 'active',
    slug: 'deportes',
    events: [],
    createdAt: ISODate('2025-12-03T16:27:31.423Z'),
    updatedAt: ISODate('2025-12-03T18:15:39.800Z')
  },
  {
    _id: ObjectId('693064f3abac04b90f73518c'),
    name: 'Teatro',
    shortDescription: 'Obras clásicas y contemporáneas. Drama, comedia y musicales en los mejores teatros.',
    description: 'Teatro de calidad. ',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
    status: 'active',
    slug: 'teatro',
    events: [],
    createdAt: ISODate('2025-12-03T16:27:31.426Z'),
    updatedAt: ISODate('2025-12-03T18:15:32.536Z')
  },
  {
    _id: ObjectId('693064f3abac04b90f73518d'),
    name: 'Comedia',
    shortDescription: 'Risas garantizadas. Los mejores cómicos y humoristas te harán pasar una noche inolvidable.',
    description: 'Stand-up comedy',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80',
    status: 'active',
    slug: 'comedia',
    events: [],
    createdAt: ISODate('2025-12-03T16:27:31.429Z'),
    updatedAt: ISODate('2025-12-03T18:15:26.249Z')
  },
  {
    _id: ObjectId('693064f3abac04b90f73518e'),
    name: 'Cultura',
    shortDescription: 'Exposiciones, charlas y eventos culturales. Descubre el arte y la cultura en vivo.',
    description: 'Eventos culturales',
    image: 'https://cards.algoreducation.com/_next/image?url=https%3A%2F%2Ffiles.algoreducation.com%2Fproduction-ts%2F__S3__35c532d6-678a-40f6-8cb1-1886fc0d30a6&w=3840&q=75',
    status: 'active',
    slug: 'cultura',
    events: [],
    createdAt: ISODate('2025-12-03T16:27:31.432Z'),
    updatedAt: ISODate('2025-12-03T18:15:18.937Z')
  }
]);
print('✓ ' + db.categories.countDocuments() + ' categorías insertadas');

print('\n=== Insertando Eventos ===');
db.events.insertMany([
  {
    _id: ObjectId('693064f3abac04b90f735191'),
    title: 'Coldplay - Music of the Spheres World Tour',
    date: ISODate('2025-06-15T19:00:00.000Z'),
    price: 85,
    currency: 'EUR',
    location: 'Wanda Metropolitano, Madrid',
    description: 'Coldplay regresa a España con su espectacular gira Music of the Spheres. Un show único con los mayores éxitos de la banda británica y su último álbum.',
    category: ObjectId('693064f3abac04b90f735189'),
    slug: 'coldplay-music-of-the-spheres-world-tour-2025-06-15',
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    favouritesCount: 404,
    merchandising: [],
    images: [
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80'
    ],
    comments: [],
    createdAt: ISODate('2025-12-03T16:27:31.454Z'),
    updatedAt: ISODate('2025-12-03T16:27:31.454Z')
  },
  {
    _id: ObjectId('693064f3abac04b90f735192'),
    title: 'ROSALÍA - MOTOMAMI WORLD TOUR',
    date: ISODate('2025-07-20T20:00:00.000Z'),
    price: 65,
    currency: 'EUR',
    location: 'Palau Sant Jordi, Barcelona',
    description: 'ROSALÍA presenta MOTOMAMI en Barcelona. La artista catalana revoluciona el panorama musical con su propuesta más experimental y vanguardista.',
    category: ObjectId('693064f3abac04b90f735189'),
    slug: 'rosalia-motomami-world-tour-2025-07-20',
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
    favouritesCount: 278,
    merchandising: [],
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80'
    ],
    comments: [],
    createdAt: ISODate('2025-12-03T16:27:31.459Z'),
    updatedAt: ISODate('2025-12-03T16:27:31.459Z')
  },
  {
    _id: ObjectId('693064f3abac04b90f735193'),
    title: 'Bad Bunny - Most Wanted Tour',
    date: ISODate('2025-08-10T18:00:00.000Z'),
    price: 95,
    currency: 'EUR',
    location: 'Estadio Santiago Bernabéu, Madrid',
    description: 'Bad Bunny llega a Madrid con su gira Most Wanted Tour. El rey del reggaetón presenta sus mayores éxitos en un show espectacular.',
    category: ObjectId('693064f3abac04b90f73518a'),
    slug: 'bad-bunny-most-wanted-tour-2025-08-10',
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=1200&q=80',
    favouritesCount: 376,
    merchandising: [],
    images: [
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=1200&q=80'
    ],
    comments: [],
    createdAt: ISODate('2025-12-03T16:27:31.464Z'),
    updatedAt: ISODate('2025-12-03T16:27:31.464Z')
  }
]);
print('✓ ' + db.events.countDocuments() + ' eventos insertados');

print('\n=== Insertando Productos ===');
db.products.insertMany([
  {
    _id: ObjectId('69306553263325e4b4735189'),
    name: 'Camiseta Tour Oficial',
    description: 'Camiseta oficial de algodón 100% con diseño exclusivo del tour',
    price: 35,
    currency: 'EUR',
    stockTotal: 500,
    stockAvailable: 450,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
    status: 'active',
    categoryId: null,
    createdAt: ISODate('2025-12-03T16:29:07.210Z'),
    updatedAt: ISODate('2025-12-03T16:29:07.210Z')
  },
  {
    _id: ObjectId('69306553263325e4b473518a'),
    name: 'Gorra Bordada',
    description: 'Gorra ajustable con logo bordado de alta calidad',
    price: 25,
    currency: 'EUR',
    stockTotal: 300,
    stockAvailable: 275,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80',
    status: 'active',
    categoryId: null,
    createdAt: ISODate('2025-12-03T16:29:07.241Z'),
    updatedAt: ISODate('2025-12-03T16:29:07.241Z')
  },
  {
    _id: ObjectId('69306553263325e4b473518e'),
    name: 'Pulsera de Tela',
    description: 'Pulsera oficial de tela con cierre de seguridad',
    price: 8,
    currency: 'EUR',
    stockTotal: 800,
    stockAvailable: 750,
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=500&q=80',
    status: 'active',
    categoryId: null,
    createdAt: ISODate('2025-12-03T16:29:07.261Z'),
    updatedAt: ISODate('2025-12-03T16:29:07.261Z')
  }
]);
print('✓ ' + db.products.countDocuments() + ' productos insertados');

print('\n=== RESUMEN FINAL ===');
print('Admin: ' + db.Admin.countDocuments());
print('Usuarios: ' + db.users.countDocuments());
print('Categorías: ' + db.categories.countDocuments());
print('Eventos: ' + db.events.countDocuments());
print('Productos: ' + db.products.countDocuments());
print('\n✅ Importación completada exitosamente!');
