import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/service/cart.service';
import Swal from 'sweetalert2';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { environment } from 'src/environments/environment';
import { PaymentInfo } from 'src/app/common/payment-info';
import { CheckoutService } from 'src/app/service/checkout.service';
import { CommonModule } from '@angular/common';
import { PatientService } from 'src/app/service/patient.service';
import { Patient } from 'src/app/common/patient';

@Component({
  selector: 'app-cart-details',
  standalone: true,
  imports: [CommonModule, SweetAlert2Module, MatFormFieldModule, MatInputModule, MatSelectModule,
    FormsModule, ReactiveFormsModule],
  templateUrl: './cart-details.component.html',
  styleUrl: './cart-details.component.scss'
})
export class CartDetailsComponent {

  router = inject(Router);
  toast = inject(ToastrService);
  cartService = inject(CartService);
  checkoutService = inject(CheckoutService);
  patientService = inject(PatientService);

  cartItems: CartItem[] = [];
  totalPrice = 0;
  patient: Patient = null;

  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = '';

  isLoading = false;

  ngOnInit() {
    const login = localStorage.getItem('USER_LOGIN');
    this.patientService.getPatientByLogin(login).subscribe(patient => {
      this.patient = patient;
    });
    this.cartItems = this.cartService.getCartItems();
    if (this.cartItems.length === 0) {
      this.emptyCartMessage();
    }

    this.cartService.totalPrice.subscribe(data => this.totalPrice = data);
  }
  ngAfterViewInit() {
    this.setupStripePaymentForm();
  }

  redirectToPremiumMeals() {
    this.router.navigateByUrl('/meals/premium');
  }

  handleDeleteMeal(cartItem: CartItem) {
    this.cartService.removeFromCart(cartItem);
    this.cartItems = this.cartService.getCartItems();
    this.toast.info(`Usunięto: ${cartItem.meal.name}`);

    if (this.cartItems.length === 0) {
      this.emptyCartMessage();
    }
  }

  emptyCartMessage() {
    Swal.fire({
      icon: 'info',
      title: 'Twój koszyk jest pusty',
      text: 'Dodaj posiłki do koszyka, aby kontynuować',
      showConfirmButton: true,
      confirmButtonText: 'OK'
    });
  }

  formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  submitCheckout() {
    this.paymentInfo.amount = this.totalPrice * 100;
    this.paymentInfo.currency = 'PLN';

    if (this.displayError.textContent === '') {
      this.isLoading = true;
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe((paymentIntentResponse) => {
        this.stripe.confirmCardPayment(paymentIntentResponse.client_secret, {
          payment_method: {
            card: this.cardElement
          }
        }, { handleActions: false }).then((result) => {
          if (result.error) {
            this.isLoading = false;
            this.toast.error('Wystąpił problem podczas przetwarzania płatności');
          } else {
            this.checkoutService.placeOrder({ patient: this.patient, 
                                              totalPrice: this.totalPrice, 
                                              cartItems: this.cartItems }).subscribe(() => {
              this.isLoading = false;
              this.cartService.clearCart();
              this.router.navigateByUrl('/meals/premium');
              this.toast.success('Zamówienie zostało złożone');
            });
          }
        });
      });
    }
  }

  setupStripePaymentForm() {
    var elements = this.stripe.elements();
    this.cardElement = elements.create('card', { hidePostalCode: true });
    this.cardElement.mount('#card-element'); 
    this.cardElement.on('change', (event: any) => {
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = "";
      } else if (event.error) {
        this.displayError.textContent = event.error.message;
      }
    });
   }
}
