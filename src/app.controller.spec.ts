import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get(AppController);
  });

  describe('GET /', () => {
    it('returns the running message', () => {
      expect(appController.getRoot()).toEqual({
        message: 'Pet Grooming API is running',
      });
    });
  });
});
