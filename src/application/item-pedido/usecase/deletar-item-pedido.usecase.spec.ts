import { Test, TestingModule } from '@nestjs/testing';
import { DeletarItemPedidoUseCase } from './deletar-item-pedido.usecase';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { ItemPedido } from 'src/enterprise/item-pedido/model';
import { IRepository } from 'src/enterprise/repository/repository';
import { ItemPedidoConstants, PedidoConstants } from 'src/shared/constants';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { ItemPedidoProviders } from 'src/application/item-pedido/providers/item-pedido.providers';
import { HttpModule } from '@nestjs/axios';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { Pedido } from 'src/enterprise/pedido/model/pedido.model';
import { EstadoPedido } from 'src/enterprise/pedido/enum/estado-pedido.enum';

describe('DeletarItemPedidoUseCase', () => {
  let useCase: DeletarItemPedidoUseCase;
  let repository: IRepository<ItemPedido>;
  let pedidoRepository: IRepository<Pedido>;

  const pedido: Pedido = {
    id: 1,
    clienteId: 1,
    dataInicio: '2023-06-18',
    estadoPedido: EstadoPedido.PAGAMENTO_PENDENTE,
    ativo: true,
    total: 10,
  };

  const itemPedidoMock: ItemPedido = {
    pedidoId: 1,
    produtoId: 2,
    quantidade: 3,
    id: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [...ItemPedidoProviders, ...IntegrationProviders, ...PersistenceInMemoryProviders],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    useCase = module.get<DeletarItemPedidoUseCase>(ItemPedidoConstants.DELETAR_ITEM_PEDIDO_USECASE);
    repository = module.get<IRepository<ItemPedido>>(ItemPedidoConstants.IREPOSITORY);
    pedidoRepository = module.get<IRepository<Pedido>>(PedidoConstants.IREPOSITORY);

    jest.spyOn(repository, 'findBy').mockResolvedValue([itemPedidoMock]);
    jest.spyOn(pedidoRepository, 'findBy').mockResolvedValue([pedido]);
  });

  describe('deletarItemPedido', () => {
    it('deve deletar um item de pedido com sucesso', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(true);

      const result = await useCase.deletarItemPedido(itemPedidoMock.id);

      expect(result).toBeTruthy();
    });

    it('deve lançar uma ServiceException em caso de erro no repositório', async () => {
      const error = new Error('Erro no repositório');
      jest.spyOn(repository, 'delete').mockRejectedValue(error);

      await expect(useCase.deletarItemPedido(itemPedidoMock.id)).rejects.toThrowError(ServiceException);
    });
  });
});
