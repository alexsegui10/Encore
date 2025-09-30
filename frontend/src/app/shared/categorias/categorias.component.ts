import { Component, OnInit } from '@angular/core';
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
}
