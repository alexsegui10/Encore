import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Event } from '../../core/models/event.model';
import { EventService } from '../../core/services/event.service';
import { EventBusService } from '../../core/services/event-bus.service';
import { CardEventComponent } from '../card-event/card-event.component';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { Filters } from '../../core/models/filters.model';
import { SearchComponent } from '../search/search.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { FiltersComponent } from '../filters/filters.component';
import { Subscription } from 'rxjs';

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
  private aiEventsSubscription?: Subscription;
  private allAIEvents: Event[] = [];
  private isAISearchActive: boolean = false;

  constructor(
    private eventService: EventService,
    private eventBusService: EventBusService,
    private route: ActivatedRoute,
    private CategoryService: CategoryService,
    private Location: Location
  ) { }

  ngOnInit(): void {
    this.routeFilters = this.route.snapshot.paramMap.get('filters');
    this.slug_Category = this.route.snapshot.paramMap.get('slug');

    // Cargar categorías primero
    this.getListForCategory();

    // Subscribe to AI events
    this.aiEventsSubscription = this.eventBusService.aiEvents$.subscribe(aiEventsData => {
      if (aiEventsData !== null) {
        this.allAIEvents = aiEventsData.events;
        this.isAISearchActive = true;
        const totalCount = aiEventsData.totalCount;

        const startIndex = this.offset;
        const endIndex = startIndex + this.limit;

        this.events = this.allAIEvents.slice(startIndex, endIndex);

        const totalPagesCount = Math.max(1, Math.ceil(totalCount / this.limit));
        this.totalPages = Array.from(new Array(totalPagesCount), (val, index) => index + 1);

        this.currentPage = Math.floor(this.offset / this.limit) + 1;
      } else {
        this.isAISearchActive = false;
        this.allAIEvents = [];
      }
    });

    // Cargar inicial
    this.loadEvents();
    if (this.slug_Category !== null) {
      this.getListForCategory();
    }

  }

  ngOnDestroy(): void {
    this.aiEventsSubscription?.unsubscribe();
  }

  private loadEvents(): void {
    if (this.slug_Category) {
      this.loadByCategory(this.slug_Category);
    } else {
      this.loadAll();
    }
  }

  private loadAll(): void {
    const params = { limit: this.limit, offset: this.offset };
    this.eventService.getAllEvents(params).subscribe({
      next: (data: any) => {
        const eventCount = data.event_count || 0;
        const limit = this.limit > 0 ? this.limit : 1;
        const totalPagesCount = Math.max(1, Math.ceil(eventCount / limit));
        this.totalPages = Array.from(new Array(totalPagesCount), (val, index) => index + 1);
        this.events = data?.events ?? data?.items ?? data ?? [];
      },
      error: (err) => { }
    });
  }

  get_list_filtered(filters: Filters) {
    this.filters = filters;
    this.eventService.get_products_filter(filters).subscribe({
      next: (data: any) => {
        this.events = data.events || [];

        // Validate data before creating array
        const eventCount = data.event_count || 0;
        const limit = this.limit > 0 ? this.limit : 1;
        const totalPagesCount = Math.max(1, Math.ceil(eventCount / limit));

        this.totalPages = Array.from(new Array(totalPagesCount), (val, index) => index + 1);
      },
      error: (err) => {

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
    const params = { limit: this.limit, offset: this.offset };
    this.eventService.getEventsByCategory(slug, params).subscribe({
      next: (data: any) => {
        const eventCount = data.event_count || 0;
        const limit = this.limit > 0 ? this.limit : 1;
        const totalPagesCount = Math.max(1, Math.ceil(eventCount / limit));
        this.totalPages = Array.from(new Array(totalPagesCount), (val, index) => index + 1);
        this.events = data?.events ?? data?.items ?? data ?? [];
      },
      error: (err) => {

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

    if (this.isAISearchActive && this.allAIEvents.length > 0) {
      this.offset = this.limit * (this.currentPage - 1);

      const startIndex = this.offset;
      const endIndex = startIndex + this.limit;

      this.events = this.allAIEvents.slice(startIndex, endIndex);
      return;
    }

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

    this.get_list_filtered(this.filters);
  }

  changeItemsPerPage(newLimit: number): void {
    this.limit = newLimit;
    this.filters.limit = newLimit;
    this.currentPage = 1;
    this.offset = 0;
    this.filters.offset = 0;

    if (this.slug_Category) {
      this.loadByCategory(this.slug_Category);
    } else {
      this.loadAll();
    }
  }

  /*   private loadByFilters(filters: any): void {
      this.eventService.getEventsByFilters(filters).subscribe({
        next: (data: any) => {
          this.events = data?.events ?? data?.items ?? data ?? [];
        },
        error: (err) => {}
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
