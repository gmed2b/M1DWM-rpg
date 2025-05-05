import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattlesComponent } from './battles.component';

describe('BattlesComponent', () => {
  let component: BattlesComponent;
  let fixture: ComponentFixture<BattlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattlesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BattlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
