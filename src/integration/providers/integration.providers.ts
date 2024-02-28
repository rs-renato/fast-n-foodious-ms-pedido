import { Provider } from '@nestjs/common';
import { ProdutoIntegration } from '../produto/produto.integration';
import { ConfigService } from '@nestjs/config';
import { SQSClient } from '@aws-sdk/client-sqs';
import { PagamentoRestIntegration } from 'src/integration/pagamento/pagamento.rest.integration';
import { SqsIntegration } from 'src/integration/sqs/sqs.integration';
import { BuscarPedidoPorIdUseCase, EditarPedidoUseCase } from 'src/application/pedido/usecase';
import { ClienteConstants, PedidoConstants } from 'src/shared/constants';
import { BuscarClientePorIdPedidoUsecase } from 'src/application/cliente/usecase/buscar-cliente-por-id-pedido.usecase';
import { SesIntegration } from 'src/integration/ses/ses.integration';
import { SESClient } from '@aws-sdk/client-ses';

export const IntegrationProviders: Provider[] = [
  {
    provide: ProdutoIntegration,
    useClass: ProdutoIntegration,
  },
  {
    provide: PagamentoRestIntegration,
    useClass: PagamentoRestIntegration,
  },
  {
    inject: [
      ConfigService,
      PedidoConstants.EDITAR_PEDIDO_USECASE,
      PedidoConstants.BUSCAR_PEDIDO_POR_ID_USECASE,
      ClienteConstants.BUSCAR_CLIENTE_POR_ID_PEDIDO,
    ],
    provide: SqsIntegration,
    useFactory: (
      configService: ConfigService,
      editarPedidoUseCase: EditarPedidoUseCase,
      buscarPedidoPorIdUseCase: BuscarPedidoPorIdUseCase,
      buscarClientePorIdPedidoUsecase: BuscarClientePorIdPedidoUsecase,
    ): SqsIntegration =>
      new SqsIntegration(
        new SQSClient({ endpoint: configService.get('AWS_ENDPOINT') }),
        new SesIntegration(
          new SESClient({ endpoint: configService.get('AWS_ENDPOINT') }),
          buscarClientePorIdPedidoUsecase,
        ),
        editarPedidoUseCase,
        buscarPedidoPorIdUseCase,
      ),
  },
];
