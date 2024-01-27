import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClienteIdentificado } from 'src/enterprise/cliente/model/cliente-identificado.model';
import { ClienteConstants } from 'src/shared/constants';
import { BuscarClientePorCpfUseCase } from 'src/application/cliente/usecase/buscar-cliente-por-cpf.usecase';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';

@Injectable()
export class IdentificarClienteUseCase {
  private logger: Logger = new Logger(IdentificarClienteUseCase.name);

  constructor(
    @Inject(ClienteConstants.BUSCAR_CLIENTE_POR_CPF_USECASE) private buscarUsecase: BuscarClientePorCpfUseCase,
  ) {}

  async identificarClientePorCpf(cpf: string): Promise<ClienteIdentificado> {
    if (cpf === undefined) {
      this.logger.log(`Cliente ${cpf} identificado como anonimo`);
      return Promise.resolve(new ClienteIdentificado(undefined));
    }

    return await this.buscarUsecase
      .buscarClientePorCpf(cpf)
      .then((cliente) => {
        return new ClienteIdentificado(cliente);
      })
      .catch((error) => {
        if (error instanceof NaoEncontradoApplicationException) {
          return new ClienteIdentificado(undefined);
        }
        this.logger.error(`Houve um erro na identificação do cliente ${cpf}: ${error}`);
        throw error;
      });
  }
}
