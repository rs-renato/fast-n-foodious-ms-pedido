import { Inject, Provider } from '@nestjs/common';
import { ClienteService } from 'src/application/cliente/service/cliente.service';
import { Cliente } from 'src/enterprise/cliente/model/cliente.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { SalvarClienteUseCase } from 'src/application/cliente/usecase/salvar-cliente.usecase';
import { SalvarClienteValidator } from 'src/application/cliente/validation/salvar-cliente.validator';
import { BuscarClienteValidator } from 'src/application/cliente/validation/buscar-cliente.validator';
import { CpfUnicoClienteValidator } from 'src/application/cliente/validation/cpf-unico-cliente.validator';
import { BuscarClientePorCpfUseCase } from 'src/application/cliente/usecase/buscar-cliente-por-cpf.usecase';
import { CpfValidoClienteValidator } from 'src/application/cliente/validation/cpf-valido-cliente.validator';
import { EmailUnicoClienteValidator } from 'src/application/cliente/validation/email-unico-cliente.validator';
import { EmailValidoClienteValidator } from 'src/application/cliente/validation/email-valido-cliente.validator';
import { IdentificarClienteUseCase } from 'src/application/cliente/usecase/identificar-cliente-por-cpf.usecase';
import { ClienteConstants, PedidoConstants } from 'src/shared/constants';
import { BuscarClientePorIdPedidoUsecase } from 'src/application/cliente/usecase/buscar-cliente-por-id-pedido.usecase';
import { BuscarTodosPedidosPorClienteIdUseCase } from 'src/application/pedido/usecase/buscar-todos-pedidos-por-cliente-id-usecase';
import { EditarPedidoUseCase } from 'src/application/pedido/usecase';
import { DeletarClientePorCpfUseCase } from 'src/application/cliente/usecase/deletar-cliente-por-cpf.usecase';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IPedidoRepository } from 'src/enterprise/pedido/repository/pedido.repository.interface';
import { SqsIntegration } from 'src/integration/sqs/sqs.integration';

export const ClienteProviders: Provider[] = [
  { provide: ClienteConstants.ISERVICE, useClass: ClienteService },
  {
    provide: ClienteConstants.BUSCAR_CLIENTE_POR_CPF_USECASE,
    inject: [ClienteConstants.IREPOSITORY, ClienteConstants.BUSCAR_CLIENTE_VALIDATOR],
    useFactory: (repository: IRepository<Cliente>, validators: BuscarClienteValidator[]): BuscarClientePorCpfUseCase =>
      new BuscarClientePorCpfUseCase(repository, validators),
  },
  {
    provide: ClienteConstants.SALVAR_CLIENTE_USECASE,
    inject: [ClienteConstants.IREPOSITORY, ClienteConstants.SALVAR_CLIENTE_VALIDATOR],
    useFactory: (repository: IRepository<Cliente>, validators: SalvarClienteValidator[]): SalvarClienteUseCase =>
      new SalvarClienteUseCase(repository, validators),
  },
  {
    provide: ClienteConstants.IDENTIFICAR_CLIENTE_POR_CPF_USECASE,
    inject: [ClienteConstants.BUSCAR_CLIENTE_POR_CPF_USECASE],
    useFactory: (usecase: BuscarClientePorCpfUseCase): IdentificarClienteUseCase =>
      new IdentificarClienteUseCase(usecase),
  },
  {
    provide: ClienteConstants.BUSCAR_CLIENTE_POR_ID_PEDIDO,
    inject: [PedidoConstants.IREPOSITORY, ClienteConstants.IREPOSITORY],
    useFactory: (pedidoRepository, clienteRepository): BuscarClientePorIdPedidoUsecase =>
      new BuscarClientePorIdPedidoUsecase(pedidoRepository, clienteRepository),
  },
  {
    provide: ClienteConstants.SALVAR_CLIENTE_VALIDATOR,
    inject: [ClienteConstants.IREPOSITORY],
    useFactory: (repository: IRepository<Cliente>): SalvarClienteValidator[] => [
      new CpfValidoClienteValidator(),
      new EmailValidoClienteValidator(),
      new EmailUnicoClienteValidator(repository),
      new CpfUnicoClienteValidator(repository),
    ],
  },
  {
    provide: ClienteConstants.BUSCAR_CLIENTE_VALIDATOR,
    useFactory: (): BuscarClienteValidator[] => [new CpfValidoClienteValidator()],
  },
  {
    provide: ClienteConstants.DELETAR_CLIENTE_POR_CPF_USECASE,
    inject: [
      ClienteConstants.IREPOSITORY,
      PedidoConstants.IREPOSITORY,
      ClienteConstants.BUSCAR_CLIENTE_POR_CPF_USECASE,
      PedidoConstants.BUSCAR_TODOS_PEDIDOS_POR_CLIENTE_ID_USECASE,
      SqsIntegration,
    ],
    useFactory: (
      clienteRepository: IRepository<Cliente>,
      pedidoRepository: IPedidoRepository,
      buscarClientePorCpfUseCase: BuscarClientePorCpfUseCase,
      buscarTodosPedidosPorClienteIdUseCase: BuscarTodosPedidosPorClienteIdUseCase,
      clienteSnsIntegration: SqsIntegration,
    ): DeletarClientePorCpfUseCase =>
      new DeletarClientePorCpfUseCase(
        clienteRepository,
        pedidoRepository,
        buscarClientePorCpfUseCase,
        buscarTodosPedidosPorClienteIdUseCase,
        clienteSnsIntegration,
      ),
  },
];
