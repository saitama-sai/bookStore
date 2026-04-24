import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Handle SPA routing - redirect only navigation requests to index.html
  app.use((req, res, next) => {
    // If it's an API request, an upload request, or a request for a file with an extension (.js, .css, .png, etc.)
    // let it pass to the static assets handler or the API
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.includes('.')) {
      return next();
    }
    
    // For all other routes (navigation), serve index.html
    const indexPath = join(__dirname, '..', 'public', 'index.html');
    res.sendFile(indexPath);
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Kitabevi API is running on port: ${port}`);
}
bootstrap();
