const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAwLCJuYW1lIjoiVXNlciAjMSIsIm1haWwiOiJ1c2VyMUBtYWlsLmNvbSJ9.AoIPM_Zs0VszZrmnKNWbtN380L9kj_sjfYnCAJPsViE';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar apenas as transferências do usuário', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `Bearer ${token}`)
    .then(res => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('Transfer #1');
    });
});

describe('Ao salvar uma transferência válida...', () => {
  let transferId;
  let income;
  let outcome;
  test('Deve retornar o status 201 e os dados da transferência', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `Bearer ${token}`)
      .send({
        description: 'Regular transfer',
        user_id: 100000,
        acc_origin_id: 100000,
        acc_dest_id: 100001,
        date: new Date(),
        ammount: 250,
      })
      .then(res => {
        expect(res.status).toBe(201);
        expect(res.body.description).toBe('Regular transfer');
        transferId = res.body.id;
      });
  });

  test('As transações equivalentes devem ter sido geradas', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount');
    expect(transactions).toHaveLength(2);
    [outcome, income] = transactions;
  });

  test('A transação de saída deve ser negativa', () => {
    expect(outcome.description).toBe('Transfer to acc #100001');
    expect(outcome.ammount).toBe('-250.00');
    expect(outcome.acc_id).toBe(100000);
    expect(outcome.type).toBe('O');
  });

  test('A transação de entrada deve ser positiva', () => {
    expect(income.description).toBe('Transfer from acc #100000');
    expect(income.ammount).toBe('250.00');
    expect(income.acc_id).toBe(100001);
    expect(income.type).toBe('I');
  });

  test('Ambas devem estar com status de realizadas', () => {
    expect(income.status).toBe(true);
    expect(outcome.status).toBe(true);
  });

  test('Ambas devem referenciar a tranferência que as referenciou', () => {
    expect(income.transfer_id).toBe(transferId);
    expect(outcome.transfer_id).toBe(transferId);
  });
});

describe('Ao tentar salvar uma transferência inválida...', () => {
  const validTransfer = {
    description: 'Regular transfer',
    user_id: 100000,
    acc_origin_id: 100000,
    acc_dest_id: 100001,
    date: new Date(),
    ammount: 250,
  };

  const template = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `Bearer ${token}`)
      .send({ ...validTransfer, ...newData })
      .then(res => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };
  test('Não deve inserir sem descrição', () => template({ description: null }, 'Descrição é um atributo obrigatório'));

  test('Não deve inserir sem valor', () => template({ ammount: null }, 'Valor é um atributo obrigatório'));

  test('Não deve inserir sem data', () => template({ date: null }, 'Data é um atributo obrigatório'));

  test('Não deve inserir sem conta de origem', () => template({ acc_origin_id: null }, 'Conta de origem é um atributo obrigatório'));

  test('Não deve inserir sem conta de destino', () => template({ acc_dest_id: null }, 'Conta de destino é um atributo obrigatório'));

  test('Não deve inserir se as contas de origem e destino forem as mesmas', () => template({ acc_dest_id: validTransfer.acc_origin_id }, 'Não é possivel transferir de uma conta para ela mesma'));

  test('Não deve inserir se as contas pertencerem a outro usuário', () => template({ acc_origin_id: 100002 }, 'A conta #100002 não pertence ao usuário'));
});

test('Deve retornar uma transferência por Id', () => {
  return request(app).get(`${MAIN_ROUTE}/100000`)
    .set('authorization', `Bearer ${token}`)
    .then(res => {
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Transfer #1');
    });
});

describe('Ao alterar uma transferência válida...', () => {
  let transferId;
  let income;
  let outcome;
  test('Deve retornar o status 200 e os dados da transferência', () => {
    return request(app).put(`${MAIN_ROUTE}/100000`)
      .set('authorization', `Bearer ${token}`)
      .send({
        description: 'Updated transfer',
        user_id: 100000,
        acc_origin_id: 100000,
        acc_dest_id: 100001,
        date: new Date(),
        ammount: 715,
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.description).toBe('Updated transfer');
        expect(res.body.ammount).toBe('715.00');
        transferId = res.body.id;
      });
  });

  test('As transações equivalentes devem ter sido geradas', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount');
    expect(transactions).toHaveLength(2);
    [outcome, income] = transactions;
  });

  test('A transação de saída deve ser negativa', () => {
    expect(outcome.description).toBe('Transfer to acc #100001');
    expect(outcome.ammount).toBe('-715.00');
    expect(outcome.acc_id).toBe(100000);
    expect(outcome.type).toBe('O');
  });

  test('A transação de entrada deve ser positiva', () => {
    expect(income.description).toBe('Transfer from acc #100000');
    expect(income.ammount).toBe('715.00');
    expect(income.acc_id).toBe(100001);
    expect(income.type).toBe('I');
  });

  test('Ambas devem referenciar a tranferência que as referenciou', () => {
    expect(income.transfer_id).toBe(transferId);
    expect(outcome.transfer_id).toBe(transferId);
  });
});

describe('Ao tentar alterar uma transferência inválida...', () => {
  const validTransfer = {
    description: 'Regular transfer',
    user_id: 100000,
    acc_origin_id: 100000,
    acc_dest_id: 100001,
    date: new Date(),
    ammount: 250,
  };

  const template = (newData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/100000`)
      .set('authorization', `Bearer ${token}`)
      .send({ ...validTransfer, ...newData })
      .then(res => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };
  test('Não deve inserir sem descrição', () => template({ description: null }, 'Descrição é um atributo obrigatório'));

  test('Não deve inserir sem valor', () => template({ ammount: null }, 'Valor é um atributo obrigatório'));

  test('Não deve inserir sem data', () => template({ date: null }, 'Data é um atributo obrigatório'));

  test('Não deve inserir sem conta de origem', () => template({ acc_origin_id: null }, 'Conta de origem é um atributo obrigatório'));

  test('Não deve inserir sem conta de destino', () => template({ acc_dest_id: null }, 'Conta de destino é um atributo obrigatório'));

  test('Não deve inserir se as contas de origem e destino forem as mesmas', () => template({ acc_dest_id: validTransfer.acc_origin_id }, 'Não é possivel transferir de uma conta para ela mesma'));

  test('Não deve inserir se as contas pertencerem a outro usuário', () => template({ acc_origin_id: 100002 }, 'A conta #100002 não pertence ao usuário'));
});

describe('Ao remover uma transferência', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/100000`)
      .set('authorization', `Bearer ${token}`)
      .then(res => {
        expect(res.status).toBe(204);
      });
  });

  test('O registro deve ser apagado do banco', () => {
    return app.db('transfers').where({ id: 100000 })
      .then(result => {
        expect(result).toHaveLength(0);
      });
  });

  test('As transações associadas devem ter sido removidas', () => {
    return app.db('transactions').where({ transfer_id: 100000 })
      .then(result => {
        expect(result).toHaveLength(0);
      });
  });
});

test('Não deve retornar transferência de outro usuário', () => {
  return request(app).get(`${MAIN_ROUTE}/100001`)
    .set('authorization', `Bearer ${token}`)
    .then(res => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Este recurso não pertence ao usuário');
    });
});
