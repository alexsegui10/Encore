import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class ListEventsComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  cat_id: string | null = null;
  // Params de routing
  private routeFilters: string | null = null;
  private slug_Category: string | null = null;
  private subscription = new Subscription();

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios de parámetros
    this.subscription.add(
      this.route.params.subscribe(params => {
        this.slug_Category = params['slug'] || null;
        console.log('Route params changed - slug:', this.slug_Category);
        this.loadEvents();
      })
    );

    // También revisar los parámetros del padre (parent route)
    this.subscription.add(
      this.route.parent?.params.subscribe(parentParams => {
        if (!this.slug_Category) {
          this.slug_Category = parentParams?.['slug'] || null;
          console.log('Parent route params - slug:', this.slug_Category);
          this.loadEvents();
        }
      }) || new Subscription()
    );

    // Cargar inicial
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadEvents(): void {
    if (this.slug_Category) {
      this.loadByCategory(this.slug_Category);
    } else {
      this.loadAll();
    }
  }

  private loadAll(): void {
    console.log('Loading all events');
    this.eventService.getAllEvents().subscribe({
      next: (data: any) => {
        console.log('All events data received:', data);
        this.events = data?.events ?? data?.items ?? data ?? [];
        console.log('Processed events (all):', this.events);
      },
      error: (err) => console.error('Error getAllEvents:', err)
    });
  }

  loadByCategory(slug: string): void {
    console.log('Loading events by category:', slug);
    this.eventService.getEventsByCategory(slug).subscribe({
      next: (data: any) => {
        console.log('Events data received:', data);
        this.events = data?.events ?? data?.items ?? data ?? [];
        console.log('Processed events:', this.events);
      },
      error: (err) => {
        console.error('Error getEventsByCategory:', err);
      }
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
