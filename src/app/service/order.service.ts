import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Order } from '../common/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
      private authService: AuthService,
      private http: HttpClient,
    ) {}

    getOrdersByPatientId(id: number): Observable<Order[]> {
      const headers = this.authService.getAuthHeaders();
      const url = `${environment.apiUrl}/orders?patientId=${id}`;

      return this.http.get<Order[]>(url, { headers });
    }
}
