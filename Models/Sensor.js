const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Sensor = sequelize.define('Sensor', {
  deviceID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  sensor: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
  },
  valor: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  dataAtt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'sensores',
  timestamps: false,
});

module.exports = Sensor;
