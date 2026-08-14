import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { EMPTY, of } from 'rxjs';

import { AnalisisIAService } from '../../core/services/analisis-ia.service';
import { AnalisisIa } from './analisis-ia';

describe('AnalisisIa', () => {
  let component: AnalisisIa;
  let fixture: ComponentFixture<AnalisisIa>;
  const analisisIAServiceMock = {
    generando$: of(false),
    nuevoAnalisis$: EMPTY,
    getHistorialAnalisis: () => of([]),
    getAnalisisById: () => of(null),
    generarAnalisisBackground: jasmine.createSpy('generarAnalisisBackground')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnalisisIa],
      imports: [CommonModule, FormsModule],
      providers: [{ provide: AnalisisIAService, useValue: analisisIAServiceMock }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalisisIa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
