import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Diet } from 'src/app/common/diet';
import { Meal } from 'src/app/common/meal';
import { AuthService } from 'src/app/service/auth.service';
import { DietService } from 'src/app/service/diet.service';
import { MealService } from 'src/app/service/meal.service';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { PatientService } from 'src/app/service/patient.service';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { CartService } from 'src/app/service/cart.service';
import { CartItem } from 'src/app/common/cart-item';
import { CheckoutService } from 'src/app/service/checkout.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-premium-meals',
  standalone: true,
  imports: [CommonModule, MatSelectModule, SweetAlert2Module],
  templateUrl: './premium-meals.component.html',
  styleUrl: './premium-meals.component.scss'
})
export class PremiumMealsComponent {

  dialogRef = inject(MatDialog);
  mealService = inject(MealService);
  checkoutService = inject(CheckoutService);
  dietService = inject(DietService);
  patientService = inject(PatientService);
  authService = inject(AuthService);
  cartService = inject(CartService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  toastr = inject(ToastrService);
  
  meals: Meal[] = [];
  breakfasts: Meal[] = [];
  lunches: Meal[] = [];
  suppers: Meal[] = [];
  mealsInCart: CartItem[] = [];
  diet: Diet = null;

  types = ['wszystkie', 'śniadanie', 'obiad', 'kolacja'];
  selectedType = 'all';
  selectedBreakfastId = 0;
  selectedLunchId = 0;
  selectedSupperId = 0;

  todayDate: Date = null;

  selectedDate: Date = null;

  isResponseHere = false;
  searchMode = false;
  mealsEmpty = false;
  disabledBreakfasts = false;
  disabledLunches = false;
  disabledSuppers = false;

  ngOnInit() {
    const login = localStorage.getItem('USER_LOGIN');
    const today = new Date();
    this.todayDate = today;

    this.selectedDate = today;

    this.mealsInCart = this.cartService.getCartItems();
    
    if (this.mealsInCart != null) {
      this.updateDisabledArray();
    }
    
    this.route.paramMap.subscribe(() => {
      this.patientService.getPatientByLogin(login).subscribe(patient => {
        this.diet = patient.diet;
        this.listMeals();
      });
    }); 
  }

  updateSelectedMeals() {
    if (this.mealsInCart != null) {
      this.mealsInCart.forEach((cartItem) => {
        const date = new Date(cartItem.date).toISOString().split('T')[0];
        const selectedDate = new Date(this.selectedDate).toISOString().split('T')[0];
        
        this.breakfasts.forEach((meal) => {
          if (meal.id === cartItem.meal.id && date === selectedDate) {
            this.selectedBreakfastId = meal.id;
          }
        });

        this.lunches.forEach((meal) => {
          if (meal.id === cartItem.meal.id && date === selectedDate) {
            this.selectedLunchId = meal.id;
          }
        });

        this.suppers.forEach((meal) => {
          if (meal.id === cartItem.meal.id && date === selectedDate) {
            this.selectedSupperId = meal.id;
          }
        });
      });
    }
  }

  updateDisabledArray() {
    this.mealsInCart.forEach((cartItem) => {
      const date = new Date(cartItem.date).toISOString().split('T')[0];
      const selectedDate = new Date(this.selectedDate).toISOString().split('T')[0];

      if (date === selectedDate) {

        if (cartItem.meal.type === 'śniadanie') {
          this.disabledBreakfasts = true;

        } else if (cartItem.meal.type === 'obiad') {
          this.disabledLunches = true;

        } else if (cartItem.meal.type === 'kolacja') {
          this.disabledSuppers = true;
        }
      }
    });
  }

  listMeals() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (!this.searchMode) {
      this.handleListMeals();
    }
    else {
      this.handleSearchMeals();
    }
  }

  handleListMeals() {
    this.isResponseHere = false;
    this.mealService.getPremiumMealsByDietIdAndType(this.diet.id, this.selectedType).subscribe(this.processResult());
  }

  handleSearchMeals() {
    this.isResponseHere = false;
    const keyword: string = this.route.snapshot.paramMap.get('keyword')!;

    this.mealService.getPremiumMealsByDietIdAndKeyword(this.diet.id, keyword).subscribe(this.processResult());
  }

  addToCart(meal: Meal) {
    const now = new Date();
    const nowDate = now.toISOString().split('T')[0];
    const selectedDate = this.selectedDate.toISOString().split('T')[0];
    if (nowDate === selectedDate) {
      if (meal.type === 'śniadanie' && now.getHours() >= 9) {
        Swal.fire('Nie można dodać do zamówienia', 'Nie możesz zamówić śniadania na dzisiaj po godzinie 9:00', 'error');
        return;
      } else if (meal.type === 'obiad' && now.getHours() >= 13) {
        Swal.fire('Nie można dodać do zamówienia', 'Nie możesz zamówić obiadu na dzisiaj po godzinie 13:00', 'error');
        return;
      } else if (meal.type === 'kolacja' && now.getHours() >= 18) {
        Swal.fire('Nie można dodać do zamówienia', 'Nie możesz zamówić kolacji na dzisiaj po godzinie 18:00', 'error');
        return;
      }
    }

    let hasErrors = false;

    this.checkoutService.verifyCartItem(meal.id, selectedDate).pipe(
      catchError((error) => {
        hasErrors = true;

        if (error.status === 400) {
          let message;

          if (meal.type === 'śniadanie') {
            message = 'W tym dniu śniadanie widnieje już na liście twoich zamówień';

          } else if (meal.type === 'obiad') {
            message = 'W tym dniu obiad widnieje już na liście twoich zamówień';

          } else {
            message = 'W tym dniu kolacja widnieje już na liście twoich zamówień';

          }
          Swal.fire('Nie można dodać do zamówienia', message, 'error');
          
        } else if (error.status === 404) {
          this.toastr.error('Nie znaleziono posiłku');
        }
        return of(null);
      })
    ).subscribe(() => {
      if (!hasErrors) {
        const cartItem: CartItem = new CartItem(new Date(this.selectedDate), meal);
        this.cartService.addToCart(cartItem);
        this.mealsInCart = this.cartService.getCartItems();
        this.updateDisabledArray();

        if (meal.type === 'śniadanie') {
          this.selectedBreakfastId = meal.id;

        } else if (meal.type === 'obiad') { 
          this.selectedLunchId = meal.id;

        } else {
          this.selectedSupperId = meal.id;
        }
      }
    });
  }

  deleteFromCart(meal: Meal) {
    const cartItem: CartItem = new CartItem(this.selectedDate, meal);

    const date = new Date(cartItem.date).toISOString().split('T')[0];
    const selectedDate = new Date(this.selectedDate).toISOString().split('T')[0];

    if (date === selectedDate) {
      if (meal.type === 'śniadanie') {
        this.selectedBreakfastId = 0;
        this.disabledBreakfasts = false;
  
      } else if (meal.type === 'obiad') { 
        this.selectedLunchId = 0;
        this.disabledLunches = false;
  
      } else {
        this.selectedSupperId = 0;
        this.disabledSuppers = false;
      }
      this.cartService.removeFromCart(cartItem);
      this.mealsInCart = this.cartService.getCartItems();
    }
  }

  processResult() {
    this.mealsEmpty = true;
    return (data) => {
      if(data > 0) {
        this.mealsEmpty = false;
      }
      this.breakfasts = [];
      this.lunches = [];
      this.suppers = [];
      this.meals = data;
      this.meals.forEach((meal) => {
        if (meal.type === 'śniadanie') {
          this.breakfasts.push(meal);

        } else if (meal.type === 'obiad') {
          this.lunches.push(meal);

        } else {
          this.suppers.push(meal);
        }
      });
      this.updateSelectedMeals();
      this.isResponseHere = true;
    }
  }

  onTypeSelected(selectedType: string) {
    switch(selectedType) {
      case 'śniadanie': {
        this.selectedType = 'breakfast';
        break;
      }
      case 'obiad': {
        this.selectedType = 'lunch';
        break;
      }
      case 'kolacja': {
        this.selectedType = 'supper';
        break;
      }
      default: {
        this.selectedType = 'all';
        break;
      }
    }
    this.handleListMeals();
  }

  onDaySelected(selectedDay: string) {
    const today = new Date();
    if (selectedDay === 'today') {
      this.selectedDate = today;

    } else if (selectedDay === 'tomorrow') {
      this.selectedDate.setDate(today.getDate() + 1);
      
    } else {
      this.selectedDate.setDate(today.getDate() + 2);
    }
    this.disabledBreakfasts = false;
    this.disabledLunches = false;
    this.disabledSuppers = false;
    this.selectedBreakfastId = 0;
    this.selectedLunchId = 0;
    this.selectedSupperId = 0;
    this.updateSelectedMeals();
    this.updateDisabledArray();
  }

  redirectToDetails(id: number) {
    this.router.navigate([`meals/details/${id}`]);
  }

  openDialog(image: string) {
    this.dialogRef.open(PopUpComponent, { data : image });
  }
}
