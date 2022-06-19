const request = require('supertest');
const moment = require('moment');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/balance';
const TRANSACTION_ROUTE = '/v1/transactions';
const TRANSFER_ROUTE = '/v1/transfers';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMTAwLCJuYW1lIjoiVXNlciAjMyIsIm1haWwiOiJ1c2VyM0BtYWlsLmNvbSJ9.6Bku2m6gnp713zenrXK2cNRoFzO3Gl8eec08clZvNUo';
const token_geral = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMTAyLCJuYW1lIjoiVXNlciAjNSIsIm1haWwiOiJ1c2VyNUBtYWlsLmNvbSJ9.I3MZ3t4gdaQFjaMc4gA2wZB2FD63R1hTFffSVmU4sVs';

beforeAll(async () => {
  await app.db.seed.run();
});

describe('Ao calcular o saldo do usuário...', () => {
  test('Deve retornar apenas as contas com alguma transação', () => {
    return request(app).get(MAIN_ROUTE)
      .set('authorization', `Bearer ${token}`)
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
      });
  });
  test('Deve adicionar valores de entrada', () => {
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `Bearer ${token}`)
      .send({
        description: '1',
        date: new Date(),
        ammount: 100,
        type: 'I',
        acc_id: 100100,
        status: true,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `Bearer ${token}`)
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(100100);
            expect(res.body[0].sum).toBe('100.00');
          });
      });
  });
  test('Deve subtrair valores de saída', () => {
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `Bearer ${token}`)
      .send({
        description: '1',
        date: new Date(),
        ammount: 200,
        type: 'O',
        acc_id: 100100,
        status: true,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `Bearer ${token}`)
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(100100);
            expect(res.body[0].sum).toBe('-100.00');
          });
      });
  });
  test('Não deve considerar transações pendentes', () => {
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `Bearer ${token}`)
      .send({
        description: '1',
        date: new Date(),
        ammount: 200,
        type: 'O',
        acc_id: 100100,
        status: false,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `Bearer ${token}`)
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(100100);
            expect(res.body[0].sum).toBe('-100.00');
          });
      });
  });
  test('Não deve considerar saldos de contas distintas', () => {
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `Bearer ${token}`)
      .send({
        description: '1',
        date: new Date(),
        ammount: 50,
        type: 'I',
        acc_id: 100101,
        status: true,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `Bearer ${token}`)
          .then(res => {
            console.log(res.body);
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(100100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(100101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });
  test('Não deve considerar contas de outros usuários', () => {
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `Bearer ${token}`)
      .send({
        description: '1',
        date: new Date(),
        ammount: 200,
        type: 'O',
        acc_id: 100102,
        status: true,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `Bearer ${token}`)
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(100100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(100101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });
  test('Deve considerar uma transação passada', () => {
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `Bearer ${token}`)
      .send({
        description: '1',
        date: moment().subtract({ days: 5 }),
        ammount: 250,
        type: 'I',
        acc_id: 100100,
        status: true,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `Bearer ${token}`)
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(100100);
            expect(res.body[0].sum).toBe('150.00');
            expect(res.body[1].id).toBe(100101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });
  test('Não deve considerar uma transação futura', () => {
    return request(app).post(TRANSACTION_ROUTE)
      .set('authorization', `Bearer ${token}`)
      .send({
        description: '1',
        date: moment().add({ days: 5 }),
        ammount: 10,
        type: 'I',
        acc_id: 100100,
        status: false,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `Bearer ${token}`)
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(100100);
            expect(res.body[0].sum).toBe('150.00');
            expect(res.body[1].id).toBe(100101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });
  test('Deve considerar transferências', () => {
    return request(app).post(TRANSFER_ROUTE)
      .set('authorization', `Bearer ${token}`)
      .send({
        description: '1',
        date: new Date(),
        ammount: 250,
        acc_origin_id: 100100,
        acc_dest_id: 100101,
      })
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `Bearer ${token}`)
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(100100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(100101);
            expect(res.body[1].sum).toBe('300.00');
          });
      });
  });
});

test('Deve calcular saldo das contas do usuário', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `Bearer ${token_geral}`)
    .then(res => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe(100104);
      expect(res.body[0].sum).toBe('162.00');
      expect(res.body[1].id).toBe(100105);
      expect(res.body[1].sum).toBe('-248.00');
    });
});
