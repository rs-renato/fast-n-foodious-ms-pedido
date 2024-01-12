import { Test, TestingModule } from '@nestjs/testing';
import { IPagamentoService } from 'src/application/pagamento/service/pagamento.service.interface';
import { EstadoPagamento } from 'src/enterprise/pagamento/estado-pagamento.enum';
import { PagamentoRestApi } from 'src/presentation/rest/pagamento/api/pagamento.api';
import { PagamentoConstants } from 'src/shared/constants';
import { BuscarEstadoPagamentoPedidoRequest } from '../request';
import { BuscarEstadoPagamentoPedidoResponse } from '../response';

describe('PagamentoRestApi', () => {
   let restApi: PagamentoRestApi;
   let service: IPagamentoService;

   const request: BuscarEstadoPagamentoPedidoRequest = {
      pedidoId: 1,
   };

   const response: BuscarEstadoPagamentoPedidoResponse = {
      estadoPagamento: EstadoPagamento.CONFIRMADO,
   };

   beforeEach(async () => {
      // Configuração do módulo de teste
      const module: TestingModule = await Test.createTestingModule({
         controllers: [PagamentoRestApi],
         providers: [
            {
               provide: PagamentoConstants.ISERVICE,
               useValue: {
                  buscarEstadoPagamentoPedido: jest.fn((pedidoId) =>
                     pedidoId === 1 ? Promise.resolve(response) : Promise.reject(new Error('error')),
                  ),
                  webhookPagamentoPedido: jest.fn(() => Promise.resolve(true)),
               },
            },
         ],
      }).compile();

      // Desabilita a saída de log
      module.useLogger(false);

      // Obtém a instância do restApi a partir do módulo de teste
      restApi = module.get<PagamentoRestApi>(PagamentoRestApi);
      service = module.get<IPagamentoService>(PagamentoConstants.ISERVICE);
   });

   describe('injeção de dependências', () => {
      it('deve existir instância de serviço definida', async () => {
         // Verifica se a instância de serviço está definida
         expect(service).toBeDefined();
      });
   });

   describe('confirmar pagamento', () => {
      it('o pagamento deve ser confirmado com sucesso', async () => {
         const result = await restApi.webhook('1abc', 1);

         // Verifica se o resultado obtido é igual ao esperado
         expect(result).toBeTruthy();
      }); // end it 'o pagamento deve ser realizado com sucesso'
   });

   describe('consultar estado do pagamento por ID do pedido', () => {
      it('a consulta deve ser realizada com sucesso', async () => {
         const result = await restApi.buscarPorPedidoId(request);

         expect(service.buscarEstadoPagamentoPedido).toHaveBeenCalledTimes(1);
         expect(result).toEqual(response);
      });
   });
});
