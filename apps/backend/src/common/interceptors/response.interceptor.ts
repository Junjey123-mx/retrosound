import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type PaginatedFlat = {
  data: unknown;
  total: number;
  page: number;
  limit: number;
};

type WithMeta = {
  data: unknown;
  meta: Record<string, unknown>;
};

function isPaginatedFlat(obj: object): obj is PaginatedFlat {
  return 'data' in obj && 'total' in obj && 'page' in obj && 'limit' in obj;
}

function hasDataAndMeta(obj: object): obj is WithMeta {
  return 'data' in obj && 'meta' in obj;
}

/**
 * Wraps successful responses in { success, data, meta? }.
 *
 * NOT registered globally by default to avoid breaking frontend contracts
 * built against the bare response shape. Apply per-controller or per-endpoint
 * with @UseInterceptors(ResponseInterceptor) once the frontend is updated,
 * or register globally in main.ts when ready.
 *
 * Safe to register globally if:
 * - Frontend already handles the { success, data } envelope.
 * - Endpoints using @Res() are not affected (NestJS skips reply pipeline
 *   when isResponseHandled = true, i.e. @Res() without passthrough).
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (data === undefined || data === null) {
          return { success: true };
        }

        if (typeof data !== 'object' || Array.isArray(data)) {
          return { success: true, data };
        }

        if (isPaginatedFlat(data)) {
          return {
            success: true,
            data: data.data,
            meta: {
              total: data.total,
              page: data.page,
              limit: data.limit,
            },
          };
        }

        if (hasDataAndMeta(data)) {
          return {
            success: true,
            data: data.data,
            meta: data.meta,
          };
        }

        return { success: true, data };
      }),
    );
  }
}
