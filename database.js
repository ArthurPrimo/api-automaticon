const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.MYSQL_DB,     // nome do banco
  process.env.MYSQL_USER,   // usuário
  process.env.MYSQL_PASS,   // senha
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
