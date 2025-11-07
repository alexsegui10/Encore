export interface Category {
  _id?: string;
  name: string; // antes 'title'
  description?: string;
  image?: string;
  slug?: string;
  status?: 'active' | 'hidden' | 'archived';
}
