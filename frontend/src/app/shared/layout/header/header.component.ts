import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isLogged = false;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Inicializar el usuario autenticado
    this.userService.populate();

    // Suscribirse a los observables globales (con $)
    this.userService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userData) => {
        this.currentUser = userData;
        this.cd.markForCheck();
      });

    this.userService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        this.isLogged = status;
        this.cd.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  logout(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.purgeAuth();
        
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: '¡Hasta pronto!',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }
}
