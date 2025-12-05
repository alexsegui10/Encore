import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../core/models/event.model';
import { Router, RouterLink } from '@angular/router';
import { EventMetaComponent } from '../event-meta/event-meta.component';
import { EventService } from '../../core/services/event.service';
import { CartService } from '../../core/services/cart.service';
import { EnterpriseProductService } from '../../core/services/enterprise-product.service';
import { MerchandisePopupComponent } from '../merchandise-popup/merchandise-popup.component';
import { Observable, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-card-event',
  standalone: true,
  imports: [CommonModule, MerchandisePopupComponent],
  templateUrl: './card-event.component.html',
  styleUrls: ['./card-event.component.css']
})
export class CardEventComponent {
  @Input() event!: Event;
  @Output() eventUnliked = new EventEmitter<string>(); // Emite el slug del evento cuando se quita el like

  public showMerchandisePopup = false;
  public merchandiseProducts: any[] = [];

  constructor(
    private eventService: EventService,
    private cartService: CartService,
    private enterpriseProductService: EnterpriseProductService,
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

  public addToCart(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.event._id) return;

    this.cartService.addToCart(this.event._id).subscribe({
      next: () => {
        if (this.event.merchandising && this.event.merchandising.length > 0) {
          this.merchandiseProducts = this.event.merchandising.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            description: p.description,
            image: p.image
          }));
          this.showMerchandisePopup = true;
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Añadido al carrito',
            text: `${this.event.title} se añadió correctamente`,
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          Swal.fire({
            icon: 'warning',
            title: 'Inicia sesión',
            text: 'Debes iniciar sesión para añadir al carrito',
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
            text: 'No se pudo añadir al carrito',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  }

  public onProductsSelected(products: any[]): void {
    if (products.length === 0) {
      this.showMerchandisePopup = false;
      Swal.fire({
        icon: 'success',
        title: 'Añadido al carrito',
        text: `${this.event.title} se añadió correctamente`,
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    // Add all selected products to cart
    const addProductRequests = products.map(product =>
      this.cartService.addProductToCart(product.id, product, 1)
    );

    forkJoin(addProductRequests).subscribe({
      next: () => {
        this.showMerchandisePopup = false;
        Swal.fire({
          icon: 'success',
          title: 'Añadido al carrito',
          text: `${this.event.title} y ${products.length} producto(s) de merchandising añadidos`,
          timer: 2500,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.showMerchandisePopup = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al añadir los productos',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  public onMerchandiseCancelled(): void {
    this.showMerchandisePopup = false;
    Swal.fire({
      icon: 'success',
      title: 'Añadido al carrito',
      text: `${this.event.title} se añadió correctamente`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  public navigateToDetail(event: MouseEvent): void {
    // Solo navegar si no se hizo click en el botón de like o en el botón de comprar
    const target = event.target as HTMLElement;
    if (!target.closest('.like-button') && !target.closest('.cta')) {
      this.router.navigate(['/details', this.event.slug]);
    }
  }
}
