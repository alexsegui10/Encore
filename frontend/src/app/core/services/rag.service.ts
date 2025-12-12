import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface RAGResponse {
    answer: string;
    relatedEvents: any[];
    context: {
        title: string;
        slug: string;
        similarity: string;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class RagService {

    constructor(private apiService: ApiService) { }

    askQuestion(question: string): Observable<RAGResponse> {
        return this.apiService.post('/api/ask', { question }, 4000);
    }
}
