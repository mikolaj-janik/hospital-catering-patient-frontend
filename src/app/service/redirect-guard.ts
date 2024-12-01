import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RedirectGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const dietId = localStorage.getItem('DIET_ID');
    if (dietId) {
      this.router.navigate([`/meals/diary/${dietId}`]);
    } else {
      this.router.navigate(['/meals/diary']);
    }
    return true;
  }
}
