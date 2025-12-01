import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-search.component.html',
  styleUrls: ['./admin-search.component.css']
})
export class AdminSearchComponent {
  @Input() placeholder: string = 'Buscar...';
  @Output() searchChange = new EventEmitter<string>();

  searchValue: string = '';

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchValue = input.value;

    // Debounce para no emitir en cada tecla
    setTimeout(() => {
      this.searchChange.emit(this.searchValue);
    }, 300);
  }
}
