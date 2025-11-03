import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface AdminEvent {
    id: string;
    slug: string;
    title: string;
    date: string;
    price: number;
    currency: string;
    location: string | null;
    description: string | null;
    category: string;
    status: 'draft' | 'published' | 'cancelled';
    isActive: boolean;
    mainImage: string | null;
    images: string[];
    favouritesCount: number;
    comments: string[];
    createdAt: string;
    updatedAt: string;
}

export interface EventsListResponse {
    events: AdminEvent[];
    eventsCount: number;
    totalCount: number;
}

export interface EventQueryParams {
    limit?: number;
    offset?: number;
    status?: 'draft' | 'published' | 'cancelled';
    isActive?: 'true' | 'false';
    category?: string;
    search?: string;
    sortBy?: 'date' | 'createdAt' | 'updatedAt' | 'title';
    sortOrder?: 'asc' | 'desc';
}

@Injectable({
    providedIn: 'root'
})
export class AdminEventService {
    constructor(private apiService: ApiService) { }

    getAll(params?: EventQueryParams): Observable<EventsListResponse> {
        const queryParams: any = {};

        if (params?.limit) queryParams.limit = params.limit;
        if (params?.offset) queryParams.offset = params.offset;
        if (params?.status) queryParams.status = params.status;
        if (params?.isActive) queryParams.isActive = params.isActive;
        if (params?.category) queryParams.category = params.category;
        if (params?.search) queryParams.search = params.search;
        if (params?.sortBy) queryParams.sortBy = params.sortBy;
        if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

        return this.apiService.get('/api/events', queryParams, 3000, true);
    }

    getBySlug(slug: string): Observable<AdminEvent> {
        return this.apiService.get(`/api/events/${slug}`, undefined, 3000, true)
            .pipe(map(data => data.event));
    }

    create(event: Partial<AdminEvent>): Observable<AdminEvent> {
        return this.apiService.post('/api/events', { event }, 3000, true)
            .pipe(map(data => data.event));
    }

    update(slug: string, event: Partial<AdminEvent>): Observable<AdminEvent> {
        return this.apiService.put(`/api/events/${slug}`, { event }, 3000, true)
            .pipe(map(data => data.event));
    }

    delete(slug: string): Observable<void> {
        return this.apiService.delete(`/api/events/${slug}`, 3000, true);
    }
}
