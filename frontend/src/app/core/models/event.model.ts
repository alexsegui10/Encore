export interface Event {
    _id?: string;
    title: string;
    date: Date;
    price: number;
    currency: string;
    location?: string;
    description?: string;
    category: string; // ObjectId as string
    slug?: string;
    status: 'draft' | 'published' | 'cancelled';
    createdAt?: Date;
    updatedAt?: Date;
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