import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Diet } from 'src/app/common/diet';
import { DietService } from 'src/app/service/diet.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-diet-details',
  standalone: true,
  imports: [SweetAlert2Module],
  templateUrl: './diet-details.component.html',
  styleUrl: './diet-details.component.scss'
})
export class DietDetailsComponent {
  diet: Diet = null;

  dietService = inject(DietService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  isResponseHere = false;

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.handleDietDetails();
    });
  }

  handleDietDetails() {
    const dietId: number = +this.route.snapshot.paramMap.get('id')!;

    this.dietService.getDietById(dietId).pipe(
      catchError((err: any) => {
        if (err.status === 404) {
          this.isResponseHere = true;
          return of(null);
        }
      })
    ).subscribe(
      data => {
        this.diet = data;
        this.isResponseHere = true;
      }
    );
  }

  redirectToDiets() {
    this.router.navigate(['meals/diets']);
  }

  redirectToEdit(id: number) {
    this.router.navigate([`meals/diets/edit/${id}`]);
  }
}
