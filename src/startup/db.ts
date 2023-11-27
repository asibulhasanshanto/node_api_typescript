import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
    } as mongoose.ConnectOptions); // Use type assertion to specify the type
    console.log('DB connection successful!');
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
};

export default connectDB;
