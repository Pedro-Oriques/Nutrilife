import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/services/user.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  await userService.createUser({
    fullName: 'Administrador',
    email: 'sysadmin@qacoders.com',
    password: '1234@Test',
    confirmPassword: '1234@Test',
    role: 'admin',
  });

  console.log('Admin criado!');
  await app.close();
}

bootstrap();
