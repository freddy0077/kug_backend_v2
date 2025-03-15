import { Sequelize, Op } from 'sequelize';
import { Breed } from '../../db/models/Breed';
import Dog from '../../db/models/Dog';

interface BreedPaginationArgs {
  offset?: number;
  limit?: number;
  searchTerm?: string;
  sortDirection?: 'ASC' | 'DESC';
}

const breedResolvers = {
  Query: {
    // Get all breeds with pagination and filtering
    breeds: async (_: any, { 
      offset = 0, 
      limit = 20, 
      searchTerm = '', 
      sortDirection = 'ASC' 
    }: BreedPaginationArgs) => {
      try {
        const where = searchTerm ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${searchTerm}%` } },
            { group: { [Op.iLike]: `%${searchTerm}%` } },
            { origin: { [Op.iLike]: `%${searchTerm}%` } },
            { temperament: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        } : {};

        const { count, rows } = await Breed.findAndCountAll({
          where,
          order: [['name', sortDirection]],
          offset,
          limit
        });

        return {
          totalCount: count,
          hasMore: offset + rows.length < count,
          items: rows
        };
      } catch (error) {
        console.error('Error fetching breeds:', error);
        throw new Error('Failed to fetch breeds');
      }
    },

    // Get a single breed by ID
    breed: async (_: any, { id }: { id: string }) => {
      try {
        const breed = await Breed.findByPk(id);
        if (!breed) {
          throw new Error(`Breed with ID ${id} not found`);
        }
        return breed;
      } catch (error) {
        console.error(`Error fetching breed with ID ${id}:`, error);
        throw new Error('Failed to fetch breed');
      }
    },

    // Get a single breed by name
    breedByName: async (_: any, { name }: { name: string }) => {
      try {
        const breed = await Breed.findOne({
          where: { 
            name: { [Op.iLike]: name }
          }
        });
        
        if (!breed) {
          throw new Error(`Breed with name ${name} not found`);
        }
        
        return breed;
      } catch (error) {
        console.error(`Error fetching breed with name ${name}:`, error);
        throw new Error('Failed to fetch breed by name');
      }
    }
  },

  Mutation: {
    // Create a new breed
    createBreed: async (_: any, { input }: { input: any }) => {
      try {
        // Check if breed with same name already exists
        const existingBreed = await Breed.findOne({
          where: { name: { [Op.iLike]: input.name } }
        });

        if (existingBreed) {
          throw new Error(`Breed with name "${input.name}" already exists`);
        }

        // Create the new breed
        const newBreed = await Breed.create(input);
        return newBreed;
      } catch (error) {
        console.error('Error creating breed:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create breed');
      }
    },

    // Update an existing breed
    updateBreed: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        const breed = await Breed.findByPk(id);
        
        if (!breed) {
          throw new Error(`Breed with ID ${id} not found`);
        }

        // If name is being updated, check if it conflicts with existing breed
        if (input.name && input.name !== breed.name) {
          const existingBreed = await Breed.findOne({
            where: { 
              name: { [Op.iLike]: input.name },
              id: { [Op.ne]: id }
            }
          });

          if (existingBreed) {
            throw new Error(`Another breed with name "${input.name}" already exists`);
          }
        }

        // Update the breed
        await breed.update(input);
        
        // Refresh data
        return await Breed.findByPk(id);
      } catch (error) {
        console.error(`Error updating breed with ID ${id}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Failed to update breed');
      }
    },

    // Delete a breed
    deleteBreed: async (_: any, { id }: { id: string }) => {
      try {
        const breed = await Breed.findByPk(id);
        
        if (!breed) {
          throw new Error(`Breed with ID ${id} not found`);
        }

        // Check if any dogs are using this breed
        const dogsWithBreed = await Dog.count({
          where: { breed_id: id }
        });

        if (dogsWithBreed > 0) {
          throw new Error(`Cannot delete breed: ${dogsWithBreed} dogs are associated with this breed`);
        }

        // Delete the breed
        await breed.destroy();
        
        return {
          success: true,
          message: `Breed "${breed.name}" deleted successfully`
        };
      } catch (error) {
        console.error(`Error deleting breed with ID ${id}:`, error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to delete breed'
        };
      }
    }
  },

  // Resolve fields for Breed type
  Breed: {
    // Get all dogs of this breed
    dogs: async (parent: any) => {
      try {
        return await Dog.findAll({
          where: { breed_id: parent.id }
        });
      } catch (error) {
        console.error(`Error fetching dogs for breed ${parent.id}:`, error);
        return [];
      }
    }
  }
};

export default breedResolvers;
