import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Filters } from '../../core/models/filters.model';
import { RagService } from '../../core/services/rag.service';
import { EventBusService } from '../../core/services/event-bus.service';
import { Event } from '../../core/models/event.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SearchComponent implements OnInit {
  @Output() searchEvent: EventEmitter<Filters> = new EventEmitter();

  search_value: string | undefined = '';
  listEvents: Event[] = [];
  filters: Filters = new Filters();
  routeFilters!: string | null;

  aiLoading = signal(false);
  aiError = signal<string | null>(null);

  constructor(
    private ragService: RagService,
    private eventBusService: EventBusService,
    private Router: Router,
    private ActivatedRoute: ActivatedRoute,
    private Location: Location
  ) {
    this.routeFilters = this.ActivatedRoute.snapshot.paramMap.get('filters');
  }

  ngOnInit() {
    if (this.routeFilters !== null) {
      this.filters = JSON.parse(atob(this.routeFilters));
    }
    this.search_value = this.filters.name || undefined;
  }

  public search_event(data: any): void {
    this.searchWithAI();
  }

  searchWithAI() {
    const question = this.search_value?.trim();
    if (!question) {
      this.aiError.set('Por favor, escribe una pregunta');
      return;
    }

    this.aiLoading.set(true);
    this.aiError.set(null);

    this.ragService.askQuestion(question).subscribe({
      next: (res) => {
        this.aiLoading.set(false);
        const events = res.relatedEvents || [];

        this.eventBusService.setAIEvents(events, events.length);
        this.listEvents = events;
      },
      error: (err) => {
        console.error('Error:', err);
        this.aiLoading.set(false);

        if (err.status === 503) {
          this.aiError.set('LM Studio no disponible');
        } else {
          this.aiError.set('Error en búsqueda IA');
        }
      }
    });
  }
}
