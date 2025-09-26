import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { CardCategoryComponent } from '../card-category/card-category.component';

@Component({
  selector: 'list-category',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CardCategoryComponent],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class ListCategoryComponent implements OnInit {
  categories: Category[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => { this.categories = cats; },
      error: (err) => { console.error('Error loading categories:', err); }
    });
  }
}
