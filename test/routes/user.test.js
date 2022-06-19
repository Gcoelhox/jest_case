const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

let user;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@mail.com`, passwd: 123456 });
  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo');
});

const mail = `${Date.now()}@mail.com`;

test('Deve listar todos os usuários', () => {
  return request(app).get('/v1/users')
    .set('authorization', `Bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      // expect(res.body[0]).toHaveProperty('name', 'John Doe');
    });
});

test('Deve inserir usuário com sucesso', () => {
  return request(app).post('/v1/users')
    .send({ name: 'Walter Mitty', mail, passwd: 12356 })
    .set('authorization', `Bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Walter Mitty');
      expect(res.body).not.toHaveProperty('passwd');
    });
});

test('Deve armazenar senha criptografada', async () => {
  const res = await request(app).post('/v1/users')
    .send({ name: 'Walter Mitty', mail: `${Date.now()}@mail.com`, passwd: '123456' })
    .set('authorization', `Bearer ${user.token}`);
  expect(res.status).toBe(201);

  const { id } = res.body;
  const userDb = await app.services.user.findOne({ id });
  expect(userDb.passwd).not.toBeUndefined();
  expect(userDb.passwd).not.toBe('123456');
});

// Tratamento promise com return
test('Não deve inserir usuário sem nome', () => {
  return request(app).post('/v1/users')
    .send({ mail, passwd: 123456 })
    .set('authorization', `Bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Nome é um atributo obrigatório');
    });
});

// Tratando promise com async/await
test('Não deve inserir usuário sem email', async () => {
  const result = await request(app).post('/v1/users')
    .send({ name: 'Walter Mitty', passwd: 12356 })
    .set('authorization', `Bearer ${user.token}`);
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Email é um atributo obrigatório');
});

// Tratando promise com done
test('Não deve inserir um usuário sem senha', (done) => {
  request(app).post('/v1/users')
    .send({ name: 'Walter Mitty', mail })
    .set('authorization', `Bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Senha é um atributo obrigatório');
      done();
    })
    .catch((err) => done.fail(err));
});

test('Não deve inserir usuário com email existent', () => {
  return request(app).post('/v1/users')
    .send({ name: 'Walter Mitty', mail, passwd: 12356 })
    .set('authorization', `Bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Já existe um usuário com esse email');
    });
});
