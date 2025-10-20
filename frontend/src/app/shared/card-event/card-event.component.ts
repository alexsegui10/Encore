import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../core/models/event.model';
import { Router, RouterLink } from '@angular/router';
import { EventMetaComponent } from '../event-meta/event-meta.component';
import { EventService } from '../../core/services/event.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-card-event',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-event.component.html',
  styleUrls: ['./card-event.component.css']
})
export class CardEventComponent {
  @Input() event!: Event;

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  public toggleEventLiked(event: MouseEvent, liked: boolean): void {
    // Prevenir navegación al detalle
    event.stopPropagation();
    event.preventDefault();

    if (!this.event) return;

    this._constructToggleLikeRequest(liked).subscribe({
      next: (response) => {
        // Actualizar el evento con la respuesta del servidor
        this.event = response;
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
    if (liked) {
      return this.eventService.likeEvent(this.event.slug!);
    }
    return this.eventService.unlikeEvent(this.event.slug!);
  }

  public navigateToDetail(event: MouseEvent): void {
    // Solo navegar si no se hizo click en el botón de like
    if (!(event.target as HTMLElement).closest('.like-button')) {
      this.router.navigate(['/details', this.event.slug]);
    }
  }
}
