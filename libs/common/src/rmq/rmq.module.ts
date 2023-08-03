import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientsModule,
  ClientsModuleAsyncOptions,
  Transport,
} from '@nestjs/microservices';
import { RmqService } from './rmq.service';

interface RmqModuleOptions {
  name: string;
}

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  static register(
    serviceOption: RmqModuleOptions | RmqModuleOptions[],
  ): DynamicModule {
    const options: ClientsModuleAsyncOptions = Array.isArray(serviceOption)
      ? serviceOption.map((option) => ({
          name: option.name,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.RMQ,
            options: {
              urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
              queue: option.name,
            },
          }),
          inject: [ConfigService],
        }))
      : [
          {
            name: serviceOption.name,
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.get<string>('RABBITMQ_URI')],
                queue: serviceOption.name,

                // queue: configService.get<string>(
                //   `RABBIT_MQ_${serviceOption.name}_QUEUE`,
                // ),
              },
            }),
            inject: [ConfigService],
          },
        ];
    return {
      module: RmqModule,
      imports: [ClientsModule.registerAsync(options)],
      exports: [ClientsModule],
    };
  }
}
