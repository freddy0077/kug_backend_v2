import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

// Define the event types
export enum EventType {
  SHOW = 'SHOW',
  COMPETITION = 'COMPETITION',
  SEMINAR = 'SEMINAR',
  TRAINING = 'TRAINING',
  MEETING = 'MEETING',
  SOCIAL = 'SOCIAL',
  OTHER = 'OTHER'
}

// These attributes define the Event entity in the database
interface EventAttributes {
  id: number;
  title: string;
  description: string;
  eventType: EventType;
  startDate: Date;  // Always a valid Date object
  endDate: Date;
  location: string;
  address: string | null;
  organizer: string;
  organizerId: number | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  registrationUrl: string | null;
  registrationDeadline: Date | null;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// These attributes are for creating a new Event (some can be optional during creation)
interface EventCreationAttributes extends Optional<EventAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public eventType!: EventType;
  public startDate!: Date;
  public endDate!: Date;
  public location!: string;
  public address!: string | null;
  public organizer!: string;
  public organizerId!: number | null;
  public contactEmail!: string | null;
  public contactPhone!: string | null;
  public website!: string | null;
  public registrationUrl!: string | null;
  public registrationDeadline!: Date | null;
  public imageUrl!: string | null;
  public isPublished!: boolean;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    Event.belongsToMany(models.Dog, {
      through: 'EventRegistrations',
      as: 'registeredDogs',
      foreignKey: 'eventId'
    });
    
    Event.hasMany(models.ClubEvent, {
      as: 'clubEvents',
      foreignKey: 'eventId'
    });
  }
}

export const initEventModel = (sequelize: Sequelize): typeof Event => {
  Event.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'title'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'description'
    },
    eventType: {
      type: DataTypes.ENUM(...Object.values(EventType)),
      allowNull: false,
      field: 'event_type'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'location'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'address'
    },
    organizer: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'organizer'
    },
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'organizer_id'
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
      field: 'contact_email'
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'contact_phone'
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'website'
    },
    registrationUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'registration_url'
    },
    registrationDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'registration_deadline'
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'image_url'
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_published'
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
    tableName: 'Events',
    modelName: 'Event',
  });

  return Event;
};

export default Event;
