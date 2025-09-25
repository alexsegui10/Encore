import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventRequest, UpdateEventRequest } from '../models/event.model';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private readonly apiUrl = 'http://localhost:3000/api/eventos';

    constructor(private http: HttpClient) { }

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

        return this.http.get<Event[]>(this.apiUrl, { params: httpParams });
    }

    /**
     * Obtiene un evento específico por su slug
     * @param slug - Identificador único del evento
     * @returns Observable con el evento
     */
    getEventBySlug(slug: string): Observable<Event> {
        return this.http.get<Event>(`${this.apiUrl}/${slug}`);
    }

    /**
     * Obtiene un evento específico por su ID
     * @param id - ID del evento
     * @returns Observable con el evento
     */
    getEventById(id: string): Observable<Event> {
        return this.http.get<Event>(`${this.apiUrl}/${id}`);
    }

    /**
     * Crea un nuevo evento
     * @param eventData - Datos del evento a crear
     * @returns Observable con el evento creado
     */
    createEvent(eventData: CreateEventRequest): Observable<Event> {
        return this.http.post<Event>(this.apiUrl, eventData);
    }

    /**
     * Actualiza un evento existente
     * @param slug - Slug del evento a actualizar
     * @param eventData - Datos a actualizar
     * @returns Observable con el evento actualizado
     */
    updateEvent(slug: string, eventData: UpdateEventRequest): Observable<Event> {
        return this.http.put<Event>(`${this.apiUrl}/${slug}`, eventData);
    }

    /**
     * Elimina un evento
     * @param slug - Slug del evento a eliminar
     * @returns Observable con el resultado de la operación
     */
    deleteEvent(slug: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${slug}`);
    }

    /**
     * Busca eventos por título
     * @param title - Título o parte del título a buscar
     * @returns Observable con la lista de eventos que coinciden
     */
    searchEventsByTitle(title: string): Observable<Event[]> {
        const params = new HttpParams().set('title', title);
        return this.http.get<Event[]>(this.apiUrl, { params });
    }

    /**
     * Obtiene eventos por categoría
     * @param categoryId - ID de la categoría
     * @returns Observable con la lista de eventos de la categoría
     */
    getEventsByCategory(categoryId: string): Observable<Event[]> {
        const params = new HttpParams().set('category', categoryId);
        return this.http.get<Event[]>(this.apiUrl, { params });
    }

    /**
     * Obtiene eventos por estado
     * @param status - Estado de los eventos (draft, published, cancelled)
     * @returns Observable con la lista de eventos
     */
    getEventsByStatus(status: 'draft' | 'published' | 'cancelled'): Observable<Event[]> {
        const params = new HttpParams().set('status', status);
        return this.http.get<Event[]>(this.apiUrl, { params });
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
        return this.http.get<Event[]>(this.apiUrl, { params });
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
        return this.http.get<Event[]>(this.apiUrl, { params });
    }
}
