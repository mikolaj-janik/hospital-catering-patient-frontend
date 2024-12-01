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
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

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
  dietService = inject(DietService);
  patientService = inject(PatientService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  toastr = inject(ToastrService);
  
  meals: Meal[] = [];
  breakfasts: Meal[] = [];
  lunches: Meal[] = [];
  suppers: Meal[] = [];
  diet: Diet = null;
  types = ['wszystkie', 'śniadanie', 'obiad', 'kolacja'];
  selectedType = 'all';

  isResponseHere = false;
  searchMode = false;
  mealsEmpty = false;

  ngOnInit() {
    const login = localStorage.getItem('USER_LOGIN');

    this.route.paramMap.subscribe(() => {
      this.patientService.getPatientByLogin(login).subscribe(patient => {
        this.diet = patient.diet;
        this.listMeals();
      });
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
      console.log(this.meals.length);
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

  redirectToDetails(id: number) {
    this.router.navigate([`meals/details/${id}`]);
  }

  openDialog(image: string) {
    this.dialogRef.open(PopUpComponent, { data : image });
  }
}
