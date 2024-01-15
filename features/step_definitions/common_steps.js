const { Then } = require('@cucumber/cucumber');
const { expect } = require('pactum');

Then('Deve retornar um erro {int}', function (errorCode) {
  expect(this.response).should.have.status(errorCode);
});

Then('Deve ser adicionado com sucesso', function () {
  expect(this.response).should.have.status(201);
});

Then('Deve ser criado com sucesso', function () {
  expect(this.response).should.have.status(201);
});

Then('Deve ser retornado com sucesso', function () {
  expect(this.response).should.have.status(200);
});

Then('Deve retornar erro de item nao encontrado', function () {
  expect(this.response).should.have.status(404);
});

Then('Deve ser removido com sucesso', function () {
  expect(this.response).should.have.status(200);
});

Then('Deve ser editado com sucesso', function () {
  expect(this.response).should.have.status(200);
});
