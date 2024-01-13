import { Test, TestingModule } from '@nestjs/testing';
import { PedidoProviders } from 'src/application/pedido/providers/pedido.providers';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { IPedidoRepository } from 'src/enterprise/pedido/repository/pedido.repository.interface';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { PedidoConstants } from 'src/shared/constants';
import { DeletarPedidoUseCase } from './deletar-pedido.usecase';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { HttpModule } from '@nestjs/axios';

describe('DeletarPedidoUseCase', () => {
   let useCase: DeletarPedidoUseCase;
   let repository: IPedidoRepository;

   const pedidoId = 123;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         imports: [HttpModule],
         providers: [...PedidoProviders, ...IntegrationProviders, ...PersistenceInMemoryProviders],
      }).compile();

      // Desabilita a saída de log
      module.useLogger(false);

      useCase = module.get<DeletarPedidoUseCase>(PedidoConstants.DELETAR_PEDIDO_USECASE);
      repository = module.get<IPedidoRepository>(PedidoConstants.IREPOSITORY);
   });

   describe('deletarPedido', () => {
      it('deve deletar um pedido com sucesso', async () => {
         jest.spyOn(repository, 'delete').mockResolvedValue(true);

         const result = await useCase.deletarPedido(pedidoId);

         expect(result).toBe(true);
      });

      it('deve lançar uma ServiceException em caso de erro ao deletar', async () => {
         const error = new Error('Erro ao deletar');
         jest.spyOn(repository, 'delete').mockRejectedValue(error);

         await expect(useCase.deletarPedido(pedidoId)).rejects.toThrowError(ServiceException);
      });
   });
});
