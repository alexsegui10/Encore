export interface Event {
  _id?: string;
  title: string;
  date: Date | string;
  price: number;
  currency: string;
  location?: string;
  description?: string;
  category: string;
  slug?: string;
  status: 'draft' | 'published' | 'cancelled';
  mainImage?: string;
  images?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  likesCount?: number;
  isLiked?: boolean;
}


export interface CreateEventRequest {
    title: string;
    date: Date;
    price: number;
    currency?: string;
    location?: string;
    description?: string;
    category: string;
    status?: 'draft' | 'published' | 'cancelled';
}

export interface UpdateEventRequest {
    title?: string;
    date?: Date;
    price?: number;
    currency?: string;
    location?: string;
    description?: string;
    category?: string;
    status?: 'draft' | 'published' | 'cancelled';
}
