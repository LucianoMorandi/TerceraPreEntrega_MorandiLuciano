import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productsCollection = "products";

const productsSchema = new mongoose.Schema({
    "title": String,
    "description": String,
    "price": Number,
    "code": { 
      type: String, 
      unique: true 
    },
    "stock": Number,
    "status": Boolean,
    "category": {
        type: String,
        enum: ["dog", "cat", "puppi", "kitten"],
        default: "dog"
    },
    "thunbnail": String
})

productsSchema.plugin(mongoosePaginate);

export const ProductsModel = mongoose.model(productsCollection, productsSchema);