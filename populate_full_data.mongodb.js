// Script completo para poblar datos realistas
// Ejecutar con: mongosh encore < populate_full_data.mongodb.js

print('🚀 Iniciando población completa de datos...\n');

// 1. Obtener todos los eventos existentes
const allEvents = db.events.find({}).toArray();
print(`📅 Eventos encontrados: ${allEvents.length}`);

// 2. Obtener todos los usuarios existentes
const allUsers = db.users.find({role: 'user'}).toArray();
print(`👥 Usuarios encontrados: ${allUsers.length}\n`);

if (allUsers.length < 3) {
    print('⚠️ Necesitas al menos 3 usuarios. Creando usuarios adicionales...');
    
    const newUsers = [
        {
            uid: 'client_pedro789',
            slug: 'pedro_metal',
            username: 'pedro_metal',
            email: 'pedro.sanchez@email.com',
            password: '$argon2id$v=19$m=65536,t=3,p=4$w3MEKlR4iKVKNlOgIHbWqw$9Ist4XnjzaVNkCk/cemxUexirYgzZnIX',
            bio: 'Metalhead desde los 90 🤘 | Coleccionista de vinilos | Barcelona',
            image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400',
            role: 'user',
            isActive: true,
            status: 'active',
            favouriteEvents: [],
            followingUsers: [],
            createdAt: new Date('2024-06-20T10:00:00Z'),
            updatedAt: new Date('2024-12-02T12:00:00Z')
        },
        {
            uid: 'client_sofia456',
            slug: 'sofia_dance',
            username: 'sofia_dance',
            email: 'sofia.lopez@email.com',
            password: '$argon2id$v=19$m=65536,t=3,p=4$w3MEKlR4iKVKNlOgIHbWqw$9Ist4XnjzaVNkCk/cemxUexirYgzZnIX',
            bio: '💃 Electronic music lover | DJ amateur | Valencia',
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
            role: 'user',
            isActive: true,
            status: 'active',
            favouriteEvents: [],
            followingUsers: [],
            createdAt: new Date('2024-07-15T14:30:00Z'),
            updatedAt: new Date('2024-12-02T11:30:00Z')
        },
        {
            uid: 'client_david321',
            slug: 'david_rock',
            username: 'david_rock',
            email: 'david.ruiz@email.com',
            password: '$argon2id$v=19$m=65536,t=3,p=4$w3MEKlR4iKVKNlOgIHbWqw$9Ist4XnjzaVNkCk/cemxUexirYgzZnIX',
            bio: 'Rock & Roll never dies 🎸 | Guitar player | Madrid',
            image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
            role: 'user',
            isActive: true,
            status: 'active',
            favouriteEvents: [],
            followingUsers: [],
            createdAt: new Date('2024-08-01T09:00:00Z'),
            updatedAt: new Date('2024-12-02T10:00:00Z')
        },
        {
            uid: 'client_elena654',
            slug: 'elena_indie',
            username: 'elena_indie',
            email: 'elena.martin@email.com',
            password: '$argon2id$v=19$m=65536,t=3,p=4$w3MEKlR4iKVKNlOgIHbWqw$9Ist4XnjzaVNkCk/cemxUexirYgzZnIX',
            bio: 'Indie music soul 🎵 | Festival lover | Málaga',
            image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
            role: 'user',
            isActive: true,
            status: 'active',
            favouriteEvents: [],
            followingUsers: [],
            createdAt: new Date('2024-09-10T16:00:00Z'),
            updatedAt: new Date('2024-12-02T09:00:00Z')
        }
    ];
    
    db.users.insertMany(newUsers);
    print(`✅ ${newUsers.length} usuarios adicionales creados\n`);
}

// Recargar usuarios
const users = db.users.find({role: 'user'}).toArray();
print(`👥 Total usuarios disponibles: ${users.length}\n`);

// 3. Comentarios realistas para eventos
const commentTemplates = [
    '¡Increíble! Este artista siempre da shows espectaculares. Ya tengo mi entrada! 🎉',
    'Vi su último concierto y fue una experiencia única. Totalmente recomendado! ⭐',
    'La mejor banda en vivo que he visto. No puedo esperar para este show! 🔥',
    '¿Alguien más va a ir? Me encantaría conocer gente que vaya! 👋',
    'Ya compré el merchandising oficial. La calidad es brutal! 👕',
    'Este será el concierto del año, sin duda. Las entradas volaron! 🎫',
    'La producción de sus shows es de otro nivel. Prepárense para algo épico! 🌟',
    'Llevo años esperando que vengan a España. Por fin! 😍',
    'Sus canciones en vivo suenan aún mejor que en estudio. Impresionante! 🎶',
    'El setlist va a estar increíble. Espero que toquen todos los clásicos! 🎸',
    'Ya he ido a 3 conciertos de esta gira y cada vez es mejor! 🤩',
    'La atmósfera en sus conciertos es mágica. No os lo perdáis! ✨',
    '¿Alguien sabe si habrá sorpresas? Los últimos shows tuvieron invitados especiales! 🎤',
    'Compré entradas VIP. Alguien más? Estaría bien quedar antes del show! 🥂',
    'Este es mi artista favorito. He esperado tanto por esto! 💖',
    'La acústica de este venue es perfecta para este tipo de show! 🎵',
    'Ya tengo todo preparado: entrada, hotel y mis mejores outfit! 👗',
    'Voy con un grupo de amigos. Será épico! 🎊',
    'Sus letras me han acompañado en los mejores momentos. Gracias por venir! 🙏',
    'La puesta en escena que preparan es espectacular. Tengo el hype altísimo! 🚀'
];

print('💬 Agregando comentarios a todos los eventos...');
let totalComments = 0;

allEvents.forEach(event => {
    // Agregar entre 8-15 comentarios por evento
    const numComments = Math.floor(Math.random() * 8) + 8;
    const eventComments = [];
    
    for (let i = 0; i < numComments; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomTemplate = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
        
        const comment = {
            body: randomTemplate,
            author: randomUser._id,
            evento: event._id,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Últimos 30 días
            updatedAt: new Date()
        };
        
        const result = db.comments.insertOne(comment);
        eventComments.push(result.insertedId);
        totalComments++;
    }
    
    // Actualizar el evento con los IDs de comentarios
    db.events.updateOne(
        { _id: event._id },
        { $set: { comments: eventComments } }
    );
});

print(`✅ ${totalComments} comentarios agregados\n`);

// 4. Agregar likes (favourites) a eventos
print('❤️ Agregando favoritos a eventos...');

allEvents.forEach(event => {
    // Cada evento tendrá entre 50-500 likes
    const numLikes = Math.floor(Math.random() * 450) + 50;
    
    // Actualizar contador de favoritos
    db.events.updateOne(
        { _id: event._id },
        { $set: { favouritesCount: numLikes } }
    );
    
    // Agregar el evento a los favoritos de algunos usuarios (3-5 usuarios aleatorios)
    const numUsersLiking = Math.min(Math.floor(Math.random() * 3) + 3, users.length);
    const shuffledUsers = users.sort(() => 0.5 - Math.random()).slice(0, numUsersLiking);
    
    shuffledUsers.forEach(user => {
        db.users.updateOne(
            { _id: user._id },
            { $addToSet: { favouriteEvents: event._id } }
        );
    });
});

print(`✅ Favoritos agregados a todos los eventos\n`);

// 5. Verificar y agregar productos de merchandising
print('🛍️ Verificando productos de merchandising...');

const products = db.Product.find({}).toArray();
print(`   Productos encontrados: ${products.length}`);

if (products.length < 8) {
    print('   Agregando productos faltantes...');
    
    const productsToAdd = [];
    const productData = [
        { id: 'prod_001', name: 'Camiseta Tour Oficial', price: 35.00, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
        { id: 'prod_002', name: 'Gorra Bordada', price: 25.00, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400' },
        { id: 'prod_003', name: 'Sudadera Oversize', price: 55.00, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400' },
        { id: 'prod_004', name: 'Tote Bag Canvas', price: 18.00, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400' },
        { id: 'prod_005', name: 'Poster Tour 2025', price: 12.00, image: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=400' },
        { id: 'prod_006', name: 'Pulsera de Tela', price: 8.00, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=400' },
        { id: 'prod_007', name: 'Vinilo Edición Limitada', price: 40.00, image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400' },
        { id: 'prod_008', name: 'Pins Pack Coleccionable', price: 15.00, image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400' }
    ];
    
    productData.forEach(p => {
        const existing = db.Product.findOne({ productId: p.id });
        if (!existing) {
            productsToAdd.push({
                productId: p.id,
                name: p.name,
                description: `Producto oficial del tour. Alta calidad garantizada.`,
                price: p.price,
                currency: 'EUR',
                stockTotal: 500,
                stockAvailable: Math.floor(Math.random() * 400) + 100,
                image: p.image,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
    });
    
    if (productsToAdd.length > 0) {
        db.Product.insertMany(productsToAdd);
        print(`   ✅ ${productsToAdd.length} productos agregados`);
    }
}

// 6. Agregar merchandising a todos los eventos
print('\n🎁 Asignando merchandising a eventos...');

allEvents.forEach(event => {
    // Cada evento tendrá entre 3-6 productos de merchandising
    const numProducts = Math.floor(Math.random() * 4) + 3;
    const allProducts = db.Product.find({}).toArray();
    
    const selectedProducts = allProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, numProducts)
        .map(p => ({
            productId: p.productId,
            quantity: Math.floor(Math.random() * 50) + 20
        }));
    
    db.events.updateOne(
        { _id: event._id },
        { $set: { merchandising: selectedProducts } }
    );
});

print('✅ Merchandising asignado a todos los eventos\n');

// 7. Resumen final
print('📊 RESUMEN FINAL:');
print('================');

const finalStats = {
    eventos: db.events.countDocuments({}),
    usuarios: db.users.countDocuments({ role: 'user' }),
    comentarios: db.comments.countDocuments({}),
    productos: db.Product.countDocuments({}),
    favoritosTotal: db.events.aggregate([
        { $group: { _id: null, total: { $sum: '$favouritesCount' } } }
    ]).toArray()[0]?.total || 0
};

print(`📅 Eventos: ${finalStats.eventos}`);
print(`👥 Usuarios: ${finalStats.usuarios}`);
print(`💬 Comentarios: ${finalStats.comentarios}`);
print(`🛍️ Productos: ${finalStats.productos}`);
print(`❤️ Total likes: ${finalStats.favoritosTotal}`);

print('\n🎉 ¡Población completa de datos terminada!');
print('🌟 Tu plataforma ahora se ve totalmente real y profesional.');
