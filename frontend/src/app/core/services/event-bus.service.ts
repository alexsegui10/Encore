import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({
    providedIn: 'root'
})
export class EventBusService {
    private aiEventsSubject = new BehaviorSubject<Event[] | null>(null);
    public aiEvents$: Observable<Event[] | null> = this.aiEventsSubject.asObservable();

    setAIEvents(events: Event[] | null) {
        this.aiEventsSubject.next(events);
    }

    clearAIEvents() {
        this.aiEventsSubject.next(null);
    }
}
