import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface EventRegistrationAttributes {
  id: number;
  eventId: number;
  dogId: number;
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface EventRegistrationCreationAttributes extends Optional<EventRegistrationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class EventRegistration extends Model<EventRegistrationAttributes, EventRegistrationCreationAttributes> implements EventRegistrationAttributes {
  public id!: number;
  public eventId!: number;
  public dogId!: number;
  public registrationDate!: Date;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    EventRegistration.belongsTo(models.Event, { as: 'event', foreignKey: 'eventId' });
    EventRegistration.belongsTo(models.Dog, { as: 'dog', foreignKey: 'dogId' });
  }
}

export const initEventRegistrationModel = (sequelize: Sequelize): typeof EventRegistration => {
  EventRegistration.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Events',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      field: 'event_id'
    },
    dogId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Dogs',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      field: 'dog_id'
    },
    registrationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'registration_date'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    },
  }, {
    sequelize,
    tableName: 'EventRegistrations',
    modelName: 'EventRegistration',
    indexes: [
      {
        unique: true,
        fields: ['eventId', 'dogId'],
      },
    ],
  });

  return EventRegistration;
};

export default EventRegistration;
