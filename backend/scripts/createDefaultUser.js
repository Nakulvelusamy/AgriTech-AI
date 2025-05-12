const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createDefaultUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Check if user already exists
    const existingUser = await User.findOne({ username: 'NAKUL' });
    
    if (existingUser) {
      console.log('Default user already exists');
      await mongoose.connection.close();
      return;
    }
    
    // Create default user
    const user = new User({
      username: 'NAKUL',
      password: 'NAKUL'
    });
    
    await user.save();
    console.log('Default user created successfully');
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error creating default user:', error.message);
    process.exit(1);
  }
};

createDefaultUser();