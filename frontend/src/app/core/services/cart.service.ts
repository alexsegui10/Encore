import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CartResponse } from '../models/cart.model';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:4000/api/cart';
  private http = inject(HttpClient);
  private jwtService = inject(JwtService);

  public cartCount = signal<number>(0);
  public cartTotal = signal<number>(0);

  constructor() {
    // Solo cargar el carrito si el usuario es cliente (NO admin ni enterprise)
    const role = this.jwtService.getUserRole();
    if (role === 'cliente' || role === null) {
      this.loadCart();
    }
  }

  private loadCart(): void {
    this.getCart().subscribe({
      next: (response) => {
        this.cartCount.set(response.cart.itemCount);
        this.cartTotal.set(response.cart.total);
      },
      error: () => { }
    });
  }

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.apiUrl).pipe(
      tap(response => {
        this.cartCount.set(response.cart.itemCount);
        this.cartTotal.set(response.cart.total);
      })
    );
  }

  addToCart(eventId: string, quantity: number = 1): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.apiUrl}/add`, { eventId, quantity }).pipe(
      tap(response => {
        this.cartCount.set(response.cart.itemCount);
        this.cartTotal.set(response.cart.total);
      })
    );
  }

  updateQuantity(eventId: string, quantity: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.apiUrl}/item/${eventId}`, { quantity }).pipe(
      tap(response => {
        this.cartCount.set(response.cart.itemCount);
        this.cartTotal.set(response.cart.total);
      })
    );
  }

  removeItem(eventId: string): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.apiUrl}/item/${eventId}`).pipe(
      tap(response => {
        this.cartCount.set(response.cart.itemCount);
        this.cartTotal.set(response.cart.total);
      })
    );
  }

  clearCart(): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.apiUrl}/clear`).pipe(
      tap(response => {
        this.cartCount.set(0);
        this.cartTotal.set(0);
      })
    );
  }

  getCheckout(): Observable<CartResponse & { stripeLineItems: any[] }> {
    return this.http.get<CartResponse & { stripeLineItems: any[] }>(`${this.apiUrl}/checkout`);
  }
}
