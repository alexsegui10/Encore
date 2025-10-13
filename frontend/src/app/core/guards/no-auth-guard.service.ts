import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { JwtService } from '../services/jwt.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.jwtService.getToken();
    
    if (token) {
      try {
        // Decodificar el token para verificar si hay un usuario autenticado
        const decodedToken: any = jwtDecode(token);
        const userType = decodedToken?.user?.typeuser || decodedToken?.typeuser;

        if (userType) {
          // Si hay un token válido y un tipo de usuario, redirigir al home
          this.router.navigateByUrl('/home');
          return false;
        }
      } catch (error) {
        console.error('Error decodificando el token:', error);
      }
    }

    // Si no hay token o si hay algún error, permitir el acceso
    return true;
  }
}
