import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from 'src/app/models/account/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private apiUrl = 'http://localhost:8080/account';

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/all`);
  }

  addAccount(account: Partial<Account>): Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}/add`, account);
  }

  updateAccount(account: Account): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/update`, account);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
export { Account };

