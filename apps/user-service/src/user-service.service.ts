import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class UserServiceService {
  constructor(private readonly prisma: PrismaService) {}
}
