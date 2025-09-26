import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselItem } from './carousel-item.component';

describe('CarouselItem', () => {
  let component: CarouselItem;
  let fixture: ComponentFixture<CarouselItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarouselItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
