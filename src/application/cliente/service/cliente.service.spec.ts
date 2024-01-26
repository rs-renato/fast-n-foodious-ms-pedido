import { Test, TestingModule } from '@nestjs/testing';
import { IClienteService } from 'src/application/cliente/service/cliente.service.interface';
import { Cliente } from 'src/enterprise/cliente/model/cliente.model';
import { CpfUnicoClienteValidator } from 'src/application/cliente/validation/cpf-unico-cliente.validator';
import { CpfValidoClienteValidator } from 'src/application/cliente/validation/cpf-valido-cliente.validator';
import { EmailUnicoClienteValidator } from 'src/application/cliente/validation/email-unico-cliente.validator';
import { EmailValidoClienteValidator } from 'src/application/cliente/validation/email-valido-cliente.validator';
import { SalvarClienteValidator } from 'src/application/cliente/validation/salvar-cliente.validator';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { IRepository } from 'src/enterprise/repository/repository';
import { RepositoryException } from 'src/infrastructure/exception/repository.exception';
import { ClienteConstants } from 'src/shared/constants';
import { ClienteProviders } from 'src/application/cliente/providers/cliente.providers';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';

describe('CienteService', () => {
  let service: IClienteService;
  let repository: IRepository<Cliente>;
  let validators: SalvarClienteValidator[];

  const cliente: Cliente = {
    id: 1,
    nome: 'Teste',
    email: 'teste@teste.com',
    cpf: '25634428777',
  };

  beforeEach(async () => {
    // Configuração do módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ClienteProviders,
        ...PersistenceInMemoryProviders,

        // Mock do serviço IRepository<Cliente>
        {
          provide: ClienteConstants.IREPOSITORY,
          useValue: {
            // mock para a chamada repository.save(cliente)
            save: jest.fn(() => Promise.resolve(cliente)),
            // mock para a chamada repository.findBy(attributes)
            findBy: jest.fn(() => {
              // retorna vazio, simulando que não encontrou registros pelo atributos passados por parâmetro
              return Promise.resolve({});
            }),
          },
        },
      ],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    // Obtém a instância do repositório, validators e serviço a partir do módulo de teste
    repository = module.get<IRepository<Cliente>>(ClienteConstants.IREPOSITORY);
    validators = module.get<SalvarClienteValidator[]>(ClienteConstants.SALVAR_CLIENTE_VALIDATOR);
    service = module.get<IClienteService>(ClienteConstants.ISERVICE);
  });

  describe('injeção de dependências', () => {
    it('deve existir instâncias de repositório e validators definidas', async () => {
      expect(repository).toBeDefined();
      expect(validators).toBeDefined();
    });
  });

  describe('save', () => {
    it('deve salvar cliente', async () => {
      const cliente: Cliente = {
        nome: 'Teste',
        email: 'teste@teste.com',
        cpf: '25634428777',
      };

      await service.save(cliente).then((clienteSalvo) => {
        // verifica se o cliente salvo contém os mesmos dados passados como input
        expect(clienteSalvo.id).toEqual(1);
        expect(clienteSalvo.nome).toEqual(cliente.nome);
        expect(clienteSalvo.email).toEqual(cliente.email);
        expect(clienteSalvo.cpf).toEqual(cliente.cpf);
      });
    });

    it('não deve salvar cliente quando existir um cliente com email existente', async () => {
      const cliente: Cliente = {
        nome: 'Teste',
        email: 'teste@teste.com',
        cpf: '25634428777',
      };

      // mock de repositório retornando um cliente, caso exista o email
      repository.findBy = jest.fn().mockImplementation((attributes) => {
        return Promise.resolve(attributes['email'] === cliente.email ? [cliente] : {});
      });

      // verifica se foi lançada uma exception com a mensagem de validação de email único
      await expect(service.save(cliente)).rejects.toThrowError(
        EmailUnicoClienteValidator.EMAIL_UNICO_CLIENTE_VALIDATOR_ERROR_MESSAGE,
      );
    });

    it('não deve salvar cliente quando existir um cliente com cpf existente', async () => {
      const cliente: Cliente = {
        nome: 'Teste',
        email: 'teste@teste.com',
        cpf: '25634428777',
      };

      // mock de repositório retornando um cliente, caso exista o cpf
      repository.findBy = jest.fn().mockImplementation((attributes) => {
        return Promise.resolve(attributes['cpf'] === cliente.cpf ? [cliente] : {});
      });

      // verifica se foi lançada uma exception com a mensagem de validação de cpf único
      await expect(service.save(cliente)).rejects.toThrowError(
        CpfUnicoClienteValidator.CPF_UNICO_CLIENTE_VALIDATOR_ERROR_MESSAGE,
      );
    });

    it('não deve salvar cliente com cpf inválido', async () => {
      const cliente: Cliente = {
        nome: 'Teste',
        email: 'teste@teste.com',
        cpf: '12345678901',
      };

      repository.findBy = jest.fn().mockImplementation((attributes) => {
        return Promise.resolve(attributes['cpf'] === cliente.cpf ? [cliente] : {});
      });

      await expect(service.save(cliente)).rejects.toThrowError(
        CpfValidoClienteValidator.CPF_VALIDO_CLIENTE_VALIDATOR_ERROR_MESSAGE,
      );
    });

    it('não deve salvar cliente com email inválido', async () => {
      const cliente: Cliente = {
        nome: 'Teste',
        email: 'emailinvalido',
        cpf: '25634428777',
      };

      repository.findBy = jest.fn().mockImplementation((attributes) => {
        return Promise.resolve(attributes['email'] === cliente.email ? [cliente] : {});
      });

      await expect(service.save(cliente)).rejects.toThrowError(
        EmailValidoClienteValidator.EMAIL_VALIDO_CLIENTE_VALIDATOR_ERROR_MESSAGE,
      );
    });

    it('não deve salvar cliente quando houver um erro de banco ', async () => {
      const error = new RepositoryException('Erro genérico de banco de dados');
      jest.spyOn(repository, 'save').mockRejectedValue(error);

      // verifica se foi lançada uma exception na camada de serviço
      await expect(service.save(cliente)).rejects.toThrowError(ServiceException);
    });
  });

  describe('buscaPorCpf', () => {
    it('deve buscar cliente por cpf', async () => {
      const cliente: Cliente = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        cpf: '25634428777',
      };

      repository.findBy = jest.fn().mockImplementation(() => {
        return Promise.resolve([cliente]);
      });

      await service.findByCpf(cliente.cpf).then((clienteSalvo) => {
        expect(clienteSalvo).toEqual(cliente);
      });
    });

    it('não deve buscar cliente com cpf inexistente', async () => {
      // mock de repositório retornando um cliente, caso exista o email
      repository.findBy = jest.fn().mockImplementation(() => {
        return Promise.resolve([]);
      });

      await expect(service.findByCpf('00000000191')).rejects.toThrowError(NaoEncontradoApplicationException);
    });

    it('não deve buscar cliente com cpf inválido', async () => {
      // mock de repositório retornando um cliente, caso exista o email
      repository.findBy = jest.fn().mockImplementation(() => {
        return Promise.resolve([]);
      });

      await service.findByCpf('12345678901').catch((error) => {
        expect(error.message).toEqual(CpfValidoClienteValidator.CPF_VALIDO_CLIENTE_VALIDATOR_ERROR_MESSAGE);
      });
    });

    it('não deve consultar cliente por cpf quando houver um erro de banco ', async () => {
      const error = new RepositoryException('Erro genérico de banco de dados');
      jest.spyOn(repository, 'findBy').mockRejectedValue(error);

      // verifiaca se foi lançada uma exception na camada de serviço
      await expect(service.findByCpf(cliente.cpf)).rejects.toThrowError(ServiceException);
    });
  });

  describe('identifyByCpf', () => {
    it('deve identificar cliente por cpf', async () => {
      // mock de repositório retornando um cliente, caso exista o email
      repository.findBy = jest.fn().mockImplementation(() => {
        return Promise.resolve([cliente]);
      });

      await service.identifyByCpf(cliente.cpf).then((clienteIdentificado) => {
        expect(clienteIdentificado).toEqual(cliente);
      });
    });

    it('deve identificar cliente anomimo por cpf inexistente', async () => {
      repository.findBy = jest.fn().mockImplementation(() => {
        return Promise.resolve([]);
      });

      await service.identifyByCpf('00000000191').then((clienteIdentificado) => {
        expect(clienteIdentificado.anonimo).toEqual(true);
      });
    });

    it('deve identificar cliente anomimo por cpf undefined', async () => {
      await service.identifyByCpf(undefined).then((clienteIdentificado) => {
        expect(clienteIdentificado.anonimo).toEqual(true);
      });
    });
  });
});
