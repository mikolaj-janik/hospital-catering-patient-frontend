import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { catchError, of } from 'rxjs';
import { DiaryService } from 'src/app/service/diary.service';
import { PatientService } from 'src/app/service/patient.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MdbCarouselModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  patientService = inject(PatientService);
  router = inject(Router);
  diaryService = inject(DiaryService);

  isErrorResponse = false;

  ngOnInit() {
    const login = localStorage.getItem('USER_LOGIN');
    const date = new Date();

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const todayStr = formatDate(date);

    this.patientService.getPatientByLogin(login).subscribe((data) => {
      const dietId = data.diet.id;
      this.diaryService.getDiaryByDateAndDietId(todayStr, dietId).pipe(
        catchError((error) => {
          if (error.status === 404) {
            this.isErrorResponse = true;
            return of(null);
          }
          return of(null);
        })
      ).subscribe((data) => {
        if (!this.isErrorResponse) {
          this.router.navigate([`meals/diary/${data.id}`]);
        } else {
          this.router.navigate([`meals/diary`]);
        }
        this.isErrorResponse = false;
      });
    });

  }
}
