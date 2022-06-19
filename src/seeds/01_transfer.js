exports.seed = knex => {
  // Deletes ALL existing entries
  return knex('transactions').del()
    .then(() => knex('transfers').del())
    .then(() => knex('accounts').del())
    .then(() => knex('users').del())
    .then(() => knex('users').insert([
      {
        id: 100000, name: 'User #1', mail: 'user1@mail.com', passwd: '$2a$10$pTqPhBSpQZRcq6pB3LxYbu8cSJP/hYFv6Upoxrncd565993vEcYDe',
      },
      {
        id: 100001, name: 'User #2', mail: 'user2@mail.com', passwd: '$2a$10$pTqPhBSpQZRcq6pB3LxYbu8cSJP/hYFv6Upoxrncd565993vEcYDe',
      },
    ]))
    .then(() => knex('accounts').insert([
      { id: 100000, name: 'AccO #1', user_id: 100000 },
      { id: 100001, name: 'AccD #1', user_id: 100000 },
      { id: 100002, name: 'AccO #2', user_id: 100001 },
      { id: 100003, name: 'AccD #2', user_id: 100001 },
    ]))
    .then(() => knex('transfers').insert([
      {
        id: 100000,
        description: 'Transfer #1',
        user_id: 100000,
        acc_origin_id: 100000,
        acc_dest_id: 100001,
        ammount: 100,
        date: new Date(),
      },
      {
        id: 100001,
        description: 'Transfer #2',
        user_id: 100001,
        acc_origin_id: 100002,
        acc_dest_id: 100003,
        ammount: 100,
        date: new Date(),
      },
    ]))
    .then(() => knex('transactions').insert([
      {
        description: 'Transfer from AccO #1', date: new Date(), ammount: 100, type: 'I', acc_id: 100001, transfer_id: 100000,
      },
      {
        description: 'Transfer to AccD #1', date: new Date(), ammount: -100, type: 'O', acc_id: 100000, transfer_id: 100000,
      },
      {
        description: 'Transfer from AccO #2', date: new Date(), ammount: 150, type: 'I', acc_id: 100003, transfer_id: 100001,
      },
      {
        description: 'Transfer to AccD #2', date: new Date(), ammount: -150, type: 'O', acc_id: 100002, transfer_id: 100001,
      },
    ]));
};
