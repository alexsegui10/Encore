// Script para agregar imágenes reales a productos de merchandising
print('🖼️ Agregando imágenes a productos...\n');

// Imágenes de merchandising de Unsplash
const productImages = {
    'Camiseta Tour Oficial': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    'Gorra Bordada': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
    'Sudadera Oversize': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
    'Tote Bag Canvas': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
    'Poster Edición Limitada': 'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=800',
    'Vinilo Exclusivo': 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800',
    'Llavero Metálico': 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800',
    'Pulsera Luminosa': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
    'Parche Bordado': 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800'
};

let updated = 0;

db.Product.find({}).forEach(product => {
    // Buscar imagen correspondiente al nombre del producto
    let imageUrl = null;
    
    for (const [name, url] of Object.entries(productImages)) {
        if (product.name.includes(name) || name.includes(product.name)) {
            imageUrl = url;
            break;
        }
    }
    
    // Si no encontramos coincidencia, usar imagen genérica de merchandising
    if (!imageUrl) {
        imageUrl = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800';
    }
    
    // Actualizar producto con imagen
    db.Product.updateOne(
        { _id: product._id },
        { 
            $set: { 
                image: imageUrl,
                imageUrl: imageUrl // Por si acaso algún código busca imageUrl
            } 
        }
    );
    
    updated++;
    print(`✅ ${product.name}: ${imageUrl}`);
});

print(`\n📊 Total productos actualizados: ${updated}`);
print('🎉 ¡Imágenes agregadas correctamente!');
