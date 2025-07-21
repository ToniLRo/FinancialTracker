import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginResponse } from 'src/app/models/LoginResponse/loginresponse.model';
import { User } from 'src/app/models/User/user.model';
import { ChangePasswordRequest } from 'src/app/models/ChangePasswordRequest.model';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/user';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Métodos HTTP
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { username, email, password });
  }

  login(username: string, password: string, keepSignedIn: boolean = false): Observable<any> {
    console.log('🔐 Login attempt:', { username, keepSignedIn });

    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
        tap(response => {
            if (response.token) {
                if (keepSignedIn) {
                    localStorage.setItem('jwt_token', response.token);
                    console.log('✅ Token guardado en localStorage (Keep me signed in)');
                } else {
                    sessionStorage.setItem('jwt_token', response.token);
                    console.log('✅ Token guardado en sessionStorage (sesión normal)');
                }
            }
        })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, request);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(resetData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, resetData);
  }

  // Métodos de autenticación
  setCurrentUser(user: User, token: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('jwt_token', token);
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('keepSignedIn');
    sessionStorage.removeItem('jwt_token');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    const localToken = localStorage.getItem('jwt_token');
    const sessionToken = sessionStorage.getItem('jwt_token');
    
    console.log('🔍 Verificando estado de login:', {
        tieneLocalToken: !!localToken,
        tieneSessionToken: !!sessionToken,
        ubicacionToken: localToken ? 'localStorage' : sessionToken ? 'sessionStorage' : 'ninguno'
    });

    return !!(localToken || sessionToken);
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }
} 