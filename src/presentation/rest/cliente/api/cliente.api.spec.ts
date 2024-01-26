import { Test, TestingModule } from '@nestjs/testing';
import { IClienteService } from 'src/application/cliente/service/cliente.service.interface';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';
import { ClienteIdentificado } from 'src/enterprise/cliente/model/cliente-identificado.model';
import { ClienteRestApi } from 'src/presentation/rest/cliente/api/cliente.api';
import { SalvarClienteRequest } from 'src/presentation/rest/cliente/request/salvar-cliente.request';
import { SalvarClienteResponse } from 'src/presentation/rest/cliente/response/salvar-cliente.response';
import { ClienteConstants } from 'src/shared/constants';

describe('ClienteRestApi', () => {
  let restApi: ClienteRestApi;
  let service: IClienteService;

  // Define um objeto de requisição
  const request: SalvarClienteRequest = {
    nome: 'Teste',
    email: 'teste@teste.com',
    cpf: '25634428777',
  };

  // Define um objeto de cliente esperado como resultado
  const response: SalvarClienteResponse = {
    id: 1,
    nome: 'Teste',
    email: 'teste@teste.com',
    cpf: '25634428777',
  };

  beforeEach(async () => {
    // Configuração do módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClienteRestApi],
      providers: [
        // Mock do serviço IService<Cliente>
        {
          provide: ClienteConstants.ISERVICE,
          useValue: {
            // Mocka chamada para o save, rejeitando a promise em caso de request undefined
            save: jest.fn((request) => (request ? Promise.resolve(response) : Promise.reject(new Error('error')))),
            findByCpf: jest.fn((cpf) =>
              cpf === response.cpf
                ? Promise.resolve(response)
                : Promise.reject(new NaoEncontradoApplicationException()),
            ),
            identifyByCpf: jest.fn((cpf) =>
              cpf === response.cpf ? Promise.resolve(response) : Promise.resolve(new ClienteIdentificado(undefined)),
            ),
          },
        },
      ],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    // Obtém a instância do restApi e do serviço a partir do módulo de teste
    restApi = module.get<ClienteRestApi>(ClienteRestApi);
    service = module.get<IClienteService>(ClienteConstants.ISERVICE);
  });

  describe('injeção de dependências', () => {
    it('deve existir instância de serviço definida', async () => {
      // Verifica se a instância de serviço está definida
      expect(service).toBeDefined();
    });
  });

  describe('salvar', () => {
    it('deve salvar um novo cliente', async () => {
      // Chama o método salvar do restApi
      const result = await restApi.salvar(request);

      // Verifica se o método save do serviço foi chamado corretamente com a requisição
      expect(service.save).toHaveBeenCalledWith(request);

      // Verifica se o resultado obtido é igual ao objeto cliente esperado
      expect(result).toEqual(response);
    });

    it('não deve tratar erro a nível de controlador', async () => {
      const error = new Error('Erro genérico não tratado');
      jest.spyOn(service, 'save').mockRejectedValue(error);

      // Chama o método salvar do restApi
      await expect(restApi.salvar(request)).rejects.toThrow('Erro genérico não tratado');

      // Verifica se método save foi chamado com o parametro esperado
      expect(service.save).toHaveBeenCalledWith(request);
    });
  });

  describe('buscaPorCpf', () => {
    it('deve buscar cliente por cpf', async () => {
      // Chama o método buscaPorCpf do restApi
      const result = await restApi.buscaPorCpf({ cpf: request.cpf });

      // Verifica se o método findByCpf do serviço foi chamado corretamente com a requisição
      expect(service.findByCpf).toHaveBeenCalledWith(request.cpf);

      // Verifica se o resultado obtido é igual ao objeto cliente esperado
      expect(result).toEqual(response);
    });

    it('não deve buscar cliente por cpf inexistente', async () => {
      // Chama o método buscaPorCpf do restApi
      await expect(restApi.buscaPorCpf({ cpf: '123456' })).rejects.toThrow(NaoEncontradoApplicationException);

      // Verifica se o método findByCpf do serviço foi chamado corretamente com a requisição
      expect(service.findByCpf).toHaveBeenCalledWith('123456');
    });
  });

  describe('identificaCliente', () => {
    it('deve identificar cliente por cpf', async () => {
      // Chama o método identificaCliente do restApi
      const result = await restApi.identificaCliente({ cpf: request.cpf });

      // Verifica se o método findByCpf do serviço foi chamado corretamente com a requisição
      expect(service.identifyByCpf).toHaveBeenCalledWith(request.cpf);

      // Verifica se o resultado obtido é igual ao objeto cliente esperado
      expect(result).toEqual(response);
    });

    it('deve identificar cliente anonimo', async () => {
      // Chama o método identificaCliente do restApi
      const result: ClienteIdentificado = await restApi.identificaCliente({ cpf: '00000000191' });

      // Verifica se o método findByCpf do serviço foi chamado corretamente com a requisição
      expect(service.identifyByCpf).toHaveBeenCalledWith('00000000191');

      // Verifica se o resultado obtido é igual ao objeto cliente esperado
      expect(result.anonimo).toEqual(true);
    });
  });
});
