import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express, { Express } from 'express';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

const server: Express = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['log', 'error', 'warn'],
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: true, credentials: true });

  await app.init();
}

// Retry on failure so a transient cold-start error doesn't permanently brick
// a warm serverless instance for the rest of its lifetime.
let ready: Promise<void> | null = null;

function getReady(): Promise<void> {
  if (!ready) {
    ready = bootstrap().catch((err) => {
      console.error('[bootstrap] NestJS init failed:', err);
      ready = null; // allow the next request to retry
      throw err;
    });
  }
  return ready;
}

export default async function handler(req: express.Request, res: express.Response) {
  try {
    await getReady();
  } catch (err) {
    console.error('[handler] app not ready:', err);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Service temporarily unavailable — initialization failed',
      error: err instanceof Error ? err.message : String(err),
      path: req.url,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  server(req, res);
}
