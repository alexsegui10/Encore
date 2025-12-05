import { Component, signal, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/models/event.model';
import { UserService } from '../../core/services/user.service';
import { DirectPurchaseService } from '../../core/services/direct-purchase.service';
import { EnterpriseProductService } from '../../core/services/enterprise-product.service';
import Swal from 'sweetalert2';
import { CartService } from '../../core/services/cart.service';
import { DatePipe } from '@angular/common';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommentsComponent } from '../../shared/comments/comments.component';
import { MapaComponent } from '../../shared/map/map.component';
import { CarouselComponent } from '../../shared/carrusel/carousel.component';
import { MerchandisePopupComponent } from '../../shared/merchandise-popup/merchandise-popup.component';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule, DatePipe, CommentsComponent, MapaComponent, CarouselComponent, MerchandisePopupComponent],
})

export class DetailsComponent implements OnInit {
    slug: string = '';
    public isLoading = signal(true);
    public event = signal<Event | null>(null);
    public isEventOwner = false;
    public showMerchandisePopup = false;
    public loadedMerchandising: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private eventService: EventService,
        private userService: UserService,
        private cartService: CartService,
        private directPurchaseService: DirectPurchaseService,
        private enterpriseProductService: EnterpriseProductService
    ) { }

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
                this.event.set(response);
            },
            error: (err) => {
                console.error('Error al dar like:', err);
                if (err.status === 401 || err.status === 403) {
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
    public addToCart(event: MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        const currentEvent = this.event()!;

        if (!currentEvent._id) return;

        this.cartService.addToCart(currentEvent._id).subscribe({
            next: () => {
                if (currentEvent.merchandising && currentEvent.merchandising.length > 0) {
                    this.loadedMerchandising = currentEvent.merchandising.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        description: p.description,
                        image: p.image
                    }));
                    this.showMerchandisePopup = true;
                } else {
                    // No merchandising for this event
                    Swal.fire({
                        icon: 'success',
                        title: 'Añadido al carrito',
                        text: `${currentEvent.title} se añadió correctamente`,
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
            const currentEvent = this.event();
            Swal.fire({
                icon: 'success',
                title: 'Añadido al carrito',
                text: `${currentEvent?.title} se añadió correctamente`,
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
                const currentEvent = this.event();
                Swal.fire({
                    icon: 'success',
                    title: 'Añadido al carrito',
                    text: `${currentEvent?.title} y ${products.length} producto(s) de merchandising añadidos`,
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
        const currentEvent = this.event();
        Swal.fire({
            icon: 'success',
            title: 'Añadido al carrito',
            text: `${currentEvent?.title} se añadió correctamente`,
            timer: 2000,
            showConfirmButton: false
        });
    }

    public buyNow(event: MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        const currentEvent = this.event();
        if (!currentEvent) return;

        this.directPurchaseService.setDirectPurchase(currentEvent);
        this.router.navigate(['/checkout']);
    }


    private _constructToggleLikeRequest(liked: boolean): Observable<Event> {
        const currentEvent = this.event()!;

        if (liked) {
            return this.eventService.likeEvent(currentEvent.slug!);
        }

        return this.eventService.unlikeEvent(currentEvent.slug!);
    }
}
