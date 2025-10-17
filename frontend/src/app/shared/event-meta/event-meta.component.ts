import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Event } from '../../core/models/event.model';
import { RouterModule } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-meta',
  templateUrl: './event-meta.component.html',
  styleUrl: './event-meta.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe
  ]
})
export class EventMetaComponent {

  @Input({ required: true }) event!: Event;
  @Input() enableUserActions = false;
  @Input() enableAuthorActions = false;
  @Input() likesCount: number = 0;
  @Input() isLiked: boolean = false;

  @Output() liked: EventEmitter<boolean> = new EventEmitter();
  @Output() deleted: EventEmitter<void> = new EventEmitter();
}
