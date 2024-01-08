import { Inject, Injectable, Logger } from '@nestjs/common';
import { CategoriaProduto } from 'src/enterprise/categoria/model/categoria-produto.model';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { IRepository } from 'src/enterprise/repository/repository';
import { CategoriaProdutoConstants } from 'src/shared/constants';
import {ProdutoIntegration} from "../../../integration/produto/produto.integration";

@Injectable()
export class BuscarTodasCategoriasUseCase {
   private logger: Logger = new Logger(BuscarTodasCategoriasUseCase.name);

   constructor(@Inject(CategoriaProdutoConstants.IREPOSITORY) private repository: IRepository<CategoriaProduto>,
               @Inject(ProdutoIntegration) private produtoIntegration: ProdutoIntegration) {}

   async buscarTodasCategorias(): Promise<CategoriaProduto[]> {
      this.logger.log("\n\nRODRIGO\n\n")
      let produtoById = await this.produtoIntegration.getProdutoById(1);
      this.logger.log(`produtoById = ${JSON.stringify(produtoById)}`)
      this.logger.log("\n\nRODRIGO\n\n")
      const categorias = await this.repository.findAll().catch((error) => {
         this.logger.error(`Erro ao listar categorias no banco de dados: ${error}`);
         throw new ServiceException(`Erro ao listar categorias no banco de dados: ${error}`);
      });
      if (categorias.length > 0) {
         return categorias;
      }
   }
}
