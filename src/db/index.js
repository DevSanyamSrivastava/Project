import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async()=>{
    try{
       const commectionInstance = await mongoose.connect(`${process.env.MONDODB_URI}/${DB_NAME}`)
       console.log(`\n MongoDB connect !! DB host ${commectionInstance.connection.host}`)
    }catch(error){
        console.log("MONGODB connection Failed", error)
        process.exit(1)
    }
}

export default connectDB