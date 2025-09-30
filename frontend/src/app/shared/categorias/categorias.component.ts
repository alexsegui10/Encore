import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { CardCategoryComponent } from '../card-category/card-category.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';


@Component({
  selector: 'list-category',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CardCategoryComponent, InfiniteScrollModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class ListCategoryComponent implements OnInit {
  offset = 0;
  limit = 4;
  categories: Category[] = [];
  @ViewChild('grid', { static: false }) gridRef?: ElementRef<HTMLElement>;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
   const params = this.getRequestParams(this.offset, this.limit);
    this.categoryService.getAllCategories(params).subscribe({
      next: (cats) => {
        this.categories = cats;
        this.limit = this.limit + 4; },
      error: (err) => { console.error('Error loading categories:', err); }
    });
  }
    getRequestParams(offset: number,limit: number): any{
    let params: any = {};

    params[`offset`] = offset;
    params[`limit`] = limit;

    return params;
  }
    scroll(): void {
    this.loadCategories();
  }





  //difuminado fila (Codigo de ChatGPT)
  onHover(evt: MouseEvent): void {
    const grid = this.gridRef?.nativeElement;
    if (!grid) return;

    const target = (evt.target as HTMLElement).closest('.card') as HTMLElement | null;
    if (!target) return;

    const rowTop = target.offsetTop;
    const hosts = Array.from(grid.querySelectorAll('app-card-category')) as HTMLElement[];

    for (const host of hosts) {
      const cardEl = host.querySelector('.card') as HTMLElement | null;
      if (!cardEl) continue;

      const sameRow = cardEl.offsetTop === rowTop;
      const isHovered = cardEl === target;

      cardEl.classList.toggle('dim', sameRow && !isHovered);
    }
  }

  clearHover(): void {
    const grid = this.gridRef?.nativeElement;
    if (!grid) return;
    grid.querySelectorAll('.card.dim').forEach(el => el.classList.remove('dim'));
  }
}
