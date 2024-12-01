import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Diary } from 'src/app/common/diary';
import { Meal } from 'src/app/common/meal';
import { DiaryService } from 'src/app/service/diary.service';
import { MealService } from 'src/app/service/meal.service';
import { PopUpComponent } from '../pop-up/pop-up.component';

@Component({
  selector: 'app-diary-details',
  standalone: true,
  imports: [],
  templateUrl: './diary-details.component.html',
  styleUrl: './diary-details.component.scss'
})
export class DiaryDetailsComponent {

  diaryService = inject(DiaryService);
  mealService = inject(MealService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialogRef = inject(MatDialog);

  isResponseHere = false;
  isErrorPreviousResponse = false;
  isErrorNextResponse = false;

  diary: Diary = null;
  date: Date = null;
  dateStr: string = '';
  breakfast: Meal = null;
  lunch: Meal = null;
  supper: Meal = null;

  tomorrowDiary: Diary = null;
  yesterdayDiary: Diary = null;

  meals: Meal[] = [];

  polishDaysOfWeek = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  day = '';


  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      const diaryId: number = +this.route.snapshot.paramMap.get('id')!;
    this.diaryService.getDiaryById(diaryId).pipe(
      catchError((error) => {
        if (error.status === 404) {
          this.isResponseHere = true;
          return of(null);
        }
      })
    ).subscribe((data) => {
      if (data) {
        this.diary = data;
        this.handleDiaries();
        this.date = new Date(data.date);
        const month = this.formatDayMonth(this.date.getMonth() + 1)
        const day = this.formatDayMonth(this.date.getDate());
        this.dateStr = day + '-' + month + '-' + this.date.getFullYear().toString();
        this.day = this.polishDaysOfWeek[this.date.getDay()];
        this.meals = [];
        this.loadMeals();
      }
    });
    });
  }

  loadMeals() {
    this.mealService.getMealById(this.diary.breakfast.id).subscribe((meal) => {
      this.breakfast = meal;
      this.meals.push(meal);

      this.mealService.getMealById(this.diary.lunch.id).subscribe((meal) => {
        this.lunch = meal;
        this.meals.push(meal);

        this.mealService.getMealById(this.diary.supper.id).subscribe((meal) => {
          this.supper = meal;
          this.meals.push(meal);
          this.isResponseHere = true;
        });
      });
    });
  }
  handleDiaries() {
    const dateString = this.diary.date;
    const date = new Date(dateString);

    const previousDay = new Date(date);
    previousDay.setDate(date.getDate() - 1);

    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const nextDayStr = formatDate(nextDay);
    const prevDayStr = formatDate(previousDay);

    this.diaryService.getDiaryByDateAndDietId(nextDayStr, this.diary.diet.id).pipe(
      catchError((error) => {
        if (error.status === 404) {
          this.isErrorNextResponse = true;
          return of(null);
        }
      })
    ).subscribe(data => {
      if (this.isErrorNextResponse) {
        this.tomorrowDiary = null;
      } else {
        this.tomorrowDiary = data;
      }
      this.isErrorNextResponse = false;
    });

    this.diaryService.getDiaryByDateAndDietId(prevDayStr, this.diary.diet.id).pipe(
      catchError((error) => {
        if (error.status === 404) {
          this.isErrorPreviousResponse = true;
          return of(null);
        }
      })
    ).subscribe(data => {
      if (this.isErrorPreviousResponse) {
        this.yesterdayDiary = null;
      } else {
        this.yesterdayDiary = data;
      }
      this.isErrorPreviousResponse = false;
    });

  }

  rerirectToNextDiaryDetails() {
    if (this.tomorrowDiary) {
      this.meals = [];
      this.isResponseHere = false;
      this.router.navigate([`meals/diary/${this.tomorrowDiary.id}`]);
    }
  }

  redirectToPreviousDiaryDetails() {
    if (this.yesterdayDiary) {
      this.meals = [];
      this.isResponseHere = false;
      this.router.navigate([`meals/diary/${this.yesterdayDiary.id}`]);
    }
  }

  redirectToDiary() {
    this.router.navigate(['meals/diary']);
  }

  canRedirectToPrevious() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (this.yesterdayDiary === null) {
      return false;
    }

    const givenDate = new Date(this.yesterdayDiary.date);

    return givenDate >= today
  }

  canRedirectToNext() {
    if (this.tomorrowDiary === null) {
      return false;
    } else {
      return true;
    }
  }

  openDialog(image: string) {
    this.dialogRef.open(PopUpComponent, { data : image });
  }

  formatDayMonth(number: number) {
    if (number < 10) {
      return `0${number}`;
    }
    return number.toString();
  }
}
