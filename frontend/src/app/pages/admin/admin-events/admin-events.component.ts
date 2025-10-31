import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1>Gestión de Eventos</h1>
        <button class="btn-primary">+ Nuevo Evento</button>
      </div>
      <div class="content">
        <p>Aquí irá la lista de eventos y el formulario de creación/edición</p>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      padding: 0;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }
    .page-header h1 {
      margin: 0;
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
    }
    .btn-primary {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.4);
    }
    .content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class AdminEventsComponent {}
