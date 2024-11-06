import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import { AuthUser } from "./auth.guard";

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): AuthUser => {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    },
  );

  export const IS_PUBLIC_KEY = 'isPublic';

  export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);