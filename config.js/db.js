import mongoose from 'mongoose';


const connectDb = async() =>{
    try
    {

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

    }catch(err){
    
        console.log('MongoDB connection failed');
    
    }
}

export default connectDb;