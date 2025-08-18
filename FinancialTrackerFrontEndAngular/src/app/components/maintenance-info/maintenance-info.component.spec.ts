import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceInfoComponent } from './maintenance-info.component';

describe('MaintenanceInfoComponent', () => {
  let component: MaintenanceInfoComponent;
  let fixture: ComponentFixture<MaintenanceInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
