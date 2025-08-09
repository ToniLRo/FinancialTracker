import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Transaction } from 'src/app/models/Transaction/transaction.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionApiUrl = environment.apiUrl+"/transaction";

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt_token');
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
      console.error('Authentication error - token may be expired');
    } else if (error.status === 401) {
      console.error('Unauthorized - please login');
    } else {
      console.error('HTTP Error:', error.message);
    }
    return throwError(() => error);
  }

  getAllUserTransactions(): Observable<Transaction[]> {
    //console.log('=== TRANSACTION SERVICE - GET ALL USER TRANSACTIONS ===');
    
    return this.http.get<Transaction[]>(`${this.transactionApiUrl}/user`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      //tap(response => console.log('✅ All User Transactions Response:', response)),
      catchError(error => {
        console.error('❌ Get All User Transactions Error:', error);
        return this.handleError(error);
      })
    );
  }

  getAccountTransactions(accountId: number): Observable<Transaction[]> {
    //console.log('=== TRANSACTION SERVICE - GET ACCOUNT TRANSACTIONS ===');
    //console.log('Request AccountId:', accountId);
    
    return this.http.get<Transaction[]>(`${this.transactionApiUrl}/account/${accountId}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      //tap(response => console.log('✅ Account Transactions Response:', response)),
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
      catchError(this.handleError.bind(this))
    );
  }

  updateTransaction(transaction: any): Observable<Transaction> {
    //console.log('=== TRANSACTION SERVICE - UPDATE TRANSACTION ===');
    //console.log('Updating transaction:', transaction);
    
    return this.http.put<Transaction>(`${this.transactionApiUrl}/update`, transaction, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      //tap(response => console.log('✅ Update Transaction Response:', response)),
      catchError(error => {
        console.error('❌ Update Transaction Error:', error);
        return this.handleError(error);
      })
    );
  }

  deleteTransaction(transactionId: number): Observable<any> {
    //console.log('=== TRANSACTION SERVICE - DELETE TRANSACTION ===');
    //console.log('Deleting transaction ID:', transactionId);
    
    return this.http.delete<any>(`${this.transactionApiUrl}/delete/${transactionId}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      //tap(response => console.log('✅ Delete Transaction Response:', response)),
      catchError(error => {
        console.error('❌ Delete Transaction Error:', error);
        return this.handleError(error);
      })
    );
  }
}
