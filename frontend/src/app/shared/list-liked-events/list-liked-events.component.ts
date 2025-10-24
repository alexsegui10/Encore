import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../core/models/event.model';
import { EventService } from '../../core/services/event.service';
import { CardEventComponent } from '../card-event/card-event.component';

@Component({
    selector: 'app-list-liked-events',
    standalone: true,
    imports: [CommonModule, CardEventComponent],
    templateUrl: './list-liked-events.component.html',
    styleUrls: ['./list-liked-events.component.css']
})
export class ListLikedEventsComponent implements OnInit {
    likedEvents = signal<Event[]>([]);
    isLoading = signal<boolean>(true);
    errorMessage = signal<string>('');

    constructor(private eventService: EventService) { }

    ngOnInit(): void {
        this.loadLikedEvents();
    }

    private loadLikedEvents(): void {
        this.isLoading.set(true);
        this.errorMessage.set('');

        this.eventService.getLikedEvents().subscribe({
            next: (response: any) => {
                console.log('Liked events received:', response);
                // El backend devuelve { events: [...], eventsCount: number }
                this.likedEvents.set(response.events || []);
                this.isLoading.set(false);
            },
            error: (err: any) => {
                console.error('Error loading liked events:', err);
                
                // Si es error de autenticación, simplemente mostrar vacío
                if (err.status === 401 || err.status === 403) {
                    this.likedEvents.set([]);
                    this.errorMessage.set('Inicia sesión para ver tus eventos favoritos');
                } else {
                    this.errorMessage.set('Error al cargar los eventos favoritos');
                }
                
                this.isLoading.set(false);
            }
        });
    }

    // Método para refrescar la lista (útil cuando se quita un like)
    public refresh(): void {
        this.loadLikedEvents();
    }

    // Método para eliminar un evento de la lista de forma reactiva
    public onEventUnliked(eventSlug: string): void {
        console.log('Evento unliked:', eventSlug);
        // Filtrar el evento de la lista usando el signal
        this.likedEvents.update(events => 
            events.filter(event => event.slug !== eventSlug)
        );
    }
}
