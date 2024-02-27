import { Provider } from '@nestjs/common';
import { ProdutoIntegration } from '../produto/produto.integration';
import { ConfigService } from '@nestjs/config';
import { SQSClient } from '@aws-sdk/client-sqs';
import { PagamentoRestIntegration } from 'src/integration/pagamento/pagamento.rest.integration';
import { SqsIntegration } from 'src/integration/sqs/sqs.integration';
import { BuscarPedidoPorIdUseCase, EditarPedidoUseCase } from 'src/application/pedido/usecase';
import { PedidoConstants } from 'src/shared/constants';

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
    inject: [ConfigService, PedidoConstants.BUSCAR_PEDIDO_POR_ID_USECASE, PedidoConstants.EDITAR_PEDIDO_USECASE],
    provide: SqsIntegration,
    useFactory: (
      configService: ConfigService,
      buscarPedidoPorIdUseCase: BuscarPedidoPorIdUseCase,
      editarPedidoUseCase: EditarPedidoUseCase,
    ): SqsIntegration =>
      new SqsIntegration(
        new SQSClient({ endpoint: configService.get('AWS_SQS_ENDPOINT') }),
        editarPedidoUseCase,
        buscarPedidoPorIdUseCase,
      ),
  },
];
