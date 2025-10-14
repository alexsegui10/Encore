import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  isLogged = false;

  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userService.currentUser.subscribe((userData) => {
      this.currentUser = userData;
      this.cd.markForCheck();
    });

    this.userService.isAuthenticated.subscribe((status) => {
      this.isLogged = status;
      this.cd.markForCheck();
    });

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
        this.currentUser = null;
        this.isLogged = false;
        this.cd.markForCheck();
        
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
