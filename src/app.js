import express from "express";
import mongoose from 'mongoose';
import handlebars from 'express-handlebars' 
import { Server } from 'socket.io'
import productRouter from "./routes/productRoutes.js";
import cartRouter from "./routes/cartsRoutes.js";
import messagesRouter from "./routes/messagesRoutes.js";
//import { ProductManager } from "./dao/managerFS/ProductManager.js";
import { ProductMongoManager } from "./dao/managerDB/ProductMongoManager.js";
import { MessageMongoManager } from "./dao/managerDB/MessageMongoManager.js";
import viewRoutes from './routes/viewsRoutes.js'
import MongoStore from "connect-mongo";
import session from "express-session";
import sessionRoutes from "./routes/session.routes.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";

const PORT = 8080;
const app = express();
//const pathJson = "./src/json/productos.json"
//const productManager = new ProductManager(pathJson);
const productManager = new ProductMongoManager();
const messageManager = new MessageMongoManager()
//const products = await productManager.getProducts();


app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(express.static('public'))

app.use(session({
  secret: 'C0d3rh0us3',
  store: MongoStore.create({
      mongoUrl: 'mongodb+srv://lucianomorandi:pilar2805@coderhouse.lupycvz.mongodb.net/coder'
  }),
  resave: true,
  saveUninitialized: true
}));

mongoose.connect('mongodb+srv://lucianomorandi:pilar2805@coderhouse.lupycvz.mongodb.net/coder');

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

const hbs = handlebars.create({
  runtimeOptions: {
      allowProtoPropertiesByDefault: true
  }
});

app.engine('handlebars',hbs.engine) 
app.set('views','src/views')
app.set('view engine', 'handlebars')

app.use('/api/session', sessionRoutes);
app.use('/', viewRoutes);
app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)
app.use('/api/messages', messagesRouter)

const httpServer = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

const socketServer = new Server(httpServer) 

const messages=[]

socketServer.on("connection", async (socket)=>{
  console.log("Nuevo cliente conectado");
  
  socket.on('addProd', async prod => {
    try {
     const rdo = await productManager.addProduct(prod)
     if (rdo.message==="OK")
     {
      const resultado = await productManager.getProducts();
      if (resultado.message==="OK")
      {
        socket.emit("getAllProducts",resultado.rdo )  
      }
     }
     return rdo
    } catch (error) {
      console.log("Error al dar de alta un producto: ", error)
    }
	})

  socket.on('delProd', async id => {
    const deleted=await productManager.deleteProduct(id)
    if (deleted.message==="OK")
    {
      const resultado = await productManager.getProducts();
      if (resultado.message==="OK")
      {
        socket.emit("getAllProducts",resultado.rdo )  
      }
    }
    else
      console.log("Error al eliminar un producto: ", deleted.rdo)
  });

  socket.on('message', data=>{
    messages.push(data)
    messageManager.addMessage(data)
    socketServer.emit('messageLogs', messages)
  })

  socket.on('newUser', data =>{
    socket.emit('newConnection', 'Un nuevo usuario se conecto - ' + data)
    socket.broadcast.emit('notification', data)
  })

});

