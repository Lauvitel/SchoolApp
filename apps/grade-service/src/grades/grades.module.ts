import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GradesService } from './grades.service';
import { GradesResolver } from './grades.resolver';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [GradesService, GradesResolver, JwtStrategy],
})
export class GradesModule {}
