// import express from "express"
//import { ProductManager } from "../dao/managerFS/ProductManager.js";
import { Router } from "express"
import { ProductMongoManager } from "../dao/managerDB/ProductMongoManager.js"
import { checkAuth, checkingExistingUser } from "../middlewares/auth.js"

// const viewRoutes = express.Router()
//const path="./src/json/productos.json"
//const productManager = new ProductManager(path);

const viewRoutes = Router();

const productManager=new ProductMongoManager()

viewRoutes.get("/", checkAuth, async (req, res) => {
  const {user} = req.session;
  const resultado = await productManager.getProducts()

  if (resultado.message==="OK")
    res.render("home", user);
});

viewRoutes.get("/realtimeproducts", async (req, res) => {
  const resultado = await productManager.getProducts();
  if (resultado.message==="OK")
    res.render("realtimeproducts", { title: "RealTime Products", data: resultado.rdo })
});

viewRoutes.get('/products', async (req, res) => {
  const {page} = req.query;
  const products = await productManager.getProducts(10, page);
  console.log({products});
  res.render('products', products);
});

viewRoutes.get('/chat', async (req, res)=>{
  res.render('chat')
});

viewRoutes.get('/login', checkingExistingUser, (req, res) => {
  res.render('login');
});

viewRoutes.get('/register', checkingExistingUser, (req, res) => {
  res.render('register');
});

viewRoutes.get('/restore-password', checkingExistingUser, (req, res) => {
  res.render('restore-password');
});

viewRoutes.get('/faillogin', (req, res) => {
  res.render('faillogin')
});

viewRoutes.get('/failregister', (req, res) => {
  res.render('failregister')
});

export default viewRoutes
