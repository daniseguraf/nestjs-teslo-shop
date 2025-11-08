import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

export const GetRawHeaders = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const rawHeaders = req.rawHeaders;

    if (!rawHeaders)
      throw new InternalServerErrorException('User not found (request)');

    return rawHeaders;
  },
);
