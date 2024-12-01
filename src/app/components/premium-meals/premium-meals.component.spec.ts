import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumMealsComponent } from './premium-meals.component';

describe('PremiumMealsComponent', () => {
  let component: PremiumMealsComponent;
  let fixture: ComponentFixture<PremiumMealsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumMealsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremiumMealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
