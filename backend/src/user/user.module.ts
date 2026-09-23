import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas/user.squema';
import { UserService } from '../user/services/user.service';
import { UserController } from '../user/controllers/user.controller';
import { RegisterController } from '../user/controllers/register.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController, RegisterController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
