module.exports = function UnautorizedResourceError(message = 'Este recurso não pertence ao usuário') {
  this.name = 'UnautorizedResourceError';
  this.message = message;
};
