import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventRequest, UpdateEventRequest } from '../models/event.model';
import { ApiService } from './api.service';
import { Filters } from '../models/filters.model';
@Injectable({
    providedIn: 'root'
})
export class EventService {

    constructor(private apiService: ApiService) { }

    /**
     * Obtiene todos los eventos
     * @param params - Parámetros de consulta opcionales (filtros, paginación, etc.)
     * @returns Observable con la lista de eventos
     */
    getAllEvents(params?: any): Observable<Event[]> {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    httpParams = httpParams.set(key, params[key].toString());
                }
            });
        }

        return this.apiService.get("/api/eventos", httpParams, 4000);
    }

    get_products_filter(filters: Filters): Observable<Event[]> {
        let httpParams = new HttpParams();
        
        if (filters.category) {
            httpParams = httpParams.set('category', filters.category);
        }
        if (filters.price_min !== undefined && filters.price_min !== null) {
            httpParams = httpParams.set('price_min', filters.price_min.toString());
        }
        if (filters.price_max !== undefined && filters.price_max !== null) {
            httpParams = httpParams.set('price_max', filters.price_max.toString());
        }
        if (filters.name) {
            httpParams = httpParams.set('name', filters.name);
        }
        if (filters.limit) {
            httpParams = httpParams.set('limit', filters.limit.toString());
        }
        if (filters.offset) {
            httpParams = httpParams.set('offset', filters.offset.toString());
        }
        
        return this.apiService.get("/api/eventos", httpParams, 4000);
    }

    /**
     * Obtiene un evento específico por su slug
     * @param slug - Identificador único del evento
     * @returns Observable con el evento
     */
    getEventBySlug(slug: string): Observable<Event> {
        return this.apiService.get(`/api/eventos/${slug}`, undefined, 4000);
    }

    /**
     * Obtiene un evento específico por su ID
     * @param id - ID del evento
     * @returns Observable con el evento
     */
    getEventById(id: string): Observable<Event> {
        return this.apiService.get(`/api/eventos/${id}`, undefined, 4000);
    }

    /**
     * Crea un nuevo evento
     * @param eventData - Datos del evento a crear
     * @returns Observable con el evento creado
     */
    createEvent(eventData: CreateEventRequest): Observable<Event> {
        return this.apiService.post('/api/eventos', eventData, 4000);
    }

    /**
     * Actualiza un evento existente
     * @param slug - Slug del evento a actualizar
     * @param eventData - Datos a actualizar
     * @returns Observable con el evento actualizado
     */
    updateEvent(slug: string, eventData: UpdateEventRequest): Observable<Event> {
        return this.apiService.put(`/api/eventos/${slug}`, eventData, 4000);
    }

    /**
     * Elimina un evento
     * @param slug - Slug del evento a eliminar
     * @returns Observable con el resultado de la operación
     */
    deleteEvent(slug: string): Observable<any> {
        return this.apiService.delete(`/api/eventos/${slug}`, 4000);
    }

    /**
     * Busca eventos por título
     * @param title - Título o parte del título a buscar
     * @returns Observable con la lista de eventos que coinciden
     */
    searchEventsByTitle(title: string): Observable<Event[]> {
        const params = new HttpParams().set('title', title);
        return this.apiService.get('/api/eventos', params, 4000);
    }

    /**
     * Obtiene eventos por categoría
     * @param categorySlug - Slug de la categoría
     * @returns Observable con la lista de eventos de la categoría
     */
    getEventsByCategory(categorySlug: string): Observable<Event[]> {
        return this.apiService.get(`/api/eventos/category/${categorySlug}`, undefined, 4000);
    }

    /**
     * Obtiene eventos por estado
     * @param status - Estado de los eventos (draft, published, cancelled)
     * @returns Observable con la lista de eventos
     */
    getEventsByStatus(status: 'draft' | 'published' | 'cancelled'): Observable<Event[]> {
        const params = new HttpParams().set('status', status);
        return this.apiService.get('/api/eventos', params, 4000);
    }
  // Buscar eventos por nombre
    getEventByName(name: string): Observable<Event[]> {
      const params = new HttpParams().set('name', name.trim());
      return this.apiService.get(`/api/eventos`, params, 4000);
    }
    /**
     * Obtiene eventos publicados únicamente
     * @returns Observable con la lista de eventos publicados
     */
    getPublishedEvents(): Observable<Event[]> {
        return this.getEventsByStatus('published');
    }

    /**
     * Obtiene eventos próximos (desde la fecha actual)
     * @returns Observable con la lista de eventos próximos
     */
    getUpcomingEvents(): Observable<Event[]> {
        const params = new HttpParams().set('upcoming', 'true');
        return this.apiService.get('/api/eventos', params, 4000);
    }

    /**
     * Obtiene eventos en un rango de fechas
     * @param startDate - Fecha de inicio
     * @param endDate - Fecha de fin
     * @returns Observable con la lista de eventos
     */
    getEventsByDateRange(startDate: Date, endDate: Date): Observable<Event[]> {
        const params = new HttpParams()
            .set('startDate', startDate.toISOString())
            .set('endDate', endDate.toISOString());
        return this.apiService.get('/api/eventos', params, 4000);
    }
}
