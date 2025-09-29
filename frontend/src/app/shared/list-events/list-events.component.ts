import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Event } from '../../core/models/event.model';
import { EventService } from '../../core/services/event.service';
import { CardEventComponent } from '../card-event/card-event.component';

@Component({
  selector: 'list-events',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CardEventComponent],
  templateUrl: './list-events.component.html',
  styleUrls: ['./list-events.component.css']
})
export class ListEventsComponent implements OnInit {
  events: Event[] = [];

  // Filtros UI
  q = '';
  city = '';
  dateFrom?: string;
  dateTo?: string;

  // Opciones de ciudades (derivadas)
  get cities(): string[] {
    const set = new Set(
      this.events
        .map(e => (e.location || '').trim())
        .filter(Boolean)
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (events) => { this.events = events || []; },
      error: (error) => { console.error('Error loading events:', error); }
    });
  }

  // Lógica de filtrado en memoria
  filtered(): Event[] {
    const q = this.q.trim().toLowerCase();
    const from = this.dateFrom ? new Date(this.dateFrom) : undefined;
    const to = this.dateTo ? new Date(this.dateTo) : undefined;

    return this.events.filter(ev => {
      const title = (ev.title || '').toLowerCase();
      const location = (ev.location || '').toLowerCase();
      const matchQ = !q || title.includes(q) || location.includes(q);

      const matchCity = !this.city || location === this.city.toLowerCase();

      const d = ev.date ? new Date(ev.date) : undefined;
      const matchFrom = !from || (d && d >= from);
      const matchTo = !to || (d && d <= to);

      return matchQ && matchCity && matchFrom && matchTo;
    });
  }

  applyFilters(): void {
    // Aquí solo forzamos cambio de detección si quisieras añadir algo más
  }

  clearFilters(): void {
    this.q = '';
    this.city = '';
    this.dateFrom = undefined;
    this.dateTo = undefined;
  }
}
