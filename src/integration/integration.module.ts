import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ProdutoIntegration } from './produto/produto.integration';

@Module({
   imports: [HttpModule], // imported axios/HttpModule
   providers: [ProdutoIntegration],
   exports: [ProdutoIntegration],
})
export class IntegrationModule {}
