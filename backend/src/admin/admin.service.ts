import { Injectable } from '@nestjs/common';
import { SeedService } from './seed.service';

@Injectable()
export class AdminService {
  constructor(private seedService: SeedService) {}

  resetDatabase() {
    return this.seedService.resetDatabase();
  }

  seedDemoData() {
    return this.seedService.seedDemoData();
  }

  clearCorruptedData() {
    return this.seedService.clearCorruptedData();
  }

  getDatabaseStats() {
    return this.seedService.getDatabaseStats();
  }
}
