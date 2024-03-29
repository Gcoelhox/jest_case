const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const get = (filter = {}) => {
    return app.db('accounts').where(filter).first();
  };
  const save = async (account) => {
    if (!account.name) throw new ValidationError('Nome é um atributo obrigatório');

    const accDb = await get({ name: account.name, user_id: account.user_id });
    if (accDb) throw new ValidationError('Já existe uma conta com esse nome');

    return app.db('accounts').insert(account, '*');
  };

  const findAll = (user_id) => {
    return app.db('accounts').where({ user_id });
  };

  const update = (id, account) => {
    return app.db('accounts')
      .where({ id })
      .update(account, '*');
  };

  const remove = async (id) => {
    const transaction = await app.services.transaction.findOne({ acc_id: id });
    if (transaction) throw new ValidationError('Essa conta possui transações associadas');

    return app.db('accounts')
      .where({ id })
      .del();
  };

  return {
    save, findAll, get, update, remove,
  };
};
