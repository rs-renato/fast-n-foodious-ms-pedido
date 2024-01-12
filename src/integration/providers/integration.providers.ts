import { Provider } from '@nestjs/common';
import { ProdutoIntegration } from '../produto/produto.integration';
import { PagamentoIntegration } from 'src/integration/pagamento/pagamento.integration';

export const IntegrationProviders: Provider[] = [
   {
      provide: ProdutoIntegration,
      useClass: ProdutoIntegration,
   },
   {
      provide: PagamentoIntegration,
      useClass: PagamentoIntegration,
   },
];
