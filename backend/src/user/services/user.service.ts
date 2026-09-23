import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash, compare } from 'bcrypt';
import { Model } from 'mongoose';
import { CreateUserDto } from '../dtos/user.dto';
import { USER_MESSAGES } from '../messages/user.message';
import { User, UserDocument } from '../schemas/user.squema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<Partial<User>> {
    const user = await this.userModel.findById(id).lean();

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { password, secretAnswer, ...rest } = user;
    return rest;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean();
  }

  async updateUser(
    id: string,
    updateData: Partial<CreateUserDto>,
  ): Promise<Partial<User>> {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new HttpException('Nenhum dado para atualizar', 400);
    }

    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const dataToUpdate: any = { ...updateData };

    if (dataToUpdate.password) {
      dataToUpdate.password = await hash(dataToUpdate.password, 10);
    }

    delete dataToUpdate.confirmPassword;

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, dataToUpdate, { new: true })
      .lean();

    if (!updatedUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { password, secretAnswer, ...rest } = updatedUser;
    return rest;
  }

  async createUser(UserDto: CreateUserDto): Promise<User> {
    const emailExists = await this.userModel.exists({ email: UserDto.email });

    if (emailExists) {
      throw new HttpException(
        { message: USER_MESSAGES.EMAIL_ALREADY_REGISTERED },
        409,
      );
    }

    if (UserDto.password !== UserDto.confirmPassword) {
      throw new HttpException(
        { message: USER_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH },
        400,
      );
    }

    const hashedPassword = await hash(UserDto.password, 10);

    // secretAnswer can be omitted for admin users.
    const normalizedSecretAnswer = UserDto.secretAnswer?.trim().toLowerCase();
    const hashedSecretAnswer = normalizedSecretAnswer
      ? await hash(normalizedSecretAnswer, 10)
      : undefined;

    const created = new this.userModel({
      ...UserDto,
      password: hashedPassword,
      secretAnswer: hashedSecretAnswer,
    });

    const saved = await created.save();
    const obj = saved.toObject();
    delete obj.password;
    return obj;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) return null;
    const isMatch = await compare(password, user.password);
    if (!isMatch) return null;
    const obj = user.toObject();
    delete obj.password;
    delete obj.secretAnswer;
    return obj;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async findAll(): Promise<Partial<User>[]> {
    const users = await this.userModel.find().lean();
    return users.map(({ password, secretAnswer, ...rest }) => rest);
  }
}
