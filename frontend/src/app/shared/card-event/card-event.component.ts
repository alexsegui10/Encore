import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../core/models/event.model';

@Component({
  selector: 'app-card-event',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-event.component.html',
  styleUrls: ['./card-event.component.css']
})
export class CardEventComponent {
  @Input() event!: Event;
}
