import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Filters } from '../../core/models/filters.model';
import { EventService } from '../../core/services/event.service';
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
  search: any;


  constructor(
    private EventService: EventService,
    private Router: Router,
    private ActivatedRoute: ActivatedRoute,
    private Location: Location
  ) {
    this.routeFilters = this.ActivatedRoute.snapshot.paramMap.get('filters');
  }

  ngOnInit() {
    if (this.routeFilters !== null) {
      console.log('dentro');
      this.filters = JSON.parse(atob(this.routeFilters));
    }
    this.search_value = this.filters.name || undefined;
    // console.log(this.search_value);
  }


  public type_event(writtingValue: any): void {
    this.routeFilters = this.ActivatedRoute.snapshot.paramMap.get('filters');
    this.search = writtingValue;
    this.filters.name = writtingValue;

      setTimeout(() => {

          this.searchEvent.emit(this.filters);
          this.Location.replaceState('/shop/' + btoa(JSON.stringify(this.filters)));

        if (this.search.length != 0){
          this.getListEvents()
      }
    }, 150);
    this.filters.name = this.search;
    this.filters.offset = 0;
  }



    getListEvents() {
      this.EventService.getEventByName(this.search).subscribe(
        (data: any) => {
          this.listEvents = data.events;
          console.log(this.listEvents);
          if(data === null ){
            console.log('error')
          }
        });

    }

    public search_event(data: any): void {
      if (typeof data.search_value === 'string') {
        this.filters.name = data.search_value;
        this.filters.offset = 0;
        this.Router.navigate(['/shop/' + btoa(JSON.stringify(this.filters))]);
        // console.log(this.filters);
      }
    }

}
