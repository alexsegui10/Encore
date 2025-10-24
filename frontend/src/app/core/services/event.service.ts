import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Event, CreateEventRequest, UpdateEventRequest } from '../models/event.model';
import { ApiService } from './api.service';
import { Filters } from '../models/filters.model';
@Injectable({
    providedIn: 'root'
})
export class EventService {

    constructor(private apiService: ApiService) { }


    getAllEvents(params?: any): Observable<Event[]> {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    httpParams = httpParams.set(key, params[key].toString());
                }
            });
        }

        // Enviar con auth opcional - si hay token lo envía, si no continúa sin él
        return this.apiService.get("/api/eventos", httpParams, 4000, true);
    }

    get_products_filter(filters: Filters): Observable<Event[]> {
        let httpParams = new HttpParams();

        if (filters.category) {
            httpParams = httpParams.set('category', filters.category);
        }

        // Solo enviar price_min si tiene un valor válido mayor que 0
        if (filters.price_min !== undefined && filters.price_min !== null && filters.price_min > 0) {
            httpParams = httpParams.set('price_min', filters.price_min.toString());
        }

        // Solo enviar price_max si tiene un valor válido
        if (filters.price_max !== undefined && filters.price_max !== null && filters.price_max > 0) {
            httpParams = httpParams.set('price_max', filters.price_max.toString());
        }

        if (filters.name && filters.name.trim() !== '') {
            httpParams = httpParams.set('name', filters.name.trim());
        }
        if (filters.limit) {
            httpParams = httpParams.set('limit', filters.limit.toString());
        }
        if (filters.offset) {
            httpParams = httpParams.set('offset', filters.offset.toString());
        }

        console.log('Sending HTTP params:', httpParams.toString());
        // Enviar con auth opcional - si hay token lo envía, si no continúa sin él
        return this.apiService.get("/api/eventos", httpParams, 4000, true);
    }


    getEventBySlug(slug: string): Observable<Event> {
        // Enviar con auth opcional - si hay token lo envía, si no continúa sin él
        return this.apiService.get(`/api/eventos/${slug}`, undefined, 4000, true);
    }


    getEventById(id: string): Observable<Event> {
        // Enviar con auth opcional - si hay token lo envía, si no continúa sin él
        return this.apiService.get(`/api/eventos/${id}`, undefined, 4000, true);
    }

    createEvent(eventData: CreateEventRequest): Observable<Event> {
        return this.apiService.post('/api/eventos', eventData, 4000);
    }

    updateEvent(slug: string, eventData: UpdateEventRequest): Observable<Event> {
        return this.apiService.put(`/api/eventos/${slug}`, eventData, 4000);
    }

    deleteEvent(slug: string): Observable<any> {
        return this.apiService.delete(`/api/eventos/${slug}`, 4000);
    }

    searchEventsByTitle(title: string): Observable<Event[]> {
        const params = new HttpParams().set('title', title);
        return this.apiService.get('/api/eventos', params, 4000);
    }

    getEventsByCategory(categorySlug: string): Observable<Event[]> {
        return this.apiService.get(`/api/eventos/category/${categorySlug}`, undefined, 4000);
    }

    getEventsByStatus(status: 'draft' | 'published' | 'cancelled'): Observable<Event[]> {
        const params = new HttpParams().set('status', status);
        return this.apiService.get('/api/eventos', params, 4000);
    }
    // Buscar eventos por nombre
    getEventByName(name: string): Observable<Event[]> {
        const params = new HttpParams().set('name', name.trim());
        return this.apiService.get(`/api/eventos`, params, 4000);
    }

    getPublishedEvents(): Observable<Event[]> {
        return this.getEventsByStatus('published');
    }

    getUpcomingEvents(): Observable<Event[]> {
        const params = new HttpParams().set('upcoming', 'true');
        return this.apiService.get('/api/eventos', params, 4000);
    }

    getEventsByDateRange(startDate: Date, endDate: Date): Observable<Event[]> {
        const params = new HttpParams()
            .set('startDate', startDate.toISOString())
            .set('endDate', endDate.toISOString());
        return this.apiService.get('/api/eventos', params, 4000);
    }

    // ===================== LIKES DE EVENTO =====================


    public likeEvent(slug: string): Observable<Event> {
        return this.apiService.post(`/api/${slug}/favorite`, null, 4000, true).pipe(
            map((response: any) => response.event)
        );
    }

    public unlikeEvent(slug: string): Observable<Event> {
        return this.apiService.delete(`/api/${slug}/favorite`, 4000, true).pipe(
            map((response: any) => response.event)
        );
    }

    // ===================== COMENTARIOS DE EVENTO =====================

    getEventComments(slug: string) {
        return this.apiService.get(`/api/${slug}/comments`, undefined, 4000, false);
    }

    createEventComment(slug: string, body: string) {
        return this.apiService.post(
            `/api/${slug}/comments`,
            { comment: { body } },
            4000,
            true
        );
    }

    deleteEventComment(slug: string, commentId: string) {
        return this.apiService.delete(
            `/api/${slug}/comments/${commentId}`,
            4000,
            true
        );
    }

    getLikedEvents(): Observable<Event[]> {
        return this.apiService.get('/api/eventos/liked', undefined, 4000, true);
    }  
}
