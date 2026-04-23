import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ClassesService } from './classes.service';
import { ClassesResolver } from './classes.resolver';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [ClassesService, ClassesResolver, JwtStrategy],
})
export class ClassesModule {}
