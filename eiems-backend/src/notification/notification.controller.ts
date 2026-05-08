/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // GET /notifications — lấy thông báo của user hiện tại
  @Get()
  @Roles('OWNER', 'ADMIN', 'ACCOUNTANT', 'STAFF')
  findAll(@Request() req: any, @Query('unread') unread?: string) {
    return this.notificationService.findByUser(req.user.id, unread === 'true');
  }

  // GET /notifications/unread-count
  @Get('unread-count')
  @Roles('OWNER', 'ADMIN', 'ACCOUNTANT', 'STAFF')
  countUnread(@Request() req: any) {
    return this.notificationService.countUnread(req.user.id);
  }

  // PATCH /notifications/:id/read
  @Patch(':id/read')
  @Roles('OWNER', 'ADMIN', 'ACCOUNTANT', 'STAFF')
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  // PATCH /notifications/read-all
  @Patch('read-all')
  @Roles('OWNER', 'ADMIN', 'ACCOUNTANT', 'STAFF')
  markAllAsRead(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.notificationService.markAllAsRead(req.user.id);
  }
}
