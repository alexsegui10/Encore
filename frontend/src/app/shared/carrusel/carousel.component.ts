import { Component, Input, OnInit } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { CommonModule } from '@angular/common';
import { CarouselItem } from '../carousel-item/carousel-item.component';
import { CarouselService } from '../../core/services/carousel.service';
import { CarouselHome, CarouselDetails } from '../../core/models/carousel.model';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  standalone: true,
  imports: [CommonModule, CarouselModule, CarouselItem]
})
export class CarouselComponent implements OnInit {
  @Input() type: 'home' | 'details' = 'home';
  @Input() eventSlug?: string;
  @Input() numVisible = 3;
  @Input() autoplayInterval = 3000;
  
  items: CarouselHome[] = [];
  images: string[] = [];
  loading = true;
  error: string | null = null;

  constructor(private carouselService: CarouselService) { }

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loading = true;
    this.error = null;

    if (this.type === 'home') {
      this.loadHomeCategories();
    } else if (this.type === 'details' && this.eventSlug) {
      this.loadEventDetails();
    } else {
      this.error = 'Configuración inválida del carousel';
      this.loading = false;
    }
  }

  private loadHomeCategories() {
    this.carouselService.getCarouselHome().subscribe({
      next: (categories) => {
        this.items = categories;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading carousel categories:', error);
        this.error = 'Error al cargar las categorías';
        this.loading = false;
      }
    });
  }

  private loadEventDetails() {
    if (!this.eventSlug) return;
    
    this.carouselService.getCarouselDetails(this.eventSlug).subscribe({
      next: (details) => {
        this.images = details.images;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading carousel details:', error);
        this.error = 'Error al cargar las imágenes del evento';
        this.loading = false;
      }
    });
  }
}
