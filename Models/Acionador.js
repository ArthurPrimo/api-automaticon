const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Acionador = sequelize.define('Acionador', {
  deviceID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  dataAtt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'acionadores',
  timestamps: false,
});

module.exports = Acionador;
