import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-login',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  pesel = '';
  password = '';
  stayLoggedIn = false;
  error = '';
  isLoggedIn! : boolean;
  errorStatusCode! : number;

  authService = inject(AuthService);
  router = inject(Router);

  loginForm = new FormGroup({
    login: new FormControl(this.pesel, [Validators.required]),
    password: new FormControl(this.password, [Validators.required]),
    stayLoggedIn: new FormControl(this.stayLoggedIn)
  });

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(
      (loggedIn: boolean) => {
        this.isLoggedIn = loggedIn;
      }
    );
    this.authService.errorStatusCode$.subscribe(
      (statusCode: number) => {
        this.errorStatusCode = statusCode;
      }
    );
    if (this.isLoggedIn) {
      this.router.navigate['/'];
    }
  }

  login() {
    if (this.loginForm.valid) {
      const { login, password, stayLoggedIn } = this.loginForm.value;
      
      console.log(stayLoggedIn);

      this.authService.login(
      {
        login: login as string,
        password: password as string
      },
      stayLoggedIn)
      .subscribe(() => {
        console.log('Successfully logged in!');
        this.router.navigate(['/']);
      })
    } else {
      console.log('Form is not valid! ');
    }
  }
}
