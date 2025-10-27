import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() eventUnliked = new EventEmitter<string>(); // Emite el slug del evento cuando se quita el like

  constructor(
    private eventService: EventService,
    private router: Router
  ) { }

  public toggleEventLiked(event: MouseEvent, liked: boolean): void {
    // Prevenir navegación al detalle
    event.stopPropagation();
    event.preventDefault();

    if (!this.event) return;

    const wasLiked = this.event.isLiked; // Guardar el estado anterior

    this._constructToggleLikeRequest(liked).subscribe({
      next: (response) => {
        // Actualizar el evento con la respuesta del servidor
        this.event = response;

        // Si se quitó el like (estaba liked y ahora no lo está), emitir evento
        if (wasLiked && !this.event.isLiked) {
          this.eventUnliked.emit(this.event.slug);
        }
      },
      error: (err) => {
        console.error('Error al dar like:', err);
        console.log('Error status:', err.status);
        console.log('Error details:', err);
        
        // Verificar si es error de autenticación (401 o 403)
        if (err.status === 401 || err.status === 403) {
          Swal.fire({
            icon: 'warning',
            title: 'Inicia sesión',
            text: 'Debes iniciar sesión para dar like a un evento',
            confirmButtonText: 'Ir al login',
            showCancelButton: true,
            cancelButtonText: 'Cancelar'
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
