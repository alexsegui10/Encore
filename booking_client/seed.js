// seed.js — ejecuta: npm run seed  (en package.json: "seed": "node seed.js")
import 'dotenv/config.js';
import mongoose from 'mongoose';

// Modelos (solo Categoría y Evento)
import Event from './app/models/evento.model.js';
import Category from './app/models/category.model.js';

const OID = (s) => new mongoose.Types.ObjectId(s);

// ==========================
// 1) DATOS (solo categorías y eventos)
// ==========================

// Categorías (añadiremos luego category.events: ObjectId[])
const categories = [
  { _id: OID('66fca0010000000000000001'), name: 'Conciertos',   slug: 'conciertos',   description: 'Grandes conciertos y giras',                  image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4' },
  { _id: OID('66fca0010000000000000002'), name: 'Festivales',   slug: 'festivales',  description: 'Festivales de música',                       image: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf' },
  { _id: OID('66fca0010000000000000003'), name: 'Teatro',       slug: 'teatro',      description: 'Obras, musicales y clásicos',                image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee' },
  { _id: OID('66fca0010000000000000004'), name: 'Deportes',     slug: 'deportes',    description: 'Partidos y grandes eventos deportivos',      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211' },
  { _id: OID('66fca0010000000000000005'), name: 'Conferencias', slug: 'conferencias',description: 'Tecnología, negocios y tendencias',          image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c' },
  { _id: OID('66fca0010000000000000006'), name: 'Comedia',      slug: 'comedia',     description: 'Monólogos y shows de humor',                 image: 'https://images.unsplash.com/photo-1519844527959-7f3a1a3c6d57' },
  { _id: OID('66fca0010000000000000007'), name: 'Familia',      slug: 'familia',     description: 'Planes familiares y para peques',            image: 'https://images.unsplash.com/photo-1517341721142-35a7d495bd4c' },
  { _id: OID('66fca0010000000000000008'), name: 'Electrónica',  slug: 'electronica', description: 'Raves y música electrónica',                 image: 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229' },
  { _id: OID('66fca0010000000000000009'), name: 'Cine',         slug: 'cine',        description: 'Estrenos, maratones y preestrenos',          image: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66' },
  { _id: OID('66fca001000000000000000a'), name: 'Arte',         slug: 'arte',        description: 'Museos y exposiciones',                      image: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe' }
];

// Eventos (distribuidos por categorías) — fotos reales (Unsplash)
const events = [
  // Conciertos – cada uno con varias fotos genéricas de conciertos
  {
    _id: OID('66fca0020000000000000001'),
    title: 'Hans Zimmer — Valencia',
    date: new Date('2026-03-26T20:30:00.000Z'),
    price: 85, currency: 'EUR',
    location: 'Roig Arena, Valencia',
    description: 'El compositor Hans Zimmer presenta su tour “The Next Level” con banda completa en Valencia:contentReference[oaicite:0]{index=0}.',
    category: OID('66fca0010000000000000001'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063',
    images: [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'
    ],
    slug: 'hans-zimmer-valencia-2026-03-26',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000002'),
    title: 'Eric Clapton — Madrid',
    date: new Date('2026-05-07T21:00:00.000Z'),
    price: 110, currency: 'EUR',
    location: 'Movistar Arena, Madrid',
    description: 'El legendario guitarrista Eric Clapton regresa a Madrid dentro de su gira europea de 2026:contentReference[oaicite:1]{index=1}.',
    category: OID('66fca0010000000000000001'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1',
    images: [
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4'
    ],
    slug: 'eric-clapton-madrid-2026-05-07',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000003'),
    title: 'Tame Impala — Barcelona',
    date: new Date('2026-04-08T21:00:00.000Z'),
    price: 65, currency: 'EUR',
    location: 'Palau Sant Jordi, Barcelona',
    description: 'La banda australiana Tame Impala recala en Barcelona con su inconfundible sonido psicodélico:contentReference[oaicite:2]{index=2}.',
    category: OID('66fca0010000000000000001'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044',
    images: [
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'
    ],
    slug: 'tame-impala-barcelona-2026-04-08',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000004'),
    title: 'TWICE — Barcelona',
    date: new Date('2026-05-10T20:00:00.000Z'),
    price: 70, currency: 'EUR',
    location: 'Palau Sant Jordi, Barcelona',
    description: 'El grupo de K‑pop TWICE actuará en Barcelona para celebrar su nueva gira mundial:contentReference[oaicite:3]{index=3}.',
    category: OID('66fca0010000000000000001'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd53',
    images: [
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14',
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc'
    ],
    slug: 'twice-barcelona-2026-05-10',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000005'),
    title: 'Hans Zimmer — Madrid',
    date: new Date('2026-03-29T20:30:00.000Z'),
    price: 90, currency: 'EUR',
    location: 'WiZink Center, Madrid',
    description: 'Hans Zimmer despide su gira en Madrid con un espectacular show en directo:contentReference[oaicite:4]{index=4}.',
    category: OID('66fca0010000000000000001'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
    images: [
      'https://images.unsplash.com/photo-1499364615650-ec38552f4f34',
      'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1'
    ],
    slug: 'hans-zimmer-madrid-2026-03-29',
    favouritesCount: 0
  },

  // Festivales / Electrónica – varias fotos de festivales
  {
    _id: OID('66fca0020000000000000006'),
    title: 'Primavera Sound — Barcelona',
    date: new Date('2026-06-04T17:00:00.000Z'),
    price: 195, currency: 'EUR',
    location: 'Parc del Fòrum, Barcelona',
    description: 'El festival abarcará del 3 al 7 de junio de 2026, con las jornadas principales del 4 al 6:contentReference[oaicite:5]{index=5}.',
    category: OID('66fca0010000000000000002'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81c',
    images: [
      'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf',
      'https://images.unsplash.com/photo-1521335629791-ce4aec67dd53'
    ],
    slug: 'primavera-sound-barcelona-2026-06-04',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000007'),
    title: 'Mad Cool — Madrid',
    date: new Date('2026-07-08T17:00:00.000Z'),
    price: 180, currency: 'EUR',
    location: 'Iberdrola Music, Villaverde, Madrid',
    description: 'Mad Cool 2026 se celebrará del 8 al 11 de julio con un cartel repleto de artistas estelares:contentReference[oaicite:6]{index=6}.',
    category: OID('66fca0010000000000000002'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf',
    images: [
      'https://images.unsplash.com/photo-1521335629791-ce4aec67dd53',
      'https://images.unsplash.com/photo-1464375117522-1311d6a5b81c'
    ],
    slug: 'mad-cool-madrid-2026-07-08',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000008'),
    title: 'Arenal Sound — Burriana',
    date: new Date('2026-07-30T18:00:00.000Z'),
    price: 65, currency: 'EUR',
    location: 'Playa El Arenal, Burriana',
    description: 'Festival a orillas de la playa con un cartel variado que durará hasta el 2 de agosto:contentReference[oaicite:7]{index=7}.',
    category: OID('66fca0010000000000000008'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229',
    images: [
      'https://images.unsplash.com/photo-1487180144351-b8472da7d491',
      'https://images.unsplash.com/photo-1464375117522-1311d6a5b81c'
    ],
    slug: 'arenal-sound-burriana-2026-07-30',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000009'),
    title: 'Reggaeton Beach Festival — Barcelona',
    date: new Date('2026-06-27T18:00:00.000Z'),
    price: 55, currency: 'EUR',
    location: 'Platja del Fòrum, Barcelona',
    description: 'El RBF tendrá dos días de fiesta urbana frente al mar los días 27 y 28 de junio:contentReference[oaicite:8]{index=8}.',
    category: OID('66fca0010000000000000008'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229',
    images: [
      'https://images.unsplash.com/photo-1464375117522-1311d6a5b81c',
      'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf'
    ],
    slug: 'rbf-barcelona-2026-06-27',
    favouritesCount: 0
  },

  // Teatro / Musicales – descripciones uniformes y varias fotos
  {
    _id: OID('66fca002000000000000000a'),
    title: 'El Rey León — Madrid',
    date: new Date('2026-01-15T19:30:00.000Z'),
    price: 65, currency: 'EUR',
    location: 'Teatro Lope de Vega, Madrid',
    description: 'Musical familiar de gran éxito que sigue en cartel hasta febrero de 2026:contentReference[oaicite:9]{index=9}.',
    category: OID('66fca0010000000000000003'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    images: [
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee'
    ],
    slug: 'el-rey-leon-madrid-2026-01-15',
    favouritesCount: 0
  },
  {
    _id: OID('66fca002000000000000000b'),
    title: 'Mamma Mia! — Alicante',
    date: new Date('2026-01-22T19:30:00.000Z'),
    price: 28, currency: 'EUR',
    location: 'Teatro Principal, Alicante',
    description: 'El musical con canciones de ABBA se representa en Alicante del 22 de enero al 8 de febrero:contentReference[oaicite:10]{index=10}.',
    category: OID('66fca0010000000000000003'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    images: [
      'https://images.unsplash.com/photo-1515165562835-c3b8c8d966cc',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26'
    ],
    slug: 'mamma-mia-alicante-2026-01-22',
    favouritesCount: 0
  },

  // Deportes – varias fotos deportivas y descripciones coherentes
  {
    _id: OID('66fca002000000000000000c'),
    title: 'UFC 324: Ilia Topuria vs Justin Gaethje',
    date: new Date('2026-01-24T19:00:00.000Z'),
    price: 210, currency: 'EUR',
    location: 'T‑Mobile Arena, Las Vegas',
    description: 'El evento de artes marciales mixtas UFC 324 tendrá como atractivo principal al español Ilia Topuria:contentReference[oaicite:11]{index=11}.',
    category: OID('66fca0010000000000000004'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
    images: [
      'https://images.unsplash.com/photo-1518611012118-f0c5d859f8d8',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'
    ],
    slug: 'topuria-gaethje-ufc-324-2026-01-24',
    favouritesCount: 0
  },
  {
    _id: OID('66fca002000000000000000d'),
    title: 'FC Barcelona vs Real Madrid',
    date: new Date('2026-05-09T18:00:00.000Z'),
    price: 140, currency: 'EUR',
    location: 'Estadi Olímpic Lluís Companys, Barcelona',
    description: 'El Clásico de LaLiga se disputará en el Estadi Olímpic el 9 de mayo de 2026:contentReference[oaicite:12]{index=12}.',
    category: OID('66fca0010000000000000004'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    images: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b'
    ],
    slug: 'clasico-barcelona-real-madrid-2026-05-09',
    favouritesCount: 0
  },
  {
    _id: OID('66fca002000000000000000e'),
    title: 'Barcelona Open Banc Sabadell',
    date: new Date('2026-04-11T13:00:00.000Z'),
    price: 70, currency: 'EUR',
    location: 'Real Club de Tenis Barcelona‑1899',
    description: 'El torneo de tenis ATP 500 se celebra del 11 al 19 de abril con la participación de estrellas como Carlos Alcaraz:contentReference[oaicite:13]{index=13}.',
    category: OID('66fca0010000000000000004'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1518611012118-f0c5d859f8d8',
    images: [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a'
    ],
    slug: 'barcelona-open-2026-04-11',
    favouritesCount: 0
  },

  // Conferencias / Tech – imágenes de conferencias
  {
    _id: OID('66fca002000000000000000f'),
    title: 'Mobile World Congress — Barcelona',
    date: new Date('2026-03-02T09:00:00.000Z'),
    price: 799, currency: 'EUR',
    location: 'Fira Gran Via, Barcelona',
    description: 'MWC Barcelona 2026, el mayor evento del sector móvil, tendrá lugar del 2 al 5 de marzo:contentReference[oaicite:14]{index=14}.',
    category: OID('66fca0010000000000000005'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    images: [
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
    ],
    slug: 'mwc-barcelona-2026-03-02',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000010'),
    title: 'OpenExpo Europe — Madrid',
    date: new Date('2026-03-25T09:30:00.000Z'),
    price: 45, currency: 'EUR',
    location: 'IFEMA, Madrid',
    description: 'La feria OpenExpo Europe 2026 se enfocará en open source y transformación digital del 25 al 27 de marzo:contentReference[oaicite:15]{index=15}.',
    category: OID('66fca0010000000000000005'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    images: [
      'https://images.unsplash.com/photo-1551836022-4c4c79ecde51',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
    ],
    slug: 'openexpo-europe-madrid-2026-03-25',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000011'),
    title: 'DigiMarCon Spain — Barcelona',
    date: new Date('2026-09-07T09:00:00.000Z'),
    price: 120, currency: 'EUR',
    location: 'Hotel W Barcelona, Barcelona',
    description: 'Conferencia dedicada al marketing digital, medios y publicidad los días 7 y 8 de septiembre:contentReference[oaicite:16]{index=16}:contentReference[oaicite:17]{index=17}.',
    category: OID('66fca0010000000000000005'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a'
    ],
    slug: 'digimarcon-barcelona-2026-09-07',
    favouritesCount: 0
  },

  // Comedia – varias imágenes y descripciones de longitud similar
  {
    _id: OID('66fca0020000000000000012'),
    title: 'Goyo Jiménez — Misery Class',
    date: new Date('2026-02-07T20:00:00.000Z'),
    price: 28, currency: 'EUR',
    location: 'Teatro Capitol Gran Vía, Madrid',
    description: 'Monólogo satírico y desternillante de Goyo Jiménez con funciones hasta el 1 de marzo:contentReference[oaicite:18]{index=18}.',
    category: OID('66fca0010000000000000006'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1519844527959-7f3a1a3c6d57',
    images: [
      'https://images.unsplash.com/photo-1525182008055-f88b95ff7980',
      'https://images.unsplash.com/photo-1519844527959-7f3a1a3c6d57'
    ],
    slug: 'goyo-jimenez-madrid-2026-02-07',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000013'),
    title: 'Hora Treintaypico — Madrid',
    date: new Date('2026-03-15T20:30:00.000Z'),
    price: 30, currency: 'EUR',
    location: 'Teatro La Latina, Madrid',
    description: 'Versión en directo del programa de humor Hora Veintipico, recomendada para mayores de 16 años:contentReference[oaicite:19]{index=19}:contentReference[oaicite:20]{index=20}.',
    category: OID('66fca0010000000000000006'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1519844527959-7f3a1a3c6d57',
    images: [
      'https://images.unsplash.com/photo-1519844527959-7f3a1a3c6d57',
      'https://images.unsplash.com/photo-1525182008055-f88b95ff7980'
    ],
    slug: 'hora-treintaypico-madrid-2026-03-15',
    favouritesCount: 0
  },

  // Familia – imágenes temáticas sobre hielo
  {
    _id: OID('66fca0020000000000000014'),
    title: 'Disney On Ice — Valencia',
    date: new Date('2026-02-05T17:00:00.000Z'),
    price: 35, currency: 'EUR',
    location: 'ROIG Arena, Valencia',
    description: 'Espectáculo sobre hielo “Into the Magic” que visitará Valencia del 5 al 8 de febrero:contentReference[oaicite:21]{index=21}.',
    category: OID('66fca0010000000000000007'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1517341721142-35a7d495bd4c',
    images: [
      'https://images.unsplash.com/photo-1517341721142-35a7d495bd4c',
      'https://images.unsplash.com/photo-1517341721142-35a7d495bd4c'
    ],
    slug: 'disney-on-ice-valencia-2026-02-05',
    favouritesCount: 0
  },

  // Cine – imágenes de festivales de cine
  {
    _id: OID('66fca0020000000000000015'),
    title: 'Festival de Sitges — Sitges',
    date: new Date('2026-10-08T18:00:00.000Z'),
    price: 22, currency: 'EUR',
    location: 'Auditori Melià Sitges, Sitges',
    description: 'El Festival Internacional de Cinema Fantàstic de Catalunya se desarrollará del 8 al 18 de octubre:contentReference[oaicite:22]{index=22}.',
    category: OID('66fca0010000000000000009'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66',
    images: [
      'https://images.unsplash.com/photo-1517602302552-471fe67acf66',
      'https://images.unsplash.com/photo-1517602302552-471fe67acf66'
    ],
    slug: 'festival-sitges-2026-10-08',
    favouritesCount: 0
  },

  // Arte – imágenes de exposiciones de arte
  {
    _id: OID('66fca0020000000000000016'),
    title: 'ARCOmadrid — Madrid',
    date: new Date('2026-03-04T10:00:00.000Z'),
    price: 10, currency: 'EUR',
    location: 'IFEMA Madrid, Madrid',
    description: 'La feria de arte contemporáneo ARCOmadrid 2026 abrirá sus puertas del 4 al 8 de marzo.',
    category: OID('66fca001000000000000000a'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe',
    images: [
      'https://images.unsplash.com/photo-1529101091764-c3526daf38fe',
      'https://images.unsplash.com/photo-1529101091764-c3526daf38fe'
    ],
    slug: 'arco-madrid-2026-03-04',
    favouritesCount: 0
  }
];


// ==========================
// 2) HELPERS
// ==========================
const upsertOps = (docs) =>
  docs.map((d) => ({
    updateOne: { filter: { _id: d._id }, update: { $set: d }, upsert: true }
  }));

function attachEventIdsToCategories() {
  // construye el array de ObjectId de eventos por categoría
  const map = new Map();
  for (const c of categories) map.set(String(c._id), []);
  for (const ev of events) {
    const arr = map.get(String(ev.category)) || [];
    arr.push(ev._id);
    map.set(String(ev.category), arr);
  }
  // añade "events" (ObjectId[]) a cada categoría localmente
  for (const c of categories) {
    c.events = map.get(String(c._id)) || [];
  }
}

// ==========================
/* 3) SEED (solo categorías y eventos) */
// ==========================
async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/encore';
  console.log('Conectando a MongoDB:', uri);
  await mongoose.connect(uri, { autoIndex: true });
  console.log('Conectado');

  // Rellenar categories.events con IDs de los eventos
  attachEventIdsToCategories();

  // ------- EVENTS -------
  console.log('Upsert events...');
  await Event.bulkWrite(upsertOps(events));

  // ------- CATEGORIES (sin intentar modificar _id si ya existe por slug) -------
  console.log('Upsert categories...');
  await Category.bulkWrite(
    categories.map((c) => {
      const { _id, ...rest } = c; // no seteamos _id en update
      return {
        updateOne: {
          filter: { $or: [{ _id }, { slug: c.slug }] },
          update: {
            $set: rest,            // actualiza excepto _id
            $setOnInsert: { _id }  // si inserta, fija _id
          },
          upsert: true
        }
      };
    })
  );

  // ------- Conteo final -------
  const [eC, catC] = await Promise.all([
    Event.countDocuments(),
    Category.countDocuments()
  ]);
  console.log(`Totales -> Events:${eC}  Categories:${catC}`);

  await mongoose.disconnect();
  console.log('SEED OK');
}

main().catch(async (e) => {
  console.error('SEED ERROR:', e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
