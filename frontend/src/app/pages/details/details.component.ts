import { Component, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { CarouselComponent } from '../../shared/carrusel/carousel.component';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/models/event.model';
import { MapaComponent } from '../../shared/map/map.component';
import { UserService } from '../../core/services/user.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { EventMetaComponent } from "../../shared/event-meta/event-meta.component";
import { Observable } from 'rxjs';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule, CarouselModule, CarouselComponent, MapaComponent, DatePipe, EventMetaComponent],
})

export class DetailsComponent implements OnInit {
    slug: string = '';
    public isLoading = signal(true);
    public event = signal<Event | null>(null);
    public isEventOwner = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private eventService: EventService,
        private userService: UserService
    ) {
        // Effect para reaccionar al signal de logout
        effect(() => {
            const logoutCount = this.userService.logoutSignal();
            if (logoutCount > 0 && this.slug) {
                this.getEvent();
            }
        });
    }

    ngOnInit(): void {
        this.slug = this.route.snapshot.params['slug'];
        if (this.slug) {
            this.getEvent();
        }
    }

    getEvent(): void {
        this.eventService.getEventBySlug(this.slug).subscribe({
            next: (event) => {
                this.event.set(event);
                this.checkIfOwner();
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Error:', error);
                this.isLoading.set(false);

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

    checkIfOwner(): void {
        // Implementa la lógica para verificar si el usuario actual es el propietario del evento
        // Por ahora lo dejamos en false, pero puedes comparar con el usuario actual
        this.userService.getCurrentUser().subscribe({
            next: (currentUser) => {
                // this.isEventOwner = currentUser && currentUser.id === this.event()?.createdBy;
                // Temporalmente false hasta implementar createdBy en el modelo
                this.isEventOwner = false;
            },
            error: () => {
                this.isEventOwner = false;
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

    public toggleEventLiked(liked: boolean): void {
        if (!this.event()) return;

        const currentEvent = this.event()!;

        this._constructToggleLikeRequest(liked).subscribe({
            next: (response) => {
                // Actualizar el evento con la respuesta del servidor
                this.event.set(response);
            },
            error: (err) => {
                console.error('❌ Error al dar like:', err);
                // Si el usuario no está autenticado, redirigir al login
                if (err.status === 401) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Inicia sesión',
                        text: 'Debes iniciar sesión para dar like a un evento',
                        confirmButtonText: 'Ir al login'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.router.navigateByUrl('/auth/login');
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo procesar tu solicitud. Intenta de nuevo.',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
    }

    private _constructToggleLikeRequest(liked: boolean): Observable<Event> {
        const currentEvent = this.event()!;

        if (liked) {
            return this.eventService.likeEvent(currentEvent.slug!);
        }

        return this.eventService.unlikeEvent(currentEvent.slug!);
    }

    public deleteEvent(): void {
        if (!this.event()) return;

        Swal.fire({
            icon: 'warning',
            title: '¿Eliminar evento?',
            text: 'Esta acción no se puede deshacer',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc3545'
        }).then((result) => {
            if (result.isConfirmed) {
                this.eventService.deleteEvent(this.event()!.slug!).subscribe({
                    next: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Evento eliminado',
                            text: 'El evento ha sido eliminado correctamente',
                            confirmButtonText: 'OK'
                        }).then(() => {
                            this.router.navigateByUrl('/');
                        });
                    },
                    error: (err) => {
                        console.error('Error al eliminar:', err);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo eliminar el evento. Intenta de nuevo.',
                            confirmButtonText: 'OK'
                        });
                    }
                });
            }
        });
    }
}
