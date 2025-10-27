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
  // Conciertos
  {
    _id: OID('66fca0020000000000000001'),
    title: 'Taylor Swift — Madrid',
    date: new Date('2026-06-20T20:30:00.000Z'),
    price: 120, currency: 'EUR',
    location: 'Santiago Bernabéu, Madrid',
    description: 'The Eras Tour llega a Madrid con un show de 3 horas.',
    category: OID('66fca0010000000000000001'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063',
    images: [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'
    ],
    slug: 'taylor-swift-madrid-2026-06-20',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000002'),
    title: 'Coldplay — Barcelona',
    date: new Date('2026-07-05T21:00:00.000Z'),
    price: 95, currency: 'EUR',
    location: 'Estadi Olímpic, Barcelona',
    description: 'Coldplay regresa con su gira Music of the Spheres.',
    category: OID('66fca0010000000000000001'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1',
    images: [
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4'
    ],
    slug: 'coldplay-barcelona-2026-07-05',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000003'),
    title: 'Ed Sheeran — Valencia',
    date: new Date('2026-09-12T21:00:00.000Z'),
    price: 75, currency: 'EUR',
    location: 'Mestalla, Valencia',
    description: 'Gira internacional con sus nuevos éxitos.',
    category: OID('66fca0010000000000000001'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044',
    images: ['https://images.unsplash.com/photo-1511379938547-c1f69419868d'],
    slug: 'ed-sheeran-valencia-2026-09-12',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000004'),
    title: 'Aitana — Sevilla',
    date: new Date('2026-05-18T20:00:00.000Z'),
    price: 42, currency: 'EUR',
    location: 'Estadio La Cartuja, Sevilla',
    description: 'Nueva gira por España con banda completa.',
    category: OID('66fca0010000000000000001'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd53',
    images: ['https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'],
    slug: 'aitana-sevilla-2026-05-18',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000005'),
    title: 'Metallica — Madrid',
    date: new Date('2026-10-22T20:30:00.000Z'),
    price: 88, currency: 'EUR',
    location: 'WiZink Center, Madrid',
    description: 'Metal al máximo con un setlist histórico.',
    category: OID('66fca0010000000000000001'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
    images: ['https://images.unsplash.com/photo-1499364615650-ec38552f4f34'],
    slug: 'metallica-madrid-2026-10-22',
    favouritesCount: 0
  },

  // Festivales / Electrónica
  {
    _id: OID('66fca0020000000000000006'),
    title: 'Primavera Sound — Barcelona',
    date: new Date('2026-06-01T17:00:00.000Z'),
    price: 195, currency: 'EUR',
    location: 'Parc del Fòrum, Barcelona',
    description: 'Cartel internacional con decenas de artistas.',
    category: OID('66fca0010000000000000002'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81c',
    images: ['https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf'],
    slug: 'primavera-sound-barcelona-2026-06-01',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000007'),
    title: 'Mad Cool — Madrid',
    date: new Date('2026-07-12T17:00:00.000Z'),
    price: 180, currency: 'EUR',
    location: 'Iberdrola Music, Madrid',
    description: 'Los mejores artistas del momento en varios escenarios.',
    category: OID('66fca0010000000000000002'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf',
    images: ['https://images.unsplash.com/photo-1521335629791-ce4aec67dd53'],
    slug: 'mad-cool-madrid-2026-07-12',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000008'),
    title: 'BBF Barcelona Beach Festival',
    date: new Date('2026-07-20T18:00:00.000Z'),
    price: 65, currency: 'EUR',
    location: 'Platja del Fòrum, Barcelona',
    description: 'EDM frente al mar.',
    category: OID('66fca0010000000000000008'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229',
    images: ['https://images.unsplash.com/photo-1487180144351-b8472da7d491'],
    slug: 'bbf-barcelona-2026-07-20',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000009'),
    title: 'DGTL — Barcelona',
    date: new Date('2026-04-14T18:00:00.000Z'),
    price: 55, currency: 'EUR',
    location: 'Parc del Fòrum, Barcelona',
    description: 'Techno y house con visuales brutales.',
    category: OID('66fca0010000000000000008'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229',
    images: ['https://images.unsplash.com/photo-1464375117522-1311d6a5b81c'],
    slug: 'dgtl-barcelona-2026-04-14',
    favouritesCount: 0
  },

  // Teatro / Musicales
  {
    _id: OID('66fca002000000000000000a'),
    title: 'El Rey León — Madrid',
    date: new Date('2026-03-15T19:30:00.000Z'),
    price: 65, currency: 'EUR',
    location: 'Teatro Lope de Vega, Madrid',
    description: 'Musical emblemático para toda la familia.',
    category: OID('66fca0010000000000000003'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    images: ['https://images.unsplash.com/photo-1478720568477-152d9b164e26'],
    slug: 'el-rey-leon-madrid-2026-03-15',
    favouritesCount: 0
  },
  {
    _id: OID('66fca002000000000000000b'),
    title: 'La vida es sueño — Madrid',
    date: new Date('2026-02-21T19:00:00.000Z'),
    price: 28, currency: 'EUR',
    location: 'Teatro Español, Madrid',
    description: 'Clásico de Calderón con puesta en escena moderna.',
    category: OID('66fca0010000000000000003'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    images: ['https://images.unsplash.com/photo-1515165562835-c3b8c8d966cc'],
    slug: 'la-vida-es-sueno-madrid-2026-02-21',
    favouritesCount: 0
  },

  // Deportes
  {
    _id: OID('66fca002000000000000000c'),
    title: 'GP de España de F1 — Barcelona',
    date: new Date('2026-06-07T13:00:00.000Z'),
    price: 210, currency: 'EUR',
    location: 'Circuit de Barcelona-Catalunya',
    description: 'El gran circo de la F1 en Montmeló.',
    category: OID('66fca0010000000000000004'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a',
    images: ['https://images.unsplash.com/photo-1517649763962-0c623066013b'],
    slug: 'f1-gp-espana-barcelona-2026-06-07',
    favouritesCount: 0
  },
  {
    _id: OID('66fca002000000000000000d'),
    title: 'FC Barcelona vs Real Madrid',
    date: new Date('2026-10-26T19:00:00.000Z'),
    price: 140, currency: 'EUR',
    location: 'Estadi Olímpic Lluís Companys, Barcelona',
    description: 'El Clásico con ambiente de final.',
    category: OID('66fca0010000000000000004'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    images: ['https://images.unsplash.com/photo-1461896836934-ffe607ba8211'],
    slug: 'clasico-barcelona-real-madrid-2026-10-26',
    favouritesCount: 0
  },
  {
    _id: OID('66fca002000000000000000e'),
    title: 'Maratón Valencia Trinidad Alfonso',
    date: new Date('2026-12-06T08:30:00.000Z'),
    price: 70, currency: 'EUR',
    location: 'Valencia',
    description: 'La maratón más rápida de España.',
    category: OID('66fca0010000000000000004'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1518611012118-f0c5d859f8d8',
    images: ['https://images.unsplash.com/photo-1518611012118-f0c5d859f8d8'],
    slug: 'maraton-valencia-2026-12-06',
    favouritesCount: 0
  },

  // Conferencias / Tech
  {
    _id: OID('66fca002000000000000000f'),
    title: 'Mobile World Congress — Barcelona',
    date: new Date('2026-02-24T09:00:00.000Z'),
    price: 799, currency: 'EUR',
    location: 'Fira Gran Via, Barcelona',
    description: 'La cita mundial del móvil y conectividad.',
    category: OID('66fca0010000000000000005'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    images: ['https://images.unsplash.com/photo-1520607162513-77705c0f0d4a'],
    slug: 'mwc-barcelona-2026-02-24',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000010'),
    title: 'OpenExpo Europe — Madrid',
    date: new Date('2026-06-19T09:30:00.000Z'),
    price: 45, currency: 'EUR',
    location: 'IFEMA, Madrid',
    description: 'Conferencia sobre Open Source y transformación digital.',
    category: OID('66fca0010000000000000005'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    images: ['https://images.unsplash.com/photo-1551836022-4c4c79ecde51'],
    slug: 'openexpo-europe-madrid-2026-06-19',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000011'),
    title: 'NodeConf — Barcelona',
    date: new Date('2026-09-28T09:00:00.000Z'),
    price: 120, currency: 'EUR',
    location: 'CCIB, Barcelona',
    description: 'Node.js, backend moderno y escalabilidad.',
    category: OID('66fca0010000000000000005'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085'],
    slug: 'nodeconf-barcelona-2026-09-28',
    favouritesCount: 0
  },

  // Comedia
  {
    _id: OID('66fca0020000000000000012'),
    title: 'Goyo Jiménez — Aiguantulivinamérica 3',
    date: new Date('2026-04-09T20:00:00.000Z'),
    price: 28, currency: 'EUR',
    location: 'Teatro Olympia, Valencia',
    description: 'Monólogo hilarante sobre costumbres y contrastes.',
    category: OID('66fca0010000000000000006'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1519844527959-7f3a1a3c6d57',
    images: ['https://images.unsplash.com/photo-1519844527959-7f3a1a3c6d57'],
    slug: 'goyo-jimenez-valencia-2026-04-09',
    favouritesCount: 0
  },
  {
    _id: OID('66fca0020000000000000013'),
    title: 'Carlos Latre — One Man Show',
    date: new Date('2026-05-16T20:30:00.000Z'),
    price: 30, currency: 'EUR',
    location: 'Teatro Coliseum, Madrid',
    description: 'Imitaciones y humor para todos los públicos.',
    category: OID('66fca0010000000000000006'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1519844527959-7f3a1a3c6d57',
    images: ['https://images.unsplash.com/photo-1525182008055-f88b95ff7980'],
    slug: 'carlos-latre-madrid-2026-05-16',
    favouritesCount: 0
  },

  // Familia
  {
    _id: OID('66fca0020000000000000014'),
    title: 'Disney On Ice — Madrid',
    date: new Date('2026-01-18T17:00:00.000Z'),
    price: 35, currency: 'EUR',
    location: 'WiZink Center, Madrid',
    description: 'Espectáculo sobre hielo para toda la familia.',
    category: OID('66fca0010000000000000007'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1517341721142-35a7d495bd4c',
    images: ['https://images.unsplash.com/photo-1517341721142-35a7d495bd4c'],
    slug: 'disney-on-ice-madrid-2026-01-18',
    favouritesCount: 0
  },

  // Cine
  {
    _id: OID('66fca0020000000000000015'),
    title: 'Maratón Star Wars — Barcelona',
    date: new Date('2026-05-04T18:00:00.000Z'),
    price: 22, currency: 'EUR',
    location: 'Cinesa Diagonal, Barcelona',
    description: 'Celebración May the 4th con maratón original.',
    category: OID('66fca0010000000000000009'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66',
    images: ['https://images.unsplash.com/photo-1517602302552-471fe67acf66'],
    slug: 'maraton-star-wars-barcelona-2026-05-04',
    favouritesCount: 0
  },

  // Arte
  {
    _id: OID('66fca0020000000000000016'),
    title: 'Sorolla — Exposición permanente',
    date: new Date('2026-03-10T10:00:00.000Z'),
    price: 10, currency: 'EUR',
    location: 'Museo Sorolla, Madrid',
    description: 'Obra del maestro de la luz valenciano.',
    category: OID('66fca001000000000000000a'),
    status: 'published',
    mainImage: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe',
    images: ['https://images.unsplash.com/photo-1529101091764-c3526daf38fe'],
    slug: 'sorolla-madrid-2026-03-10',
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
