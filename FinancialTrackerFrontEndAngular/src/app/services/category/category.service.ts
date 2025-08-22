import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Category {
  id: number;
  name: string;
  description?: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/category`;
  private categories$ = new BehaviorSubject<Category[]>([]);

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Cachear categorías con shareReplay para evitar múltiples requests
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/all`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      shareReplay(1) // Cachea la última respuesta
    );
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/find/${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  addCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/add`, category, { 
      headers: this.getAuthHeaders() 
    });
  }

  updateCategory(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/update`, category, { 
      headers: this.getAuthHeaders() 
    });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Método para obtener categorías por tipo
  getCategoriesByType(type: 'income' | 'expense'): Observable<Category[]> {
    return this.getAllCategories().pipe(
      shareReplay(1)
    );
  }
}
