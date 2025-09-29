import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../core/models/category.model';
@Component({
  selector: 'app-card-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-category.component.html',
  styleUrls: ['./card-category.component.css'],
  encapsulation: ViewEncapsulation.None // <— importante
})
export class CardCategoryComponent {
  @Input() category!: Category;

  defaultImage =
    'https://images.unsplash.com/photo-1557177324-56c542165309?q=80&w=1200&auto=format&fit=crop';

  get backgroundUrl(): string {
    const c: any = this.category || {};
    return c.image || c.cover || c.thumbnail || this.defaultImage;
  }
}
