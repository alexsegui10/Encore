import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Event } from '../../core/models/event.model';
import { EventService } from '../../core/services/event.service';
import { CardEventComponent } from '../card-event/card-event.component';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { Filters } from '../../core/models/filters.model';
import { SearchComponent } from '../search/search.component';
import { PaginationComponent } from  '../pagination/pagination.component';
import { FiltersComponent } from '../filters/filters.component';
import { UserService } from '../../core/services/user.service';
@Component({
  selector: 'list-events',
  standalone: true,
  imports: [CommonModule, HttpClientModule, CardEventComponent, FiltersComponent, SearchComponent, PaginationComponent],
  templateUrl: './list-events.component.html',
  styleUrls: ['./list-events.component.css']
})
export class ListEventsComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  cat_id: string | null = null;
  listCategories: Category[] = [];
  filters = new Filters();
  offset: number = 0;
  limit: number = 4;
  totalPages: Array<number> = [];
  currentPage: number = 1;

  // Params de routing
  private routeFilters: string | null = null;
  private slug_Category: string | null = null;
  private subscription = new Subscription();

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private CategoryService: CategoryService,
   private Location: Location,
   private userService: UserService
  ) {
    // Effect para reaccionar al logout - recargar eventos para actualizar likes
    effect(() => {
      const logoutCount = this.userService.logoutSignal();
      if (logoutCount > 0) {
        console.log('🔄 Detectado logout - recargando eventos');
        this.loadEvents();
      }
    });

    // Effect para reaccionar al login - recargar eventos para actualizar likes
    effect(() => {
      const loginCount = this.userService.loginSignal();
      if (loginCount > 0) {
        console.log('🔄 Detectado login - recargando eventos');
        this.loadEvents();
      }
    });
  }

  ngOnInit(): void {
    this.routeFilters = this.route.snapshot.paramMap.get('filters');
    this.slug_Category = this.route.snapshot.paramMap.get('slug');

    // Cargar categorías primero
    this.getListForCategory();

    // Cargar inicial
    this.loadEvents();
    if (this.slug_Category !== null) {
      this.getListForCategory();
    }

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
        const eventCount = data.event_count || 0;
        const limit = this.limit > 0 ? this.limit : 1;
        const totalPagesCount = Math.max(1, Math.ceil(eventCount / limit));
        this.totalPages = Array.from(new Array(totalPagesCount), (val, index) => index + 1);
        console.log('All events data received:', data);
        this.events = data?.events ?? data?.items ?? data ?? [];
        console.log('Processed events (all):', this.events);
      },
      error: (err) => console.error('Error getAllEvents:', err)
    });
  }

  get_list_filtered(filters: Filters) {
    this.filters = filters;
    // console.log(JSON.stringify(this.filters));
    this.eventService.get_products_filter(filters).subscribe({
      next: (data: any) => {
        console.log('Filtered events data received:', data);
        this.events = data.events || [];

        // Validate data before creating array
        const eventCount = data.event_count || 0;
        const limit = this.limit > 0 ? this.limit : 1;
        const totalPagesCount = Math.max(1, Math.ceil(eventCount / limit));

        this.totalPages = Array.from(new Array(totalPagesCount), (val, index) => index + 1);
        console.log('Processed filtered events:', this.events);
      },
      error: (err) => {
        console.error('Error getting filtered events:', err);
        this.events = [];
      }
    });
  }

  getListForCategory() {
    this.CategoryService.all_categories_select().subscribe(
      (data: any) => {
        this.listCategories = data.categories;
      }
    );
  }


  loadByCategory(slug: string): void {
    console.log('Loading events by category:', slug);
    this.eventService.getEventsByCategory(slug).subscribe({
      next: (data: any) => {
        const eventCount = data.event_count || 0;
        const limit = this.limit > 0 ? this.limit : 1;
        const totalPagesCount = Math.max(1, Math.ceil(eventCount / limit));
        this.totalPages = Array.from(new Array(totalPagesCount), (val, index) => index + 1);
        console.log('Events data received:', data);
        this.events = data?.events ?? data?.items ?? data ?? [];
        console.log('Processed events:', this.events);
      },
      error: (err) => {
        console.error('Error getEventsByCategory:', err);
      }
    });
  }

  refreshRouteFilter() {
    this.routeFilters = this.route.snapshot.paramMap.get('filters');
    if (typeof (this.routeFilters) == "string") {
      this.filters = JSON.parse(atob(this.routeFilters));
    } else {
      this.filters = new Filters();
    }
  }
    setPageTo(pageNumber: number) {

    this.currentPage = pageNumber;

    if (typeof this.routeFilters === 'string') {
      this.refreshRouteFilter();
    }

    if (this.limit) {
      this.filters.limit = this.limit;
      this.filters.offset = this.limit * (this.currentPage - 1);
    }

    if (this.currentPage == null || this.currentPage == 1) {
      this.Location.replaceState('/shop/');
    } else {
      this.Location.replaceState('/shop/' + btoa(JSON.stringify(this.filters)));
    }
    // console.log(this.Location);

    this.get_list_filtered(this.filters);
    console.log(`Current page: ${this.currentPage}`);
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
