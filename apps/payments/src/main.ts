import { NestFactory } from '@nestjs/core';
import { RmqOptions } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { PaymentsModule } from './payments.module';
import { RmqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions('payments', true));

  app.useLogger(app.get(Logger));
  await app.startAllMicroservices();
}
bootstrap();
