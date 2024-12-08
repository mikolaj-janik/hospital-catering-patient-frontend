import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { PaymentInfo } from '../common/payment-info';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CartItem } from '../common/cart-item';
import { Patient } from '../common/patient';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(
    private authService: AuthService,
    private http: HttpClient,
  ) { }

  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/checkout/payment-intent`, paymentInfo, { headers });
  }

  placeOrder(order: { patient: Patient, totalPrice: number, cartItems: CartItem[] }): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/checkout/order`, order, { headers });
  }
}
