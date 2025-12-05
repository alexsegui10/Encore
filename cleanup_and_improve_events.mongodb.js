// Script para limpiar eventos y agregar imágenes reales
// Ejecutar con: mongosh encore < cleanup_and_improve_events.mongodb.js

print('🧹 Limpiando y mejorando eventos...\n');

// 1. Obtener todos los eventos
const allEvents = db.events.find({}).toArray();
print(`📅 Eventos actuales: ${allEvents.length}`);

// 2. Seleccionar los mejores eventos para mantener (aproximadamente la mitad)
const eventsToKeep = [
    'coldplay-music-of-spheres-2025',
    'rosalia-motomami-tour-madrid',
    'bad-bunny-most-wanted-tour',
    'the-weeknd-after-hours-barcelona',
    'dua-lipa-radical-optimism-valencia',
    'taylor-swift-eras-tour-barcelona'
];

// Obtener eventos que NO están en la lista de mantener
const eventsToDelete = allEvents.filter(e => !eventsToKeep.includes(e.slug));

print(`🗑️ Eliminando ${eventsToDelete.length} eventos...`);

// Eliminar eventos no deseados y sus comentarios asociados
eventsToDelete.forEach(event => {
    // Eliminar comentarios del evento
    db.comments.deleteMany({ evento: event._id });
    // Eliminar el evento
    db.events.deleteOne({ _id: event._id });
});

print(`✅ Eventos eliminados: ${eventsToDelete.length}\n`);

// 3. Actualizar eventos restantes con imágenes reales y de alta calidad
print('🖼️ Actualizando eventos con imágenes reales...\n');

// Coldplay - Music of the Spheres
db.events.updateOne(
    { slug: 'coldplay-music-of-spheres-2025' },
    {
        $set: {
            mainImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200',
            images: [
                'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200',
                'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200',
                'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200',
                'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200',
                'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200'
            ],
            description: 'Coldplay llega a Barcelona con su espectacular gira Music of the Spheres World Tour. Una experiencia audiovisual única que combina los mayores éxitos de la banda con nueva música de su último álbum. El show incluye impresionantes efectos de luces LED, pulseras interactivas para el público, confeti de colores y una producción sostenible. Prepárate para cantar classics como "Yellow", "Viva La Vida", "Fix You", "Adventure of a Lifetime" y mucho más en una noche inolvidable.'
        }
    }
);
print('✅ Coldplay actualizado');

// ROSALÍA - MOTOMAMI
db.events.updateOne(
    { slug: 'rosalia-motomami-tour-madrid' },
    {
        $set: {
            mainImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200',
            images: [
                'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200',
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
                'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
                'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200',
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200',
                'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200'
            ],
            description: 'ROSALÍA presenta MOTOMAMI World Tour en el WiZink Center de Madrid. La artista española más internacional del momento fusiona flamenco, reggaeton, bachata y experimentación en un espectáculo revolucionario. Escucha en vivo "SAOKO", "BIZCOCHITO", "LA FAMA", "CHICKEN TERIYAKI" y todos los hits de MOTOMAMI junto a clásicos como "MALAMENTE" y "PIENSO EN TU MIRÁ". Una puesta en escena innovadora con motos, coreografías impactantes y la voz más poderosa de la música actual.'
        }
    }
);
print('✅ ROSALÍA actualizado');

// Bad Bunny
db.events.updateOne(
    { slug: 'bad-bunny-most-wanted-tour' },
    {
        $set: {
            mainImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
            images: [
                'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
                'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
                'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200',
                'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200',
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
                'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200'
            ],
            description: 'Bad Bunny regresa a España con su Most Wanted Tour en el Estadio Santiago Bernabéu. El Conejo Malo trae todos sus éxitos de "Un Verano Sin Ti", "YHLQMDLG" y su último álbum. Disfruta de "Tití Me Preguntó", "Moscow Mule", "Dakiti", "Safaera", "Yo Perreo Sola" y muchos más hits en el escenario más grande de Madrid. Una producción masiva con pantallas LED gigantes, pirotecnia, efectos especiales y sorpresas que harán vibrar todo el estadio. ¡El perreo no para!'
        }
    }
);
print('✅ Bad Bunny actualizado');

// The Weeknd
db.events.updateOne(
    { slug: 'the-weeknd-after-hours-barcelona' },
    {
        $set: {
            mainImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200',
            images: [
                'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200',
                'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200',
                'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200',
                'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
                'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200',
                'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200'
            ],
            description: 'The Weeknd llega al Estadi Olímpic de Barcelona con After Hours til Dawn Stadium Tour. Abel Tesfaye presenta el tour más ambicioso de su carrera, combinando los álbumes "After Hours" y "Dawn FM" en un espectáculo audiovisual cinematográfico. Escucha "Blinding Lights", "Save Your Tears", "Starboy", "Can\'t Feel My Face", "The Hills" y todos sus grandes éxitos con una producción de otro nivel que incluye un escenario de 360 grados, luces láser sincronizadas, hologramas y efectos visuales impresionantes.'
        }
    }
);
print('✅ The Weeknd actualizado');

// Dua Lipa
db.events.updateOne(
    { slug: 'dua-lipa-radical-optimism-valencia' },
    {
        $set: {
            mainImage: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200',
            images: [
                'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200',
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200',
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
                'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
                'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200'
            ],
            description: 'Dua Lipa presenta Radical Optimism Tour en Valencia. La estrella del pop británica trae su nuevo álbum "Radical Optimism" junto con todos sus hits: "Levitating", "Don\'t Start Now", "Physical", "New Rules", "IDGAF" y "One Kiss". Un show lleno de energía, coreografías impecables, cambios de vestuario espectaculares y una banda en vivo de primer nivel. La producción incluye una pasarela central para acercarse al público, pantallas LED envolventes y una atmósfera de fiesta que no parará en toda la noche.'
        }
    }
);
print('✅ Dua Lipa actualizado');

// Taylor Swift
db.events.updateOne(
    { slug: 'taylor-swift-eras-tour-barcelona' },
    {
        $set: {
            mainImage: 'https://images.unsplash.com/photo-1499415479124-43c32433a620?w=1200',
            images: [
                'https://images.unsplash.com/photo-1499415479124-43c32433a620?w=1200',
                'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200',
                'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200',
                'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200',
                'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200'
            ],
            description: 'Taylor Swift llega al Camp Nou con The Eras Tour, el espectáculo más épico y esperado del año. Un viaje por todas las eras de su carrera musical: desde "Taylor Swift" hasta "Midnights". Más de 40 canciones en un show de 3+ horas que incluye "Anti-Hero", "Shake It Off", "Blank Space", "Love Story", "You Belong With Me", "Cruel Summer", "Willow", "cardigan" y muchísimo más. Cambios de vestuario por cada era, escenarios temáticos, pantallas gigantes, fuegos artificiales y momentos acústicos sorpresa. Un evento histórico que solo Taylor puede ofrecer.'
        }
    }
);
print('✅ Taylor Swift actualizado');

// 4. Actualizar contadores de favoritos y comentarios para que sean más realistas
print('\n📊 Ajustando estadísticas...');

const keptEvents = db.events.find({}).toArray();
keptEvents.forEach(event => {
    const commentCount = db.comments.countDocuments({ evento: event._id });
    const likesCount = Math.floor(Math.random() * 800) + 200; // Entre 200-1000 likes
    
    db.events.updateOne(
        { _id: event._id },
        { $set: { favouritesCount: likesCount } }
    );
});

print('✅ Estadísticas actualizadas\n');

// 5. Resumen final
print('📊 RESUMEN FINAL:');
print('================');

const finalEvents = db.events.find({}).toArray();
print(`📅 Eventos finales: ${finalEvents.length}`);
print('\nEventos activos:');
finalEvents.forEach(event => {
    const commentCount = db.comments.countDocuments({ evento: event._id });
    print(`   • ${event.title}`);
    print(`     - Likes: ${event.favouritesCount}`);
    print(`     - Comentarios: ${commentCount}`);
    print(`     - Imágenes: ${event.images.length}`);
});

print('\n🎉 ¡Eventos optimizados y mejorados!');
print('✨ Ahora tienes eventos de máxima calidad con imágenes reales.');
