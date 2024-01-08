import { Provider } from '@nestjs/common';
import {ProdutoIntegration} from "../produto/produto.integration";

export const IntegrationProviders: Provider[] = [
   {
      provide: ProdutoIntegration,
      useClass: ProdutoIntegration,
   },
];
