import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {

  @Input() currentPage: number = 1;

  @Input() totalPages: number[] = [];

  @Output() pageChange = new EventEmitter<number>();

  changePage(pageNumber: number) {
    if (!this.totalPages?.length) return;
    if (pageNumber >= 1 && pageNumber <= this.totalPages.length && pageNumber !== this.currentPage) {
      this.pageChange.emit(pageNumber);
    }
  }

}
