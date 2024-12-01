import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalDetailsComponent } from './ward-details.component';

describe('HospitalDetailsComponent', () => {
  let component: HospitalDetailsComponent;
  let fixture: ComponentFixture<HospitalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
