import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';


export class SerializerInterceptor implements NestInterceptor {
  // dto is the variable. so you can use this class for different entities
  constructor(private dto: any) {}
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // you can write some code to run before request is handled
    return handler.handle().pipe(
      // data is the incoming user entity
      map((data: any) => {
        return plainToInstance(this.dto, data, {
          //   this takes care of everything. this will expose things that are set in the UserDto
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
