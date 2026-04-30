import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  LoggerService
} from "@nestjs/common";
import type { Request } from "express";
import { Observable, tap } from "rxjs";

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const startedAt = Date.now();
    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          {
            requestId: request.requestId,
            method: request.method,
            path: request.path,
            durationMs: Date.now() - startedAt
          },
          "HttpRequest"
        );
      })
    );
  }
}
