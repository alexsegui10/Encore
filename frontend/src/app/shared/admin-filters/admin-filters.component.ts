import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-admin-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-filters.component.html',
  styleUrls: ['./admin-filters.component.css']
})
export class AdminFiltersComponent {
  @Input() title: string = 'Filtros';
  @Input() filterLabel: string = 'Estado';
  @Input() filterOptions: FilterOption[] = [];
  @Output() filterChange = new EventEmitter<string>();

  selectedValue: string = 'all';

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedValue = select.value;
    this.filterChange.emit(this.selectedValue);
  }

  clearFilters() {
    this.selectedValue = 'all';
    this.filterChange.emit(this.selectedValue);
  }
}
