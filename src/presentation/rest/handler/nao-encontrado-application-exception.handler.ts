import { Catch, HttpStatus } from '@nestjs/common';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';
import { ExceptionHandler } from 'src/presentation/rest/handler/exception.handler';

@Catch(NaoEncontradoApplicationException)
export class NaoEncontradoExceptionHandler extends ExceptionHandler<NaoEncontradoApplicationException> {
  constructor() {
    super(HttpStatus.NOT_FOUND);
  }
}
