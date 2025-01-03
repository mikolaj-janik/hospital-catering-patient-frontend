import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { SearchBarService } from './search-bar.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Meal } from '../common/meal';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  constructor(
    private authService: AuthService,
    private http: HttpClient,
  ) { }

  getPremiumMealsByDietIdAndType(dietId: number, type: string): Observable<Meal[]> {
    const headers = this.authService.getAuthHeaders();
    const url = `${environment.apiUrl}/meals/premium?dietId=${dietId}&type=${type}`;

    return this.http.get<Meal[]>(url, { headers });
  }

  getPremiumMealsByDietIdAndKeyword(dietId: number, name: string): Observable<Meal[]> {
    const headers = this.authService.getAuthHeaders();
    const url = `${environment.apiUrl}/meals/premium/${dietId}?name=${name}`;

    return this.http.get<Meal[]>(url, { headers });
  }

  getMealById(id: number): Observable<Meal> {
    const headers = this.authService.getAuthHeaders();
    const url = `${environment.apiUrl}/meals/${id}`;

    return this.http.get<Meal>(url, { headers });
  }
}
