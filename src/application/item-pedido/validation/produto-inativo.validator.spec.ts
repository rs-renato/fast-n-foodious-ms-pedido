import { Test, TestingModule } from '@nestjs/testing';
import { ItemPedido } from 'src/enterprise/item-pedido/model';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { ProdutoConstants } from 'src/shared/constants';
import { ProdutoInativoPedidoValidator } from 'src/application/item-pedido/validation/produto-inativo.validator';
import { ProdutoIntegration } from 'src/integration/produto/produto.integration';
import { ProdutoDto } from 'src/enterprise/produto/produto-dto';
import { HttpModule } from '@nestjs/axios';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';

const IMAGEM_BASE64_SAMPLE =
   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=';

describe('ProdutoInativoPedidoValidator', () => {
   let validator: ProdutoInativoPedidoValidator;
   let produtoIntegration: ProdutoIntegration;

   const produtoAtivo: ProdutoDto = {
      id: 1,
      nome: 'nome correto',
      idCategoriaProduto: 1,
      descricao: 'Teste',
      preco: 10,
      imagemBase64: IMAGEM_BASE64_SAMPLE,
      ativo: true,
   };

   const produtoInativo: ProdutoDto = {
      id: 1,
      nome: 'nome correto',
      idCategoriaProduto: 1,
      descricao: 'Teste',
      preco: 10,
      imagemBase64: IMAGEM_BASE64_SAMPLE,
      ativo: false,
   };

   beforeEach(async () => {
      // Configuração do módulo de teste
      const module: TestingModule = await Test.createTestingModule({
         imports: [HttpModule],
         providers: [...IntegrationProviders, ProdutoInativoPedidoValidator],
      }).compile();

      // Obtém a instância do validator e do repositório a partir do módulo de teste
      validator = module.get<ProdutoInativoPedidoValidator>(ProdutoInativoPedidoValidator);
      produtoIntegration = module.get<ProdutoIntegration>(ProdutoIntegration);
   });

   describe('validate', () => {
      it('deve passar na validação quando o produto está ativo', async () => {
         const itemPedido: ItemPedido = {
            pedidoId: 1,
            produtoId: 1,
            quantidade: 1,
         };
         produtoIntegration.getProdutoById = jest.fn().mockImplementation(() => {
            return Promise.resolve(produtoAtivo);
         });
         const isValid = await validator.validate(itemPedido);
         expect(isValid).toBeTruthy();
      });

      it('deve lançar uma exceção de validação quando o produto está inativo', async () => {
         const itemPedido: ItemPedido = {
            pedidoId: 1,
            produtoId: 1,
            quantidade: 1,
         };

         produtoIntegration.getProdutoById = jest.fn().mockImplementation(() => {
            return Promise.resolve(produtoInativo);
         });

         // O validator deve lançar uma exceção de validação
         await expect(validator.validate(itemPedido)).rejects.toThrowError(ValidationException);
      });
   });
});
