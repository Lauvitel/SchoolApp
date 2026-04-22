import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserInput) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existingEmail) {
      throw new BadRequestException('Email already in use');
    }

    const existingPseudo = await this.prisma.user.findUnique({
      where: { pseudo: input.pseudo },
    });
    if (existingPseudo) {
      throw new BadRequestException('Pseudo already in use');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    return this.prisma.user.create({
      data: {
        email: input.email,
        pseudo: input.pseudo,
        password: hashedPassword,
        role: input.role,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateMe(userId: string, input: UpdateUserInput) {
    const data: Record<string, unknown> = { ...input };

    if (input.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (input.pseudo) {
      const existing = await this.prisma.user.findUnique({
        where: { pseudo: input.pseudo },
      });
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Pseudo already in use');
      }
    }

    if (input.password) {
      data.password = await bcrypt.hash(input.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async deleteMe(userId: string) {
    return this.prisma.user.delete({ where: { id: userId } });
  }
}
