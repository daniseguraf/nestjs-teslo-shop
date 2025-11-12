import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBErrors } from 'src/common/handleDBErrors';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const { password, email, ...rest } = createUserDto;
      const encryptedPassword = bcrypt.hashSync(password, 10);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: userPassword, ...userData } =
        await this.userRepository.save({
          ...rest,
          email: email.toLowerCase().trim(),
          password: encryptedPassword,
        });

      const token = this.getJwtToken({ id: userData.id });

      return {
        ...userData,
        token,
      };
    } catch (error) {
      handleDBErrors(error);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user) {
      throw new UnauthorizedException('Not valid credentials - email');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials - password');
    }

    const token = this.getJwtToken({ id: user.id });

    return { ...user, token };
  }

  async checkAuthStatus(user: User) {
    const token = this.getJwtToken({ id: user.id });

    return { ...user, token };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }
}
