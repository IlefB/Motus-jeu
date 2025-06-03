import { TestBed } from '@angular/core/testing';

import { MotService } from './mot.service';

describe('MotService', () => {
  let service: MotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
