import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopRoutingModule } from './shop-routing.module';
import { ShopComponent } from './shop.component';
import { ListEventsComponent } from '../../shared/list-events/list-events.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ShopRoutingModule,
    ShopComponent,
    ListEventsComponent
  ]
})
export class ShopModule {}
