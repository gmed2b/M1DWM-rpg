import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattlePreviewComponent } from './battle-preview.component';

describe('BattlePreviewComponent', () => {
  let component: BattlePreviewComponent;
  let fixture: ComponentFixture<BattlePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattlePreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BattlePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
