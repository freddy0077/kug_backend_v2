'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Breed extends Model {
    static associate(models) {
      // A Breed can have many Dogs
      Breed.hasMany(models.Dog, { 
        foreignKey: 'breed_id',
        as: 'dogs'
      });
    }
  }
  
  Breed.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    group: {
      type: DataTypes.STRING,
      allowNull: true
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    temperament: {
      type: DataTypes.STRING,
      allowNull: true
    },
    average_lifespan: {
      type: DataTypes.STRING,
      allowNull: true
    },
    average_height: {
      type: DataTypes.STRING,
      allowNull: true
    },
    average_weight: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Breed',
    tableName: 'Breeds',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Breed;
};
