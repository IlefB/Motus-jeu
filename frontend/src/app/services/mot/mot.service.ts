import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MotService {
  private apiUrl = 'http://localhost:3000'; // à adapter si besoin

  constructor(private http: HttpClient) {}

  getMot(): Observable<{ mot: string }> {
    return this.http.get<{ mot: string }>(`${this.apiUrl}/mot`);
  }
}
