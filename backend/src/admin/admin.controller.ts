import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('reset-database')
  resetDatabase() {
    return this.adminService.resetDatabase();
  }

  @Post('seed-demo-data')
  seedDemoData() {
    return this.adminService.seedDemoData();
  }

  @Post('clear-corrupted-data')
  clearCorruptedData() {
    return this.adminService.clearCorruptedData();
  }

  @Get('database-stats')
  getDatabaseStats() {
    return this.adminService.getDatabaseStats();
  }
}
