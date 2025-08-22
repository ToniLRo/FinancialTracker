import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginResponse } from 'src/app/models/LoginResponse/loginresponse.model';
import { AuthService } from '../auth/auth.service';
import { catchError, throwError, shareReplay, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  // register() y login() eliminados - duplicados con AuthService

  getUserSettings(userId: number): Observable<any> {
    const headers = new HttpHeaders().set(
        'Authorization',
        `Bearer ${this.authService.getToken()}`
    );
    
    return this.http.get(`${this.apiUrl}/user/${userId}/settings`, { headers })
        .pipe(
            shareReplay(1), // Cachea los settings del usuario
            take(1), // Asegura que se complete automáticamente
            catchError(error => {
                console.error('Error al obtener settings:', error);
                return throwError(() => error);
            })
        );
}

updateUserSettings(userId: number, settings: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.put<any>(`${this.apiUrl}/user/${userId}/settings`, settings, { headers }).pipe(
        take(1) // Asegura que se complete automáticamente
    );
}

  getUserById(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/find/${userId}`).pipe(
        shareReplay(1), // Cachea los datos del usuario
        take(1) // Asegura que se complete automáticamente
    );
  }
}
