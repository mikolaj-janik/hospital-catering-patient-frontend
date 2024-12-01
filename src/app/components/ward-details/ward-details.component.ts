import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';
import { Hospital } from 'src/app/common/hospital';
import { Patient } from 'src/app/common/patient';
import { Ward } from 'src/app/common/ward';
import { HospitalService } from 'src/app/service/hospital.service';
import { PatientService } from 'src/app/service/patient.service';
import { WardService } from 'src/app/service/ward.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { DieticianService } from 'src/app/service/dietician.service';
import { Dietician } from 'src/app/common/dietician';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-hospital-details',
  standalone: true,
  imports: [SweetAlert2Module],
  templateUrl: './ward-details.component.html',
  styleUrl: './ward-details.component.scss'
})
export class WardDetailsComponent {

  dialogRef = inject(MatDialog);
  hospitalService = inject(HospitalService);
  patientService = inject(PatientService);
  dieticianService = inject(DieticianService);
  wardService = inject(WardService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  isResponseHere = false;

  dieticians: Dietician[] = [];
  patient: Patient = null;
  
  ngOnInit() {
    const login = localStorage.getItem('USER_LOGIN');
    this.patientService.getPatientByLogin(login).subscribe((data) => {
      this.patient = data;
      this.dieticianService.getDieticiansByWardId(data.ward.id).subscribe((data) => {
        this.dieticians = data;
        this.isResponseHere = true;
      });
    });
  }
  openDialog(image: string) {
    this.dialogRef.open(PopUpComponent, { data : image });
  }
}
