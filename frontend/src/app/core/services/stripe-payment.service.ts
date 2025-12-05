import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

export interface PaymentIntentRequest {
    userUid: string;
    events: Array<{
        eventSlug: string;
        quantity: number;
    }>;
    products?: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    billingDetails?: {
        name: string;
        email: string;
    };
}

export interface PaymentIntentResponse {
    clientSecret: string;
    orderId: string;
}

@Injectable({
    providedIn: 'root'
})
export class StripePaymentService {
    private apiUrl = 'http://localhost:4000/api/payments';
    private stripePromise: Promise<Stripe | null>;
    private stripe: Stripe | null = null;
    private elements: StripeElements | null = null;
    private cardElement: StripeCardElement | null = null;

    constructor(private http: HttpClient) {
        // Load Stripe with publishable key from environment
        this.stripePromise = loadStripe(environment.stripe.publishableKey);
    }

    async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
        try {
            const response = await firstValueFrom(
                this.http.post<PaymentIntentResponse>(`${this.apiUrl}/create-intent`, request)
            );
            return response;
        } catch (error: any) {
            throw new Error(
                error.error?.error || error.message || 'Error al crear la intención de pago'
            );
        }
    }

    getOrderStatus(orderId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/order/${orderId}`);
    }
    async getStripe(): Promise<Stripe | null> {
        if (!this.stripe) {
            this.stripe = await this.stripePromise;
        }
        return this.stripe;
    }

    async mountCardElement(elementId: string): Promise<void> {
        try {
            const stripe = await this.getStripe();
            if (!stripe) {
                throw new Error('Stripe no se pudo cargar. Verifica tu conexión a internet.');
            }

            // Destroy previous card element if exists
            if (this.cardElement) {
                this.cardElement.destroy();
            }

            this.elements = stripe.elements();

            this.cardElement = this.elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#32325d',
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        '::placeholder': {
                            color: '#9ca3af',
                        },
                    },
                    invalid: {
                        color: '#ef4444',
                        iconColor: '#ef4444',
                    },
                },
                hidePostalCode: false,
            });

            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Element with id "${elementId}" not found`);
            }

            this.cardElement.mount(`#${elementId}`);

            // Listen for validation errors
            this.cardElement.on('change', (event) => {
                const displayError = document.getElementById('card-errors');
                if (displayError) {
                    if (event.error) {
                        displayError.textContent = event.error.message;
                    } else {
                        displayError.textContent = '';
                    }
                }
            });
        } catch (error) {
            throw error;
        }
    }

    async confirmCardPayment(clientSecret: string, billingDetails: any): Promise<any> {
        try {
            const stripe = await this.getStripe();
            if (!stripe) {
                throw new Error('Stripe no está inicializado');
            }

            if (!this.cardElement) {
                throw new Error('Elemento de tarjeta no está montado. Recarga la página.');
            }

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: this.cardElement,
                    billing_details: billingDetails,
                },
            });

            if (result.error) {
                throw new Error(result.error.message || 'Error al confirmar el pago');
            }

            return result;
        } catch (error: any) {
            throw error;
        }
    }

    destroyCardElement(): void {
        if (this.cardElement) {
            this.cardElement.destroy();
            this.cardElement = null;
        }
        this.elements = null;
    }

    getCardElement(): StripeCardElement | null {
        return this.cardElement;
    }
}
