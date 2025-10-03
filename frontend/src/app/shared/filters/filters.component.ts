import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Category } from '../../core/models/category.model';
import { Event } from '../../core/models/event.model';
import { Filters } from '../../core/models/filters.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})

export class FiltersComponent implements OnInit {

  @Input() listCategories: Category[] = [];
  @Output() eventofiltros: EventEmitter<Filters> = new EventEmitter();

  routeFilters: string | null = null;
  filters!: Filters

  id_cat: string = "";
  price_max: number | undefined;
  price_min: number | undefined;

  constructor(private ActivatedRoute: ActivatedRoute, private Router: Router, private Location: Location) {
    this.routeFilters = this.ActivatedRoute.snapshot.paramMap.get('filters');
  }

  ngOnInit(): void {
    this.ActivatedRoute.snapshot.paramMap.get('filters') != undefined ? this.Highlights() : "";
    this.routeFilters = this.ActivatedRoute.snapshot.paramMap.get('filters');
  }

  public filter_products() {
    this.routeFilters = this.ActivatedRoute.snapshot.paramMap.get('filters');
    console.log('Route filters:', this.routeFilters);

    // Crear un nuevo objeto de filtros
    this.filters = new Filters();

    // Si hay filtros en la URL, parsearlos
    if (this.routeFilters != null) {
      try {
        const urlFilters = JSON.parse(atob(this.routeFilters));
        this.filters = new Filters(
          urlFilters.limit,
          urlFilters.offset,
          urlFilters.price_min,
          urlFilters.price_max,
          urlFilters.category,
          urlFilters.name
        );
      } catch (error) {
        console.error('Error parsing filters from URL:', error);
        this.filters = new Filters();
      }
    }

    // Aplicar filtros del formulario
    if (this.id_cat && this.id_cat !== '') {
      this.filters.category = this.id_cat;
    }

    // Calcular y validar precios
    this.price_calc(this.price_min, this.price_max);
    this.filters.price_min = this.price_min;
    this.filters.price_max = this.price_max;

    console.log('Applied filters:', this.filters);

    setTimeout(() => {
      this.Location.replaceState('/shop/' + btoa(JSON.stringify(this.filters)));
      this.eventofiltros.emit(this.filters);
    }, 200);
  }

  public price_calc(price_min: number | undefined, price_max: number | undefined) {
    // Si ambos precios están definidos y el mínimo es mayor que el máximo, ajustar
    if (typeof price_min === 'number' && typeof price_max === 'number' && price_min > price_max) {
      // Intercambiar los valores
      this.price_min = price_max;
      this.price_max = price_min;
    } else {
      // Asignar los valores normalmente
      this.price_min = price_min;
      this.price_max = price_max;
    }
  }

  public remove_filters() {
    // Resetear todos los filtros
    this.id_cat = "";
    this.price_min = undefined;
    this.price_max = undefined;
    this.filters = new Filters();

    // Navegar a la página sin filtros
    window.location.assign("http://localhost:4200/shop");
  }

  Highlights() {
    const routeFiltersParam = this.ActivatedRoute.snapshot.paramMap.get('filters');

    if (routeFiltersParam) {
      try {
        const routeFilters = JSON.parse(atob(routeFiltersParam));

        // Solo aplicar si no hay búsqueda activa
        if (!routeFilters.search) {
          this.id_cat = routeFilters.category || '';
          this.price_min = routeFilters.price_min;
          this.price_max = routeFilters.price_max;
        }
      } catch (error) {
        console.error('Error parsing route filters in Highlights:', error);
        // Resetear valores en caso de error
        this.id_cat = '';
        this.price_min = undefined;
        this.price_max = undefined;
      }
    }
  }
}