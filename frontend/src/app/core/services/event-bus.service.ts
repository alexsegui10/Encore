import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Event } from '../models/event.model';

export interface AIEventsData {
    events: Event[];
    totalCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class EventBusService {
    private aiEventsSubject = new BehaviorSubject<AIEventsData | null>(null);
    public aiEvents$: Observable<AIEventsData | null> = this.aiEventsSubject.asObservable();

    setAIEvents(events: Event[], totalCount?: number) {
        this.aiEventsSubject.next({
            events,
            totalCount: totalCount || events.length
        });
    }

    clearAIEvents() {
        this.aiEventsSubject.next(null);
    }
}
