import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const configService = new ConfigService();
  const swaggerEnabled = configService.get('SWAGGER_ENABLE') !== 'false';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Good Blast API')
      .setDescription('Good Blast API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  app.enableCors();
  app.register(helmet, {
    contentSecurityPolicy: false,
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(configService.get('PORT'), '0.0.0.0');
}
bootstrap();
