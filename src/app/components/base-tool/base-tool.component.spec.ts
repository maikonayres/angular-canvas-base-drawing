import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseToolComponent } from './base-tool.component';

describe('BaseToolComponent', () => {
  let component: BaseToolComponent;
  let fixture: ComponentFixture<BaseToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseToolComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BaseToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
