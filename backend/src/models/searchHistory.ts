import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

// Define the SearchHistory model
interface SearchHistoryAttributes {
  id: number;
  searchQuery: string;
  timestamp: Date;
  resultCount: number;
}

class SearchHistory extends Model<SearchHistoryAttributes> implements SearchHistoryAttributes {
  public id!: number;
  public searchQuery!: string;
  public timestamp!: Date;
  public resultCount!: number;
}

// Initialize the model
SearchHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    searchQuery: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    resultCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'SearchHistory',
    tableName: 'search_history',
    timestamps: true,
  }
);

// Function to add a new search history entry
export const addSearchHistory = async (searchQuery: string, resultCount: number) => {
  try {
    const entry = await SearchHistory.create({
      searchQuery,
      resultCount,
      timestamp: new Date(),
    });
    return entry;
  } catch (error) {
    console.error('Error adding search history:', error);
    throw error;
  }
};

// Function to get search history with pagination
export const getSearchHistory = async (page: number = 1, limit: number = 10) => {
  try {
    const offset = (page - 1) * limit;
    const history = await SearchHistory.findAndCountAll({
      order: [['timestamp', 'DESC']],
      limit,
      offset,
    });
    return {
      entries: history.rows,
      total: history.count,
      currentPage: page,
      totalPages: Math.ceil(history.count / limit),
    };
  } catch (error) {
    console.error('Error fetching search history:', error);
    throw error;
  }
};

// Function to clear search history
export const clearSearchHistory = async () => {
  try {
    await SearchHistory.destroy({
      where: {},
      truncate: true,
    });
    return true;
  } catch (error) {
    console.error('Error clearing search history:', error);
    throw error;
  }
};

export default SearchHistory;