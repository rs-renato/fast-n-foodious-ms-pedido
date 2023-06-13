#!/bin/sh

# Configura para usar o repositorio mockado
NODE_ENV_CURRENT=${NODE_ENV}
export NODE_ENV='local-mock-repository'

# Executa os testes unitarios e e2e
echo "Executando testes unitários.."
npm run test

echo "Executando testes de de integração (modo local moked).."
npm run test:e2e

# Restaura os valores originais
export NODE_ENV=${NODE_ENV_CURRENT}
unset NODE_ENV_CURRENT

status=$?

exit $status