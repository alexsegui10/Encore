// Para el carousel del home (categorías)
export interface CarouselHome {
    id: string;
    name: string;
    description: string;
    image: string;
    slug: string;
    createdAt?: string;
    updatedAt?: string;
}

// Para el carousel de detalles (imágenes de eventos)
export interface CarouselDetails {
    images: string[];
}

// Respuesta del API para categorías (basada en tu backend)
export interface CarouselCategoriesResponse {
    categories: CarouselHome[];
}

