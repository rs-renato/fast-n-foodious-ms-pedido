import { Test, TestingModule } from '@nestjs/testing';
import { ItemPedidoProviders } from 'src/application/item-pedido/providers/item-pedido.providers';
import { PedidoProviders } from 'src/application/pedido/providers/pedido.providers';
import { BuscarItensPorPedidoIdUseCase } from 'src/application/pedido/usecase/buscar-itens-por-pedido-id.usecase';
import { EditarPedidoUseCase } from 'src/application/pedido/usecase/editar-pedido.usecase';
import { Cliente } from 'src/enterprise/cliente/model/cliente.model';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { ItemPedido } from 'src/enterprise/item-pedido/model/item-pedido.model';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { ClienteConstants, PedidoConstants, ProdutoConstants } from 'src/shared/constants';
import { CheckoutPedidoUseCase } from './checkout-pedido.usecase';
import { BuscarProdutoPorIdUseCase } from 'src/application/pedido/usecase/buscar-produto-por-id.usecase';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';

describe('CheckoutPedidoUseCase', () => {
   let useCase: CheckoutPedidoUseCase;
   let buscarItensPorPedidoIdUseCase: BuscarItensPorPedidoIdUseCase;
   let buscarProdutoPorIdUseCase: BuscarProdutoPorIdUseCase;
   let editarPedidoUseCase: EditarPedidoUseCase;
   let clienteRepository: IRepository<Cliente>;

   const pedido: Pedido = {
      id: 1,
      clienteId: 101,
      dataInicio: '2023-08-26',
      estadoPedido: EstadoPedido.PAGAMENTO_PENDENTE,
      ativo: true,
   };

   const itemPedidoMock: ItemPedido = {
      pedidoId: 1,
      produtoId: 1,
      quantidade: 2,
      id: 1,
   };

   const expectedCheckoutPedido = {
      pedido,
      pagamento: {
         dataHoraPagamento: undefined,
         estadoPagamento: 0,
         id: 1,
         pedidoId: 1,
         total: 20,
         transacaoId: '863c99369e3d033aa1f080419d0502b226b3718945ba425481c9f565a85be8c8',
      },
   };

   const produtoMock = {
      id: 1,
      nome: 'Produto Teste',
      idCategoriaProduto: 1,
      descricao: 'Descrição do Produto Teste',
      preco: 10.0,
      imagemBase64: 'Imagem em base64',
      ativo: true,
   };

   const cliente: Cliente = {
      id: 1,
      nome: 'Teste',
      email: 'teste@teste.com',
      cpf: '25634428777',
   };

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            ...PedidoProviders,
            ...ItemPedidoProviders,
            ...IntegrationProviders,
            ...PersistenceInMemoryProviders,

            // Mock do serviço IRepository<Cliente>
            {
               provide: ClienteConstants.IREPOSITORY,
               useValue: {
                  findBy: jest.fn(() => Promise.resolve([cliente])),
               },
            },
            // Mock do serviço IRepository<Pedido>
            {
               provide: PedidoConstants.IREPOSITORY,
               useValue: {
                  findBy: jest.fn(() => Promise.resolve([pedido])),
                  edit: jest.fn(() => Promise.resolve(pedido)),
               },
            },
            // Mock do serviço IRepository<Produto>
            {
               provide: ProdutoConstants.IREPOSITORY,
               useValue: {
                  findBy: jest.fn(() => Promise.resolve([produtoMock])),
               },
            },
         ],
      }).compile();

      // Desabilita a saída de log
      module.useLogger(false);

      useCase = module.get<CheckoutPedidoUseCase>(PedidoConstants.CHECKOUT_PEDIDO_USECASE);
      buscarItensPorPedidoIdUseCase = module.get<BuscarItensPorPedidoIdUseCase>(
         PedidoConstants.BUSCAR_ITENS_PEDIDO_POR_PEDIDO_ID_USECASE,
      );
      buscarProdutoPorIdUseCase = module.get<BuscarProdutoPorIdUseCase>(ProdutoConstants.BUSCAR_PRODUTO_POR_ID_USECASE);
      editarPedidoUseCase = module.get<EditarPedidoUseCase>(PedidoConstants.EDITAR_PEDIDO_USECASE);
      clienteRepository = module.get<IRepository<Cliente>>(ClienteConstants.IREPOSITORY);
   });

   describe('checkout', () => {
      it('deve realizar o checkout do pedido com sucesso', async () => {
         jest.spyOn(buscarItensPorPedidoIdUseCase, 'buscarItensPedidoPorPedidoId').mockResolvedValue([itemPedidoMock]);
         jest.spyOn(buscarProdutoPorIdUseCase, 'buscarProdutoPorID').mockResolvedValue(produtoMock);
         jest.spyOn(editarPedidoUseCase, 'editarPedido').mockResolvedValue(pedido);

         const result = await useCase.checkout(pedido);

         expect(result).toEqual(expectedCheckoutPedido);
      });

      it('deve calcular corretamente o total do pedido', async () => {
         jest.spyOn(buscarItensPorPedidoIdUseCase, 'buscarItensPedidoPorPedidoId').mockResolvedValue([itemPedidoMock]);
         jest.spyOn(buscarProdutoPorIdUseCase, 'buscarProdutoPorID').mockResolvedValue(produtoMock);
         jest.spyOn(editarPedidoUseCase, 'editarPedido').mockResolvedValue(pedido);

         const result = await useCase.checkout(pedido);

         expect(result.pedido.total).toEqual(itemPedidoMock.quantidade * produtoMock.preco);
      });

      it('deve lançar uma ValidationException se o cliente do pedido não existir', async () => {
         jest.spyOn(clienteRepository, 'findBy').mockResolvedValue([]);
         jest.spyOn(buscarItensPorPedidoIdUseCase, 'buscarItensPedidoPorPedidoId').mockResolvedValue([itemPedidoMock]);
         jest.spyOn(buscarProdutoPorIdUseCase, 'buscarProdutoPorID').mockResolvedValue(produtoMock);
         jest.spyOn(editarPedidoUseCase, 'editarPedido').mockResolvedValue(pedido);

         const pedidoInvalido = { ...pedido, clienteId: 999 };

         await expect(useCase.checkout(pedidoInvalido)).rejects.toThrowError(ValidationException);
      });
   });
});
