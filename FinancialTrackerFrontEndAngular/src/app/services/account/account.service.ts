import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Account } from 'src/app/models/account/account.model';

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
  referenceId?: string;
  accountId?: number;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountApiUrl = 'http://localhost:8080/account';
  private transactionApiUrl = 'http://localhost:8080/transaction';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found in localStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // NUEVO: Método para manejar errores
  private handleError(error: HttpErrorResponse) {
    if (error.status === 403) {
      console.error('Authentication error - token may be expired');
    } else if (error.status === 401) {
      console.error('Unauthorized - please login');
    } else {
      console.error('HTTP Error:', error.message);
    }
    return throwError(() => error);
  }

  // Métodos de Account (existentes)
  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.accountApiUrl}/all`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  addAccount(account: Partial<Account>): Observable<Account> {
    return this.http.post<Account>(`${this.accountApiUrl}/add`, account, { 
      headers: this.getAuthHeaders() 
    });
  }

  updateAccount(account: Account): Observable<Account> {
    return this.http.put<Account>(`${this.accountApiUrl}/update`, account, { 
      headers: this.getAuthHeaders() 
    });
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.accountApiUrl}/delete/${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Métodos de Transaction (usando el TransactionController existente)
  getAccountTransactions(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.transactionApiUrl}/account/${accountId}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  addTransaction(transaction: any): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.transactionApiUrl}/add`, transaction, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}