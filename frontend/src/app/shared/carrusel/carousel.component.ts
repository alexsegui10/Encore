import { Component, Input } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  standalone: true,
  imports: [CommonModule, CarouselModule]
})
export class CarouselComponent {
  @Input() items: any[] = [];       // Datos a mostrar (cards, imágenes, etc.)
  @Input() numVisible = 3;          // Número de items visibles
  @Input() autoplayInterval = 3000; // Autoplay (ms)
}
