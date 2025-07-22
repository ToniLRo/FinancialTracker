import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginResponse } from 'src/app/models/LoginResponse/loginresponse.model';
import { User } from 'src/app/models/User/user.model';
import { ChangePasswordRequest } from 'src/app/models/ChangePasswordRequest.model';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/user';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

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
    this.router.navigate(['/LogIn']);

  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    if (!token) {
        return false;
    }

    // Opcional: Verificar si el token ha expirado
    try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const expirationDate = new Date(tokenData.exp * 1000);
        if (expirationDate < new Date()) {
            this.logout(); // Limpiar token expirado
            return false;
        }
        return true;
    } catch {
        return false;
    }
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }
}

// Crear un servicio de validación
@Injectable({
    providedIn: 'root'
})
export class ValidationService {
    private readonly EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    private readonly USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
    private readonly PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

    validateEmail(email: string): boolean {
        return this.EMAIL_REGEX.test(email);
    }

    validateUsername(username: string): boolean {
        return this.USERNAME_REGEX.test(username);
    }

    validatePassword(password: string): boolean {
        return this.PASSWORD_REGEX.test(password);
    }

    sanitizeInput(input: string): string {
        return input.replace(/[<>]/g, ''); // Sanitización básica XSS
    }
} 