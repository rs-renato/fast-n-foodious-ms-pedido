import { Inject, Injectable, Logger } from '@nestjs/common';
import { ProdutoIntegration } from 'src/integration/produto/produto.integration';
import { ProdutoDto } from 'src/enterprise/produto/produto-dto';

@Injectable()
export class BuscarProdutoPorIdUseCase {
  private logger = new Logger(BuscarProdutoPorIdUseCase.name);

  constructor(@Inject(ProdutoIntegration) private produtoIntegration: ProdutoIntegration) {}

  async buscarProdutoPorID(idProduto: number): Promise<ProdutoDto> {
    return await this.produtoIntegration.getProdutoById(idProduto);
  }
}
