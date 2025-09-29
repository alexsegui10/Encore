import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Event } from '../../core/models/event.model';
import { EventService } from '../../core/services/event.service';
import { CardEventComponent } from '../card-event/card-event.component';

@Component({
  selector: 'list-events',
  standalone: true,
  imports: [CommonModule, HttpClientModule, CardEventComponent],
  templateUrl: './list-events.component.html',
  styleUrls: ['./list-events.component.css']
})
export class ListEventsComponent implements OnInit {
  events: Event[] = [];

  // Params de routing
  private routeFilters: string | null = null;
  private slug_Category: string | null = null;

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Este componente va dentro de ShopComponent, así que leemos de "self" y "parent"
    const self = this.route.snapshot.paramMap;
    const parent = this.route.parent?.snapshot.paramMap;

    this.slug_Category = self.get('slug') || parent?.get('slug') || null;
    this.routeFilters  = self.get('filters') || parent?.get('filters') || null;

    if (this.slug_Category !== null) {
      // /shop/categories/:slug
      this.loadByCategory(this.slug_Category);
    } else if (this.routeFilters !== null) {
      // /shop/:filters (base64 con JSON)
/*       const filters = this.decodeFilters(this.routeFilters);
      this.loadByFilters(filters); */
    } else {
      // /shop
      this.loadAll();
    }
  }

  private loadAll(): void {
    this.eventService.getAllEvents().subscribe({
      next: (data: any) => {
        this.events = data?.events ?? data?.items ?? data ?? [];
      },
      error: (err) => console.error('Error getAllEvents:', err)
    });
  }

  private loadByCategory(slug: string): void {
    this.eventService.getEventsByCategory(slug).subscribe({
      next: (data: any) => {
        this.events = data?.events ?? data?.items ?? data ?? [];
      },
      error: (err) => console.error('Error getEventsByCategory:', err)
    });
  }

/*   private loadByFilters(filters: any): void {
    this.eventService.getEventsByFilters(filters).subscribe({
      next: (data: any) => {
        this.events = data?.events ?? data?.items ?? data ?? [];
      },
      error: (err) => console.error('Error getEventsByFilters:', err)
    });
  } */

  private decodeFilters(encoded: string): any {
    try {
      return JSON.parse(atob(encoded));
    } catch {
      return {};
    }
  }
}
