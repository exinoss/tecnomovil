import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { BaseChartDirective } from 'ng2-charts';
import { of } from 'rxjs';

import { AnalisisIAService } from '../../core/services/analisis-ia.service';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  const analisisIAServiceMock = {
    getHistorialAnalisis: () => of([]),
    getUltimoAnalisis: () => of(null),
    getAnalisisById: () => of(null)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Dashboard],
      imports: [CommonModule, FormsModule, BaseChartDirective],
      providers: [
        { provide: Title, useValue: { setTitle: jasmine.createSpy('setTitle') } },
        { provide: AnalisisIAService, useValue: analisisIAServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
