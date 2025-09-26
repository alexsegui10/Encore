import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { CarouselHome, CarouselDetails } from '../../core/models/carousel.model';

@Component({
  selector: 'app-carousel-item',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './carousel-item.component.html',
  styleUrls: ['./carousel-item.component.css']
})
export class CarouselItem {
  @Input() items_carousel!: CarouselHome[];
  @Input() items_details!: CarouselDetails[];
  @Input() page!: string;
  
  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];
}
