import { Test, TestingModule } from '@nestjs/testing';
import { BuscarProdutoPorIdUseCase } from './buscar-produto-por-id.usecase';
import { ProdutoIntegration } from 'src/integration/produto/produto.integration';
import { ProdutoDto } from 'src/enterprise/produto/produto-dto';

describe('BuscarProdutoPorIdUseCase', () => {
  let useCase: BuscarProdutoPorIdUseCase;
  let produtoIntegration: ProdutoIntegration;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarProdutoPorIdUseCase,
        {
          provide: ProdutoIntegration,
          useValue: {
            getProdutoById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<BuscarProdutoPorIdUseCase>(BuscarProdutoPorIdUseCase);
    produtoIntegration = module.get<ProdutoIntegration>(ProdutoIntegration);
  });

  describe('buscarProdutoPorID', () => {
    it('should successfully fetch product by ID', async () => {
      // Arrange
      const idProduto = 123;
      const expectedProdutoDto: ProdutoDto = ProdutoDto.fromJson({
        nome: 'Produto Teste',
        idCategoriaProduto: 1,
        descricao: 'Descrição do Produto Teste',
        preco: 10.99,
        imagemBase64: 'Imagem Base64',
        ativo: true,
        id: 123,
      });

      jest.spyOn(produtoIntegration, 'getProdutoById').mockResolvedValueOnce(expectedProdutoDto);

      // Act
      const result = await useCase.buscarProdutoPorID(idProduto);

      // Assert
      expect(result).toEqual(expectedProdutoDto);

      // Verificando se o método foi chamado corretamente
      expect(produtoIntegration.getProdutoById).toHaveBeenCalledWith(idProduto);
    });
  });
});
