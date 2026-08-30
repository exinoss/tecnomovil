import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { App } from './app';
import { SessionLockService } from './core/services/session-lock.service';
import { BackButtonService } from './core/services/back-button.service';

describe('App', () => {
  const sessionLockServiceMock = { init: jasmine.createSpy('init') };
  const backButtonServiceMock = { init: jasmine.createSpy('init') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [App],
      providers: [
        { provide: SessionLockService, useValue: sessionLockServiceMock },
        { provide: BackButtonService, useValue: backButtonServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
