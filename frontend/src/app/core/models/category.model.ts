export interface Category {
  _id?: string;
  name: string; // antes 'title'
  description?: string;
  shortDescription?: string; // Descripción corta para carrusel
  image?: string;
  slug?: string;
  status?: 'active' | 'hidden' | 'archived';
  events?: string[]; // Array de IDs de eventos
}
