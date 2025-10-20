import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { CarouselComponent } from '../../shared/carrusel/carousel.component';
import { CommentsComponent } from '../../shared/comments/comments.component';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/models/event.model';
import { MapaComponent } from '../../shared/map/map.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule, CarouselModule, CarouselComponent, MapaComponent, CommentsComponent],
})

export class DetailsComponent implements OnInit {
    event: Event | null = null;
    slug: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private eventService: EventService
    ) {}

    ngOnInit(): void {
        this.slug = this.route.snapshot.params['slug'];
        if (this.slug) {
            this.getEvent();
        }
    }

    getEvent(): void {
        this.eventService.getEventBySlug(this.slug).subscribe({
            next: (event) => {
                this.event = event;
            },
            error: (error) => {
                console.error('Error:', error);

                Swal.fire({
                    icon: 'error',
                    title: 'Evento no encontrado',
                    text: 'No se pudo cargar la información del evento. Puede que no exista o haya sido eliminado.',
                    confirmButtonText: 'Volver al inicio'
                }).then(() => {
                    this.router.navigateByUrl('/');
                });
            }
        });
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'published':
                return 'Disponible';
            case 'draft':
                return 'Borrador';
            case 'cancelled':
                return 'Cancelado';
            default:
                return status;
        }
    }
}
