import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, shareReplay, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class MarketDataService {
    private marketDataApiUrl = environment.apiUrl+"/marketdata";
    
    // Cache de headers para evitar recrearlos en cada request
    private authHeaders$ = new BehaviorSubject<HttpHeaders | null>(null);

    constructor(private http: HttpClient) {}

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

    getLastMarketData(assetType: string): Observable<any> {
        return this.http.get<any>(`${this.marketDataApiUrl}/last/${assetType}`).pipe(
            shareReplay(1), // Cachea los datos de mercado
            take(1) // Asegura que se complete automáticamente
        );
    }

    saveMarketData(marketData: any): Observable<any> {
        return this.http.post<any>(`${this.marketDataApiUrl}/add`, marketData).pipe(
            take(1) // Asegura que se complete automáticamente
        );
    }
}   