import { Injectable, signal } from '@angular/core';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class DirectPurchaseService {
  private directPurchaseEvent = signal<Event | null>(null);

  setDirectPurchase(event: Event): void {
    this.directPurchaseEvent.set(event);
  }

  getDirectPurchase(): Event | null {
    return this.directPurchaseEvent();
  }

  clearDirectPurchase(): void {
    this.directPurchaseEvent.set(null);
  }

  hasDirectPurchase(): boolean {
    return this.directPurchaseEvent() !== null;
  }
}
