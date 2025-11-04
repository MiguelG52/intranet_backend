import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';

import { User } from '../users/entities/user.entity';


const mockMailerService = {
  sendMail: jest.fn(), 
};

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService; 
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService, 
        {
          provide: MailerService, 
          useValue: mockMailerService, 
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);


    jest.clearAllMocks();
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('sendPasswordResetEmail', () => {
    it('debería llamar a mailerService.sendMail con los parámetros correctos', async () => {

      const mockUser = new User();
      mockUser.email = 'test@example.com';
      mockUser.name = 'Usuario de Prueba';
      
      const mockToken = 'abc123tokenxyz';
      const expectedResetUrl = `https://tu-frontend.com/reset-password?token=${mockToken}`;

      await service.sendPasswordResetEmail(mockUser, mockToken);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: expect.stringContaining('Restablece tu contraseña'),
        html: expect.stringContaining(expectedResetUrl), 
      });
    });
  });
});