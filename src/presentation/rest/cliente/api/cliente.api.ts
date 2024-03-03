import { Body, Controller, Delete, Get, HttpCode, Inject, Logger, Post, Query, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IClienteService } from 'src/application/cliente/service/cliente.service.interface';
import { BaseRestApi } from 'src/presentation/rest/base.api';
import { BuscarPorCpfClienteRequest } from 'src/presentation/rest/cliente/request/buscar-por-cpf-cliente.request';
import { IdentificarPorCpfClienteRequest } from 'src/presentation/rest/cliente/request/identificar-por-cpf-cliente.request';
import { SalvarClienteRequest } from 'src/presentation/rest/cliente/request/salvar-cliente.request';
import { BuscarPorCpfClienteResponse } from 'src/presentation/rest/cliente/response/buscar-por-cpf-cliente.response';
import { IdentificarPorCpfClienteResponse } from 'src/presentation/rest/cliente/response/identificar-por-cpf-cliente.response';
import { SalvarClienteResponse } from 'src/presentation/rest/cliente/response/salvar-cliente.response';
import { ClienteConstants } from 'src/shared/constants';

@Controller('v1/cliente')
@ApiTags('Cliente')
export class ClienteRestApi extends BaseRestApi {
  private logger: Logger = new Logger(ClienteRestApi.name);

  constructor(@Inject(ClienteConstants.ISERVICE) private service: IClienteService) {
    super();
  }

  @Post()
  @ApiOperation({
    summary: 'Adiciona um novo cliente',
    description: 'Adiciona um novo cliente identificado por nome, email e cpf',
  })
  @ApiCreatedResponse({ description: 'Cliente salvo com sucesso', type: SalvarClienteResponse })
  async salvar(@Body() request: SalvarClienteRequest): Promise<SalvarClienteResponse> {
    this.logger.debug(`Salvando cliente request: ${JSON.stringify(request)}`);
    return await this.service
      .save({
        nome: request.nome,
        email: request.email,
        cpf: request.cpf,
      })
      .then((cliente) => {
        this.logger.log(`Cliente salvo com sucesso: ${cliente.id}}`);
        return new SalvarClienteResponse(cliente);
      });
  }

  @Get()
  @ApiOperation({ summary: 'Consulta cliente por CPF', description: 'Realiza consulta de cliente por CPF' })
  @ApiOkResponse({ description: 'Cliente consultado com sucesso', type: BuscarPorCpfClienteResponse })
  async buscaPorCpf(@Query(ValidationPipe) query: BuscarPorCpfClienteRequest): Promise<BuscarPorCpfClienteResponse> {
    this.logger.debug(`Consultando cliente por cpf: ${query}`);
    return await this.service.findByCpf(query.cpf).then((cliente) => {
      return new BuscarPorCpfClienteResponse(cliente);
    });
  }

  @Post('identifica')
  @ApiOperation({ summary: 'Identifica cliente por CPF', description: 'Realiza identificação de cliente por CPF' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Cliente identificado com sucesso', type: IdentificarPorCpfClienteResponse })
  async identificaCliente(
    @Query(ValidationPipe) query: IdentificarPorCpfClienteRequest,
  ): Promise<IdentificarPorCpfClienteResponse> {
    this.logger.debug(`Identificando cliente request: ${query.cpf}`);
    return await this.service.identifyByCpf(query.cpf).then((clienteIdentificado) => {
      this.logger.log(`Cliente identificado com sucesso: ${JSON.stringify(clienteIdentificado)}`);
      return new IdentificarPorCpfClienteResponse(clienteIdentificado);
    });
  }

  @Delete()
  @ApiOperation({ summary: 'Remove cliente pelo CPF2', description: 'Remove cliente pelo CPF22' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Cliente removido com sucesso' })
  async deletaCliente(@Query(ValidationPipe) query: IdentificarPorCpfClienteRequest): Promise<boolean> {
    this.logger.debug(`Deletando cliente: ${query.cpf}`);
    await this.service.deletarByCpf(query.cpf);
    return Promise.resolve(true);
  }
}
