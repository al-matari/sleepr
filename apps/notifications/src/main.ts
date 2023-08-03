import { NestFactory } from '@nestjs/core';
import { RmqOptions } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { NotificationsModule } from './notifications.module';
import { RmqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(
    rmqService.getOptions('notifications', true),
  );
  app.useLogger(app.get(Logger));
  await app.startAllMicroservices();
}
bootstrap();
