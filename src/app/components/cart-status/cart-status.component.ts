import { Component, inject } from '@angular/core';
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

  ngOnInit() {
    this.cartService.totalQuantity.subscribe(data => this.totalQuantity = data);
  }
}
