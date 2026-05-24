import { Test } from '@nestjs/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    controller = moduleRef.get(HealthController);
  });

  it('responde ok', () => {
    const res = controller.check();
    expect(res.status).toBe('ok');
    expect(res.service).toBe('faro-api');
  });
});
