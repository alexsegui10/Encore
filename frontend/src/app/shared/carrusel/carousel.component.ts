import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarouselHome, CarouselDetails } from '../../core/models/carousel.model';
import { CarouselService } from '../../core/services/carousel.service';
import { ActivatedRoute } from '@angular/router';
import { CarouselItem } from '../carousel-item/carousel-item.component';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselItem]
})
export class CarouselComponent implements OnInit {
  items_carousel: CarouselHome[] = [];
  items_details: CarouselDetails[] = [];
  slug_details: string | null = null;
  page: string = '';

  constructor(private CarouselService: CarouselService, private ActivatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.slug_details = this.ActivatedRoute.snapshot.paramMap.get('slug');
    this.loadCarouselData();
  }

  loadCarouselData(): void {
    if (this.slug_details) {
      this.page = "details";
      this.CarouselService.getCarouselDetails(this.slug_details).subscribe((data: CarouselDetails) => {
        // console.log(data);
        this.items_details = [data]; // Envolver en array ya que el servicio devuelve un solo objeto
        console.log(this.items_details);
      });
    } else {
      this.page = "categories";
      this.CarouselService.getCarouselHome().subscribe((data: CarouselHome[]) => {
        // console.log(data);
        this.items_carousel = data; // El servicio ya devuelve el array directamente
      });
    }
  }
}
