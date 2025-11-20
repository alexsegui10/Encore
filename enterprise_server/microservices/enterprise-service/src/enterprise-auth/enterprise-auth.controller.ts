import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { EnterpriseAuthService } from './enterprise-auth.service';
import { LoginEnterpriseDto } from './dto/login-enterprise.dto';
import { UpdateEnterpriseAuthDto } from './dto/update-enterprise-auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class EnterpriseAuthController {
  constructor(private readonly service: EnterpriseAuthService) {}

  @Post('login')
  login(@Body() data: LoginEnterpriseDto) {
    return this.service.login(data);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req) {
    return this.service.getMe(req.user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Request() req, @Body() data: UpdateEnterpriseAuthDto) {
    return this.service.updateMe(req.user.id, data);
  }
}
