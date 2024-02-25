import { Provider } from '@nestjs/common';
import { ProdutoIntegration } from '../produto/produto.integration';
import { ConfigService } from '@nestjs/config';
import { SQSClient } from '@aws-sdk/client-sqs';
import { PagamentoRestIntegration } from 'src/integration/pagamento/pagamento.rest.integration';
import { PagamentoSqsIntegration } from 'src/integration/pagamento/pagamento.sqs.integration';

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
    inject: [ConfigService],
    provide: PagamentoSqsIntegration,
    useFactory: (configService: ConfigService): PagamentoSqsIntegration =>
      new PagamentoSqsIntegration(
        new SQSClient({
          endpoint: configService.get('AWS_SQS_ENDPOINT'),
        }),
      ),
  },
];
