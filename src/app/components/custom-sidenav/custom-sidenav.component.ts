import { CommonModule } from '@angular/common';
import { Component, computed, Input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/service/user.service';
import { User } from 'src/app/common/user';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { PatientService } from 'src/app/service/patient.service';
import { DiaryService } from 'src/app/service/diary.service';

export type MenuItem = {
  icon: string;
  label: string;
  route: string;
  subItems?: MenuItem[];
}

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, RouterModule, MenuItemComponent],
  templateUrl: './custom-sidenav.component.html',
  styleUrl: './custom-sidenav.component.scss'
})
export class CustomSidenavComponent {

  isLoggedIn! : boolean;

  userService = inject(UserService);
  patientService = inject(PatientService);
  diaryService = inject(DiaryService);
  authService = inject(AuthService);
  router = inject(Router);
  toastr = inject(ToastrService);

  currentUser: User;

  sideNavCollapsed = signal(false);
  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }

  ngOnInit() {
    const login = localStorage.getItem('USER_LOGIN');
    
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const todayDateStr = formatDate(today);

    this.patientService.getPatientByLogin(login).subscribe((data) =>{
      this.menuItems.set([
        {
          icon: 'far fa-calendar-alt',
          label: 'Jadłospis',
          route: 'meals/diary'
        },
        {
          icon: 'fas fa-hospital-alt',
          label: 'Mój oddział',
          route: `wards/${data.ward.id}`
        },
        {
          icon: 'fas fa-carrot',
          label: 'Moja dieta',
          route: `meals/diets/${data.diet.id}`,
        }
      ]);
    });
    this.authService.isLoggedIn$.subscribe(
      (loggedIn: boolean) => {
        this.isLoggedIn = loggedIn;
      }
    );
    
    this.userService.getCurrentUser().subscribe(
      (user: User) => {
        this.currentUser = user;
      }
    );
    
    if (!this.isLoggedIn) {
      this.authService.logout(); 
    }
  }

  menuItems = signal<MenuItem[]>([
    
  ]);

  profilePicSize = computed(() => this.sideNavCollapsed() ? '32' : '100');

  logout() {
    if (this.isLoggedIn) {
      this.authService.logout();
      this.toastr.info('Wylogowano pomyślnie');
    }
  }
}
