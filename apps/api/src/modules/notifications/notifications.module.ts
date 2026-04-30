import { Module } from "@nestjs/common";
import { NotificationService, MockNotificationProvider } from "./notification.service";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

@Module({
  providers: [NotificationService, MockNotificationProvider, PrismaService],
  exports: [NotificationService]
})
export class NotificationsModule {}
