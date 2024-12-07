import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/service/cart.service';

@Component({
  selector: 'app-cart-status',
  standalone: true,
  imports: [],
  templateUrl: './cart-status.component.html',
  styleUrl: './cart-status.component.scss'
})
export class CartStatusComponent {
  totalQuantity = 0;

  cartService = inject(CartService);
  router = inject(Router);

  ngOnInit() {
    this.cartService.totalQuantity.subscribe(data => this.totalQuantity = data);
  }

  redirectToCheckout() {
    this.router.navigateByUrl('/meals/premium/checkout');
  }
}
