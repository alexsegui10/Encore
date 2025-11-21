import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, Cart } from '../../core/services/cart.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cart = signal<Cart | null>(null);
  loading = signal<boolean>(true);
  stripeLineItems = signal<any[]>([]);

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCheckout();
  }

  loadCheckout(): void {
    this.loading.set(true);
    this.cartService.getCheckout().subscribe({
      next: (response) => {
        this.cart.set(response.cart);
        this.stripeLineItems.set(response.stripeLineItems);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400) {
          Swal.fire({
            icon: 'warning',
            title: 'Carrito vacío',
            text: 'No tienes eventos en el carrito',
            confirmButtonText: 'Ir a la tienda'
          }).then(() => {
            this.router.navigate(['/shop']);
          });
        }
      }
    });
  }

  confirmOrder(): void {
    Swal.fire({
      title: 'Confirmar pedido',
      text: `Total a pagar: ${this.cart()?.total.toFixed(2)}€`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'info',
          title: 'Procesando pago...',
          text: 'La integración con Stripe estará disponible próximamente',
          confirmButtonText: 'Entendido'
        }).then(() => {
          this.cartService.clearCart().subscribe({
            next: () => {
              this.router.navigate(['/shop']);
            }
          });
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }
}
