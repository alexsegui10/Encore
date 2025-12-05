import { Component, OnInit, signal, afterNextRender, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { EventService } from '../../core/services/event.service';
import { CartService } from '../../core/services/cart.service';
import { Cart, CartResponse } from '../../core/models/cart.model';
import { StripePaymentService } from '../../core/services/stripe-payment.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { DirectPurchaseService } from '../../core/services/direct-purchase.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cart = signal<Cart | null>(null);
  comprando = signal(false);
  loading = signal(true);
  processing = signal(false);
  currentUser = signal<User | null>(null);

  billingName = '';
  billingEmail = '';

  constructor(
    private eventService: EventService,
    private cartService: CartService,
    private stripePaymentService: StripePaymentService,
    private userService: UserService,
    private router: Router,
    private injector: Injector,
    private directPurchaseService: DirectPurchaseService
  ) {
    // Mount Stripe card element after render
    afterNextRender(() => {
      this.stripePaymentService.mountCardElement('card-element');
    }, { injector: this.injector });
  }

  ngOnInit(): void {

    // Subscribe to current user
    this.userService.currentUser$.subscribe(user => {
      if (user && user.uid) {
        this.currentUser.set(user);
        // Pre-fill billing details
        this.billingName = user.username || user.email || '';
        this.billingEmail = user.email || '';
      } else {
        this.currentUser.set(null);
      }
    });
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

  loadCart(): void {
    this.loading.set(true);

    // Check if it's a direct purchase
    const directPurchaseEvent = this.directPurchaseService.getDirectPurchase();

    if (directPurchaseEvent) {
      const quantity = 1;
      const price = directPurchaseEvent.price || 0;
      const cart: Cart = {
        _id: 'direct-purchase',
        userId: this.currentUser()?.uid || '',
        items: [
          {
            itemType: 'event',
            event: directPurchaseEvent,
            quantity: quantity,
            price: price,
            subtotal: quantity * price
          }
        ],
        itemCount: 1,
        total: price,
        updatedAt: new Date().toISOString()
      };
      this.cart.set(cart);
      this.loading.set(false);

      // Clear direct purchase after loading
      this.directPurchaseService.clearDirectPurchase();
    } else {
      this.cartService.getCart().subscribe({
        next: (response: CartResponse) => {
          if (!response.cart || response.cart.items.length === 0) {
            Swal.fire({
              title: 'Carrito vacío',
              text: 'No tienes eventos en tu carrito',
              icon: 'info',
              confirmButtonText: 'Ir a eventos'
            }).then(() => {
              this.router.navigate(['/']);
            });
          } else {
            this.cart.set(response.cart);
          }
          this.loading.set(false);
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar el carrito',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          this.loading.set(false);
        }
      });
    }
  }

  async processPayment(): Promise<void> {
    if (this.processing()) return;

    // Validate billing details
    if (!this.billingName || !this.billingEmail) {
      Swal.fire({
        title: 'Datos incompletos',
        text: 'Por favor completa tu nombre y email',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.billingEmail)) {
      Swal.fire({
        title: 'Email inválido',
        text: 'Por favor ingresa un email válido',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.processing.set(true);

    try {
      const user = this.currentUser();
      const currentCart = this.cart();

      if (!user || !user.uid) {
        throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
      }

      if (!currentCart || currentCart.items.length === 0) {
        throw new Error('Carrito vacío');
      }

      // Step 1: Create payment intent (SAGA starts in backend)
      const { clientSecret, orderId } = await this.stripePaymentService.createPaymentIntent({
        userUid: user.uid,
        events: currentCart.items
          .filter(item => item.itemType === 'event' && item.event)
          .map(item => ({
            eventSlug: item.event!.slug,
            quantity: item.quantity
          })),
        products: currentCart.items
          .filter(item => item.itemType === 'product' && item.product)
          .map(item => ({
            id: item.product!.id,
            name: item.product!.name,
            price: item.product!.price,
            image: item.product!.image || null,
            description: item.product!.description || null,
            quantity: item.quantity
          })),
        billingDetails: {
          name: this.billingName,
          email: this.billingEmail
        }
      });

      // Step 2: Confirm payment with Stripe
      const result = await this.stripePaymentService.confirmCardPayment(clientSecret, {
        name: this.billingName,
        email: this.billingEmail
      });

      if (result.error) {
        // Payment failed - SAGA will rollback in backend via webhook
        throw new Error(result.error.message || 'Error al procesar el pago');
      }

      // Step 3: Payment successful - show success message
      await Swal.fire({
        title: '¡Pago exitoso! 🎉',
        html: `
          <p>Tu pago ha sido procesado correctamente</p>
          <p><strong>ID de orden:</strong> ${orderId}</p>
          <p><strong>Total:</strong> ${currentCart.total.toFixed(2)}€</p>
          <p class="mt-2">Recibirás un email de confirmación en <strong>${this.billingEmail}</strong></p>
        `,
        icon: 'success',
        confirmButtonText: 'Ver mis entradas'
      });

      // Step 4: Complete cart (mark as completed instead of clearing)
      try {
        await firstValueFrom(this.cartService.completeCart());
      } catch (error) {
        // Don't throw error, payment was successful
      }

      // Step 5: Navigate to profile/orders
      this.router.navigate(['/profile']);

    } catch (error: any) {
      // Determine error message
      let errorMessage = 'Hubo un problema al procesar tu pago. Por favor, intenta de nuevo.';

      if (error.message) {
        errorMessage = error.message;
      }

      // Show user-friendly error
      Swal.fire({
        title: 'Error en el pago',
        html: `
          <p>${errorMessage}</p>
          <small class="text-muted">Si el problema persiste, contacta con soporte.</small>
        `,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      this.processing.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }
}
