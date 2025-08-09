import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Account } from 'src/app/models/account/account.model';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class MarketDataService {
    private marketDataApiUrl = environment.apiUrl+"/marketdata";

    constructor(private http: HttpClient) {}

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

    getLastMarketData(assetType: string): Observable<any> {
        return this.http.get<any>(`${this.marketDataApiUrl}/last/${assetType}`);
    }

    saveMarketData(marketData: any): Observable<any> {
        return this.http.post<any>(`${this.marketDataApiUrl}/add`, marketData);
    }
}   