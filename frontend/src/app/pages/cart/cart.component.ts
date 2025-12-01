import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Cart } from '../../core/models/cart.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart = signal<Cart | null>(null);
  loading = signal<boolean>(true);

  constructor(
    public cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCart();
  }

  trackByItem(index: number, item: any): string {
    if (item.itemType === 'event' && item.event) {
      return item.event._id || index.toString();
    } else if (item.itemType === 'product' && item.product) {
      return item.product.id || index.toString();
    }
    return index.toString();
  }

  getItemId(item: any): string {
    if (item.itemType === 'event' && item.event) {
      return item.event._id;
    } else if (item.itemType === 'product' && item.product) {
      return item.product.id;
    }
    return '';
  }

  loadCart(): void {
    this.loading.set(true);
    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cart.set(response.cart);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  updateQuantity(eventId: string, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(eventId);
      return;
    }
    this.cartService.updateQuantity(eventId, quantity).subscribe({
      next: (response) => {
        this.cart.set(response.cart);
      }
    });
  }

  removeItem(eventId: string): void {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: '¿Estás seguro de eliminar este producto del carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.removeItem(eventId).subscribe({
          next: (response) => {
            this.cart.set(response.cart);
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Evento eliminado del carrito',
              timer: 1500,
              showConfirmButton: false
            });
          }
        });
      }
    });
  }

  clearCart(): void {
    if (!this.cart() || this.cart()!.itemCount === 0) return;

    Swal.fire({
      title: '¿Vaciar carrito?',
      text: '¿Estás seguro de eliminar todos los productos?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.clearCart().subscribe({
          next: (response) => {
            this.cart.set(response.cart);
            Swal.fire({
              icon: 'success',
              title: 'Carrito vaciado',
              timer: 1500,
              showConfirmButton: false
            });
          }
        });
      }
    });
  }

  proceedToCheckout(): void {
    if (!this.cart() || this.cart()!.itemCount === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Carrito vacío',
        text: 'Agrega productos antes de continuar',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/shop']);
  }
}
