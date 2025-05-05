import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestPreviewComponent } from './quest-preview.component';

describe('QuestPreviewComponent', () => {
  let component: QuestPreviewComponent;
  let fixture: ComponentFixture<QuestPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
