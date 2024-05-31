import * as mongoose from "mongoose";
import * as dotenv from 'dotenv';
import path from 'path';

const srcFolder: string = "src";
dotenv.config({ path: path.resolve(srcFolder, "./.env") });

const uri: string = process.env.DB_URI ?? "mongodb://localhost:27017/";

export async function dbConnect() {
    //creates a default mongoose connection
    console.log(uri);
    await mongoose.connect(uri,
        { serverSelectionTimeoutMS: 5000 }
    );
}
