import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService
} from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? exception.message
        : "Erro interno ao processar a solicitação";

    this.logger.error(
      {
        requestId: request.requestId,
        method: request.method,
        path: request.path,
        status,
        message
      },
      exception instanceof Error ? exception.stack : undefined,
      "ExceptionFilter"
    );

    response.status(status).json({
      error: {
        code: status,
        message,
        requestId: request.requestId
      }
    });
  }
}
