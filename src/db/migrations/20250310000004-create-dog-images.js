'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DogImages', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        defaultValue: Sequelize.UUIDV4,
        defaultValue: Sequelize.UUIDV4
      },
      dog_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        defaultValue: Sequelize.UUIDV4,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        references: {
          model: 'Dogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      caption: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_profile_image: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      image_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'REGULAR'
      },
      upload_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('DogImages', ['dog_id'], {
      name: 'dog_images_dog_id_idx'
    });
    await queryInterface.addIndex('DogImages', ['is_profile_image'], {
      name: 'dog_images_is_profile_image_idx'
    });
    await queryInterface.addIndex('DogImages', ['dog_id', 'is_profile_image'], {
      name: 'dog_images_dog_profile_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DogImages');
  }
};
