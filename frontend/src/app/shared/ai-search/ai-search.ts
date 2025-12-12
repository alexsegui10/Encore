import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RagService, RAGResponse } from '../../core/services/rag.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ai-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ai-search.html',
  styleUrls: ['./ai-search.css']
})
export class AiSearchComponent {
  question = signal('');
  loading = signal(false);
  response = signal<RAGResponse | null>(null);
  error = signal<string | null>(null);

  exampleQuestions = [
    'Dame un resumen de los productos relacionados con entretenimiento.',
    'Quiero un dispositivo para editar video. ¿Cuál del catálogo es el más adecuado?',
    'Recomiéndame algo útil para estudiar por las noches.',
    '¿Qué producto sirve para hacer ejercicio y también tiene pantalla?'
  ];

  constructor(private ragService: RagService) { }

  askQuestion() {
    const q = this.question().trim();
    if (!q) {
      this.error.set('Por favor, escribe una pregunta');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.response.set(null);

    this.ragService.askQuestion(q).subscribe({
      next: (res) => {
        this.response.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading.set(false);

        if (err.status === 503) {
          this.error.set('No se puede conectar con LM Studio. Asegúrate de que esté ejecutándose en http://localhost:1234');
        } else {
          this.error.set(err.error?.error || 'Error procesando tu consulta. Intenta de nuevo.');
        }
      }
    });
  }

  useExample(example: string) {
    this.question.set(example);
    this.askQuestion();
  }

  clearSearch() {
    this.question.set('');
    this.response.set(null);
    this.error.set(null);
  }
}
