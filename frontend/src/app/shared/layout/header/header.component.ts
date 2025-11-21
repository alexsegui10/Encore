import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserTypeService } from '../../../core/services/user-type.service';
import { CartService } from '../../../core/services/cart.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // Signal local para el usuario
  currentUser = signal<any>(null);

  // Getters para signals del servicio
  get isAdmin() {
    return this.userTypeService.isAdmin();
  }

  get isAuthenticated() {
    return this.userTypeService.isAuthenticated();
  }

  get cartCount() {
    return this.cartService.cartCount();
  }

  constructor(
    private userTypeService: UserTypeService,
    public cartService: CartService
  ) {
    // Effect para actualizar datos del usuario cuando cambie el role
    effect(() => {
      // Disparar cuando cambie el role
      const role = this.userTypeService.currentRole();

      if (role) {
        this.userTypeService.getCurrentUserData().subscribe(userData => {
          this.currentUser.set(userData);
        });
      } else {
        this.currentUser.set(null);
      }
    });
  }

  ngOnInit(): void {
    // Cargar datos iniciales
    if (this.userTypeService.isAuthenticated()) {
      this.userTypeService.getCurrentUserData().subscribe(userData => {
        this.currentUser.set(userData);
      });
    }
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
        this.userTypeService.logout();

        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: '¡Hasta pronto!',
          timer: 1500,
          showConfirmButton: false
        });
        setTimeout(() => {
          location.assign('/');
        }, 1500);
      }
    });
  }
}
