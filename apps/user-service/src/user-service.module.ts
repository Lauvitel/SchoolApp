import { Module } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UserServiceService],
})
export class UserServiceModule {}
