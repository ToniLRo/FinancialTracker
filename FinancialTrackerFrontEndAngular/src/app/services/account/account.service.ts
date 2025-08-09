import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Account } from 'src/app/models/account/account.model';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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
  private accountApiUrl = environment.apiUrl+"/account";
  private transactionApiUrl = environment.apiUrl+"/transaction";
  private dashboardApiUrl = environment.apiUrl+"/dashboard";

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt_token'); // CAMBIAR: de 'token' a 'jwt_token'
    if (!token) {
      console.warn('No authentication token found in localStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 403) {
      //console.error('Authentication error - token may be expired');
    } else if (error.status === 401) {
      //console.error('Unauthorized - please login');
    } else {
      //console.error('HTTP Error:', error.message);
    }
    return throwError(() => error);
  }

  getAccounts(): Observable<Account[]> {
    //console.log('🔄 Getting user accounts...');
    const token = localStorage.getItem('jwt_token');
    //console.log('Token present:', !!token);
    
    return this.http.get<Account[]>(`${this.accountApiUrl}/all`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(accounts => {
        //console.log('✅ Received accounts:', accounts);
        //console.log('Number of accounts:', accounts.length);
        //accounts.forEach((account, index) => {
          //console.log(`Account ${index}:`, {
          //  id: account.account_Id,
          //  name: account.holder_name,
          //  userId: account.userId
          //});
        //});
      }),
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

  getAccountTransactions(accountId: number): Observable<Transaction[]> {
    //console.log('=== ACCOUNT SERVICE - GET TRANSACTIONS ===');
    //console.log('Request AccountId:', accountId);
    //console.log('Request URL:', `${this.transactionApiUrl}/account/${accountId}`);
    
    const headers = this.getAuthHeaders();
    //console.log('Request Headers:', {
    //  'Authorization': headers.get('Authorization')?.substring(0, 20) + '...',
    //  'Content-Type': headers.get('Content-Type')
    //});
    
    return this.http.get<Transaction[]>(`${this.transactionApiUrl}/account/${accountId}`, { 
      headers: headers 
    }).pipe(
      //tap(response => console.log('✅ Service Response:', response)),
      catchError(error => {
        console.error('❌ Service Error:', error);
        return throwError(() => error);
      })
    );
  }

  addTransaction(transaction: any): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.transactionApiUrl}/add`, transaction, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateTransaction(transaction: any): Observable<any> {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      return throwError(() => new Error('No authentication token'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.transactionApiUrl}/update`, transaction, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteTransaction(transactionId: number): Observable<any> {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      return throwError(() => new Error('No authentication token'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`${this.transactionApiUrl}/delete/${transactionId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  getDashboardData(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<any>(`${this.dashboardApiUrl}/data`, { headers });
  }

  updateAccountBalance(accountId: number, balance: number): Observable<Account> {
    return this.http.put<Account>(`${this.accountApiUrl}/update-balance/${accountId}`, 
      { balance: balance }, 
      { headers: this.getAuthHeaders() }
    );
  }

  getDataFromAPI(url: string): Observable<any> {
    // Si la URL es externa (no es localhost), no enviO headers de autenticación
    if (!url.includes('localhost')) {
        return this.http.get<any>(url);
    }
    // Para URLs internas, mantenemos la autenticación
    return this.http.get<any>(url, { headers: this.getAuthHeaders() });
}

  private getToken(): string {
    return localStorage.getItem('jwt_token') || '';
  }
}