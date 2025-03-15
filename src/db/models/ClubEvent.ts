import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface ClubEventAttributes {
  id: number;
  clubId: number;
  eventId: number;
  membersOnly: boolean;
  memberRegistrationFee: number | null;
  nonMemberRegistrationFee: number | null;
  maxParticipants: number | null;
  currentParticipants: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ClubEventCreationAttributes extends Optional<ClubEventAttributes, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants'> {}

class ClubEvent extends Model<ClubEventAttributes, ClubEventCreationAttributes> implements ClubEventAttributes {
  public id!: number;
  public clubId!: number;
  public eventId!: number;
  public membersOnly!: boolean;
  public memberRegistrationFee!: number | null;
  public nonMemberRegistrationFee!: number | null;
  public maxParticipants!: number | null;
  public currentParticipants!: number;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    ClubEvent.belongsTo(models.Club, { as: 'club', foreignKey: 'clubId' });
    ClubEvent.belongsTo(models.Event, { as: 'event', foreignKey: 'eventId' });
  }
}

export const initClubEventModel = (sequelize: Sequelize): typeof ClubEvent => {
  ClubEvent.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clubId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clubs',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      field: 'club_id'
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
    membersOnly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'members_only'
    },
    memberRegistrationFee: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'member_registration_fee'
    },
    nonMemberRegistrationFee: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'non_member_registration_fee'
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'max_participants'
    },
    currentParticipants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'current_participants'
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
    tableName: 'ClubEvents',
    modelName: 'ClubEvent',
  });

  return ClubEvent;
};

export default ClubEvent;
