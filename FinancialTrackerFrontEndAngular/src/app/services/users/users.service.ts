import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginResponse } from 'src/app/models/LoginResponse/loginresponse.model';
import { AuthService } from '../auth/auth.service';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { username, email, password });
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password });
  }

  getUserSettings(userId: number): Observable<any> {
    const headers = new HttpHeaders().set(
        'Authorization',
        `Bearer ${this.authService.getToken()}`
    );
    
    return this.http.get(`${this.apiUrl}/${userId}/settings`, { headers })
        .pipe(
            catchError(error => {
                console.error('Error al obtener settings:', error);
                return throwError(() => error);
            })
        );
}

updateUserSettings(userId: number, settings: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.put<any>(`${this.apiUrl}/${userId}/settings`, settings, { headers });
}

  getUserById(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/find/${userId}`);
  }
}
