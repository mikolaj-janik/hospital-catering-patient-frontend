import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/service/cart.service';
import Swal from 'sweetalert2';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart-details',
  standalone: true,
  imports: [SweetAlert2Module],
  templateUrl: './cart-details.component.html',
  styleUrl: './cart-details.component.scss'
})
export class CartDetailsComponent {

  router = inject(Router);
  toast = inject(ToastrService);
  cartService = inject(CartService);

  cartItems: CartItem[] = [];
  totalPrice = 0;

  ngOnInit() {
    this.cartItems = this.cartService.getCartItems();
    this.cartService.totalPrice.subscribe(data => this.totalPrice = data);
  }

  redirectToPremiumMeals() {
    this.router.navigateByUrl('/meals/premium');
  }

  handleDeleteMeal(cartItem: CartItem) {
    this.cartService.removeFromCart(cartItem);
    this.cartItems = this.cartService.getCartItems();
    this.toast.info(`Usunięto: ${cartItem.meal.name}`);
  }

  formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
