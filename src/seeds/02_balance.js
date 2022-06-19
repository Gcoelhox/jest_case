const moment = require('moment');

exports.seed = knex => {
  return knex('users').insert([
    {
      id: 100100, name: 'User #3', mail: 'user3@mail.com', passwd: '$2a$10$pTqPhBSpQZRcq6pB3LxYbu8cSJP/hYFv6Upoxrncd565993vEcYDe',
    },
    {
      id: 100101, name: 'User #4', mail: 'user4@mail.com', passwd: '$2a$10$pTqPhBSpQZRcq6pB3LxYbu8cSJP/hYFv6Upoxrncd565993vEcYDe',
    },
    {
      id: 100102, name: 'User #5', mail: 'user5@mail.com', passwd: '$2a$10$pTqPhBSpQZRcq6pB3LxYbu8cSJP/hYFv6Upoxrncd565993vEcYDe',
    },
  ])
    .then(() => knex('accounts').insert([
      { id: 100100, name: 'Acc saldo principal', user_id: 100100 },
      { id: 100101, name: 'Acc saldo secundário', user_id: 100100 },
      { id: 100102, name: 'Acc alternativa #1', user_id: 100101 },
      { id: 100103, name: 'Acc alternativa #2', user_id: 100101 },
      { id: 100104, name: 'Acc geral principal', user_id: 100102 },
      { id: 100105, name: 'Acc geral secundária', user_id: 100102 },
    ]))
    .then(() => knex('transfers').insert([
      {
        id: 100100,
        description: 'Transfer #1',
        user_id: 100102,
        acc_origin_id: 100105,
        acc_dest_id: 100104,
        ammount: 256,
        date: new Date(),
      },
      {
        id: 100101,
        description: 'Transfer #2',
        user_id: 100101,
        acc_origin_id: 100102,
        acc_dest_id: 100103,
        ammount: 512,
        date: new Date(),
      },
    ]))
    .then(() => knex('transactions').insert([
      {
        description: '2', date: new Date(), ammount: 2, type: 'I', acc_id: 100104, status: true,
      },
      {
        description: '2', date: new Date(), ammount: 4, type: 'I', acc_id: 100102, status: true,
      },
      {
        description: '2', date: new Date(), ammount: 8, type: 'I', acc_id: 100105, status: true,
      },
      {
        description: '2', date: new Date(), ammount: 16, type: 'I', acc_id: 100104, status: false,
      },
      {
        description: '2', date: moment().subtract({ days: 5 }), ammount: 32, type: 'I', acc_id: 100104, status: true,
      },
      {
        description: '2', date: moment().add({ days: 5 }), ammount: 64, type: 'I', acc_id: 100104, status: true,
      },
      {
        description: '2', date: new Date(), ammount: -128, type: 'O', acc_id: 100104, status: true,
      },
      {
        description: '2', date: new Date(), ammount: 256, type: 'I', acc_id: 100104, status: true,
      },
      {
        description: '2', date: new Date(), ammount: -256, type: 'O', acc_id: 100105, status: true,
      },
      {
        description: '2', date: new Date(), ammount: 512, type: 'I', acc_id: 100103, status: true,
      },
      {
        description: '2', date: new Date(), ammount: -512, type: 'O', acc_id: 100102, status: true,
      },
    ]));
};
