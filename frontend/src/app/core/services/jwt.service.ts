import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class JwtService {

  getToken(): string {
    const token = window.localStorage['jwtToken'];
    return token;
  }

  saveToken(token: string) {
    window.localStorage['jwtToken'] = token;
  }

  destroyToken() {
    window.localStorage.removeItem('jwtToken');
  }

  // Decodifica el token JWT y extrae el payload
  decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  // Obtiene el role del usuario desde el token
  getUserRole(): 'admin' | 'enterprise' | 'cliente' | null {
    const decoded = this.decodeToken();
    if (!decoded) return null;
    
    // El admin server y enterprise server guardan el role directamente en el payload
    // El booking client lo guarda en decoded.user.role
    return decoded.role || decoded.user?.role || null;
  }

}
