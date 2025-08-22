import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, shareReplay, take } from 'rxjs/operators';
import { Transaction } from 'src/app/models/Transaction/transaction.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionApiUrl = environment.apiUrl+"/transaction";
  
  // Cache de headers para evitar recrearlos en cada request
  private authHeaders$ = new BehaviorSubject<HttpHeaders | null>(null);

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    // Usar cache de headers si existe
    if (this.authHeaders$.value) {
      return this.authHeaders$.value;
    }
    
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.warn('No authentication token found in localStorage');
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    // Cachear headers
    this.authHeaders$.next(headers);
    return headers;
  }

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

  getAllUserTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.transactionApiUrl}/user`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      shareReplay(1), // Cachea las transacciones del usuario
      catchError(error => {
        console.error('❌ Get All User Transactions Error:', error);
        return this.handleError(error);
      })
    );
  }

  getAccountTransactions(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.transactionApiUrl}/account/${accountId}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      shareReplay(1), // Cachea las transacciones de la cuenta
      catchError(error => {
        console.error('❌ Get Account Transactions Error:', error);
        return this.handleError(error);
      })
    );
  }

  addTransaction(transaction: any): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.transactionApiUrl}/add`, transaction, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      take(1), // Asegura que se complete automáticamente
      catchError(this.handleError.bind(this))
    );
  }

  updateTransaction(transaction: any): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.transactionApiUrl}/update`, transaction, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      take(1), // Asegura que se complete automáticamente
      catchError(error => {
        console.error('❌ Update Transaction Error:', error);
        return this.handleError(error);
      })
    );
  }

  deleteTransaction(transactionId: number): Observable<any> {
    return this.http.delete<any>(`${this.transactionApiUrl}/delete/${transactionId}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      take(1), // Asegura que se complete automáticamente
      catchError(error => {
        console.error('❌ Delete Transaction Error:', error);
        return this.handleError(error);
      })
    );
  }
}
