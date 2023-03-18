const express = require("express");
const app = express();
const fs = require("fs");
const session = require("express-session");
const { dirname } = require("path");
const sendEmail = require("./methods/sendEmail");
const sendPass = require("./methods/sendPass");
const isAuth = require("./middleware/isAuth");
const multer = require("multer");
const mongoose = require("mongoose");

const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(
  session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    resave: false,
  })
);

app.set("view engine", "ejs");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(null, file.filename + "-" + Date.now() + ".jpg");
    },
  }),
}).single("image");

app.post("/upload", upload, async(req, res) => {
  let { pname, pdescription, pprice, pquantity } = req.body;
  // console.log(req.file.path);
let data = await productmodel.find({});
let length = data.length;
let id = data[length-1].id+1;
// let id = data[data.length -1 ].id +1;
  let prod = new productmodel();


prod.id=id;
// prod.id=Math.random(1*10000000)+1;

prod.name = pname;
prod.image=req.file.path;
prod.price=pprice;
prod.details=pdescription;
prod.quantity=pquantity;
console.log(prod);
await prod.save();
//   res.send("file upload");
// res.render("Admin1",{product:data});
// res.send("Added Succesfully");
// alert("Added succesfully");
res.redirect('/Admin');
});

app.get("/edit",async(req,res)=>{
    let data = await productmodel.find({});
    res.render("Admin1",{product:data,name:req.session.username});
})

app.post("/editupdate/:id",async(req,res)=>{
    let { p1name, p1description, p1price, p1quantity } = req.body;
    let pid=parseInt(req.params.id);
     let newproduct  = await productmodel.updateOne({id:pid},{$set:{
        name:p1name,
        details:p1description,
        price:p1price,
        quantity:p1quantity,
     }})
    console.log(p1description)
    console.log("value",pid);
    // res.send("this is..");
res.redirect('/edit');


})




//mongo start
const connect = async () => {
  try {
    const connection = await mongoose.connect(
      "mongodb://127.0.0.1:27017/Ecommerce"
    );
    // 127.0.0.1:27017
    console.log(connection.connection.host + "connection to ho gya vro");
  } catch (err) {
    console.log(err.message);
  }
};
// mongoose.connect;
connect();
const user_schema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  mobile: Number,
  mailToken: Number,
  isVerified: Boolean,
  isAdmin: Boolean,
});
const User = mongoose.model("User", user_schema);


// karoCreate()

const product_schema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,
  price: Number,
  details: String,
  quantity: Number,
});
const productmodel = mongoose.model("products", product_schema);

const cart_schema = new mongoose.Schema({
  username: {
    type: String,
  },
  items: {
    type: Array,
  },
});
const cartmodel = mongoose.model("cart", cart_schema);
// mongo
app.get("/", function (req, res) {
  res.render("home");
});
app.get("/home", isAuth,async function (req, res) {
  let product = await productmodel.find({});
  res.render("house", {
    name: req.session.username,
    product: product,
    count: req.session.count,
    user: req.session.user,
  });
});
app.get('/verify',(req,res)=>{
  res.send("Verify your Email to continue! We have judt sent you an email check it out now !")
})
app.get("/verifymail/:token", async function(req,res){
  const {token} = req.params;
  let user  = await  User.findOne({mailToken:token})
  if(user){
    let update = await User.updateOne({mailToken:token},{$set:{isVerified:true}})
    req.session.is_loggedin = true;
    req.session.current_user =  user.username;
    req.session.username =  user.username;
    req.session.user = user;
    req.session.count = 0;
    console.log(req.session.is_loggedin)
    res.redirect('/login')
    return
  }
  else {
    res.send("your token is wrong")
  }
//   fs.readFile("./db.txt","utf-8",function(err,data){
//       if(data.length>0){
//           data=JSON.parse(data);
          
//       }

//       for(let i=0; i<data.length; i++){
//           let user=data[i];
        
//           if(user.mailToken ==token){
//               user.isVerified=true;
      
//       if(req.session.user){  
//       req.session.user.mailToken=true;
//       fs.writeFile("./db.txt",JSON.stringify(data),(err)=>{
//       res.redirect("/login")
//           return;
//       })
//       }
//       else{
//       req.session.is_loggedin = true; //verify
//       req.session.user = user;     //verify
//       fs.writeFile("./db.txt",JSON.stringify(data),(err)=>{
//           res.redirect("/login")
//           return;
//       })
     
//   }

//   }
// }



// })

})


app.get("/login", function (req, res) {
  res.render("login", { error: "" });
});
app.post("/login", async function (req, res) {
  let { username, password } = req.body;
  const foundUser = await User.findOne({ username, password });
  if (foundUser) {
    req.session.is_loggedin = true;
    req.session.username = username;
    req.session.user = foundUser;
    
    //req.session.user.isVerified
    //req.session.count += 5;

    let product = await productmodel.find({});
    console.log(product);
    console.log(foundUser);
    res.redirect("/home")
    // res.render("house", {
    //   name: req.session.username,
    //   product: product,
    //   count: req.session.count,
    //   user: foundUser,
    //   error:""
    // });
    return
  } else {
    res.render("login",{error: "Incorrect Crediantials"});
    // res.send("Incorrect Crediantials");
    return
  }
});

app.get("/createaccount", function (req, res) {
  res.render("createaccount", { error: "" });
});

app.post("/createaccount", async function (req, res) {
  let { name, username, email, password, mobile } = req.body;

  const foundUser = await User.findOne({ username });
  if (foundUser) {
    res.render("createaccount", {
      error: "Username already taken, please change it",
    });
    return;
  } else {
    karoCreateaccount(name, username, email, password, mobile);
    // res.render("login" ,{error:null});
  }
  async function karoCreateaccount(name, username, email, password, mobile) {
    let user = new User();
    user.name = name;
    user.username = username;
    user.email = email;
    user.password = password;
    user.mobile = mobile;
    user.mailToken = Date.now();
    user.isVerified = false;
    user.isAdmin = false;
    await user.save();
    sendEmail(email, user.mailToken ,function(err, data){
      if(err){
          res.render("createaccount", {error: err})
          return
      }
  
  
  })
    {
      // let user = await User.findOne({username:req.body.username})
      console.log(user);
      console.log("working perfectly fine  ");
    }
  }
  res.redirect("/verify");
});
app.get("/Admin", function (req, res) {
  res.render("Admin");
});

app.get("/addtocart/:id", isAuth, async function (req, res) {
  let { id } = req.params;

  console.log(id);
  let usercart = await cartmodel.findOne({ username: req.session.username });
  if (usercart != null) {
    let flag = true;
    let cartitems = usercart.items;
    cartitems.forEach((cartitem) => {
      if (cartitem.id == id) {
        cartitem.quantity++;
        flag = false;
      }
    });
    if (flag) {
      let item = {};
      item.id = id;
      item.quantity = 1;
      cartitems.push(item);
    }
    let usercart1 = await cartmodel.updateOne(
      { username: req.session.username },
      { $set: { items: cartitems } }
    );
    console.log("cart item is here ", cartitems);
  } else {
    let cart = new cartmodel();
    cart.username = req.session.username;
    let item = {};
    item.id = id;
    item.quantity = 1;
    cart.items.push(item);
    await cart.save();
    console.log("cart  item ", cart);
  }
  res.json({ m: "added to cart sucessfully" });

  // fs.readFile("./cart.txt",(err,data)=>{
  //     let cart=JSON.parse(data)
  //     if(cart[req.session.username]){
  //     if(cart[req.session.username][id]){
  //       cart[req.session.username][id].quantity++;
  //     }
  //     else {
  //         cart[req.session.current_user][id]={}
  //         cart[req.session.current_user][id]={
  //             quantity:1
  //         }
  //     }

  //     }
  //     else {

  //         cart[req.session.current_user]={}
  //         cart[req.session.current_user][id]={}
  //         cart[req.session.current_user][id]={
  //             quantity:1
  //         }
  //     }

  //     fs.writeFile("./cart.txt",JSON.stringify(cart),(err)=>{
  //         res.json({m:"sucess"})
  //     })
  // })
  // res.send("added sucessfully")
});
app.get("/cart/increment/:id", async function (req, res) {
  let { id } = req.params;
  let usercart = await cartmodel.findOne({ username: req.session.username });
  let data = 1;

  let cartitems = usercart.items;
  cartitems.forEach((cartitem) => {
    if (cartitem.id == id) {
      cartitem.quantity++;
      data = cartitem.quantity;
    }
  });
  let usercart1 = await cartmodel.updateOne(
    { username: req.session.username },
    { $set: { items: cartitems } }
  );

  res.json(data);
});
app.get("/cart/decrement/:id", async function (req, res) {
  let { id } = req.params;
  let usercart = await cartmodel.findOne({ username: req.session.username });

  let data = 1;
  let cartitems = usercart.items;
  cartitems.forEach((cartitem) => {
    if (cartitem.id == id) {
      cartitem.quantity--;
      data = cartitem.quantity;
    }
  });
  let usercart1 = await cartmodel.updateOne(
    { username: req.session.username },
    { $set: { items: cartitems } }
  );

  res.json(data);
});

app.get("/delete/:id", async function (req, res) {
  let { id } = req.params;

  // let deletecart = await cartmodel.deleteOne({id});
  let usercart = await cartmodel.findOne({ username: req.session.username });
  let cartitems = usercart.items;
  if (cartitems.length < 1) {
    let usercart1 = await cartmodel.updateOne(
      { username: req.session.username },
      { $set: { items: [] } }
    );

    res.redirect("/home");
    return;
  }
  cartitems = cartitems.filter((cartitem) => {
    return cartitem.id != id;
  });
  let usercart1 = await cartmodel.updateOne(
    { username: req.session.username },
    { $set: { items: cartitems } }
  );
  res.redirect("/cart");
  return;
});

app.get("/cart", isAuth, async function (req, res) {
  // fs.readFile("./product.txt","utf-8",(err,data)=>{
  //     let products= JSON.parse(data);
  //     fs.readFile("./cart.txt","utf-8",(err,data)=>{
  //         let cart=JSON.parse(data);
  //         console.log(products,cart)
  let usercart = await cartmodel.findOne({ username: req.session.username });
  let products = await productmodel.find({});
  console.log("usrer cart ", usercart);
  res.render("mycart", {
    username: req.session.username,
    cart: usercart.items,
    products: products,
  });
  //     })

  // })
});


app.get("/house", isAuth, function (req, res) {
  res.render("house");
});
app.get("/changepassword", isAuth, function (req, res) {
  res.render("changepassword");
});

app.post("/changepassword/change", isAuth, async function (req, res) {
  let password1 = req.body.new_password;
  let password2 = req.body.confirm_password;
  if (password1 != password2 || password1.length < 1) {
    res.send("please enter password same in both field");
    return;
  }

  const foundUser1 = await User.findOne({ username: req.session.username });
  console.log("found user", foundUser1);
  if (foundUser1.username == req.session.username) {
    let data = await User.updateOne(
      { username: req.session.username },
      { $set: { password: password1 } }
    );
    // res.send("changed succesfully");
    res.render("login",{error:null});
    return;
  } else {
    res.send("something went wrong");
  }
  //  console.log(req.body)

  //    fs.readFile("./db.txt","utf-8",(err,data)=>{
  //        let users=JSON.parse(data);
  //        users.forEach((user)=>{
  //            if(user.username=req.session.current_user){
  //              user.password=password1

  //            }

  //        })
  //        fs.writeFile("./db.txt",JSON.stringify(users),(err)=>{
  //            res.redirect('/login')
  //            return
  //         })

  //    })
  // res.send("sucess change")
  // res.render("changepassword");
});

app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/login");
});

app.get("/forgetpassword", function (req, res) {
  res.render("forgetpass");
});

app.post("/forgetpassword",async function(req,res){
  let {email}=req.body;
  let flag=true;
  let user  = await User.findOne({email:email})
  console.log("user", user)
  if(user){

    sendPass(email, user.mailToken, (err, data) => {
      flag = false;
      res.send("we have sent a reset link to your email");
      return;
    });
  }
  else {
    res.send("we can't find your email");
    return;
  }
  

})


// app.post("/forgetpassword", function (req, res) {
//   //  console.log(req.body)
//   let { email } = req.body;
//   let flag = true;
//   fs.readFile("./db.txt", "utf-8", (err, data) => {
//     let users = JSON.parse(data);
//     users.forEach((user) => {
//       if (user.email == email) {
//         sendPass(email, user.mailToken, (err, data) => {
//           flag = false;
//           res.send("we have sent a reset link to your email");
//           return;
//         });
//       }
//     });
//   });
//   function temp() {
//     res.send("incorrecct email");
//     return;
//   }
//   setTimeout(temp, 3000);
// });
app.get("/resetpass/:token",async (req,res)=>{
   console.log(req.params)
   console.log(" reset pass me pahucha hai ")
  let token = Number( req.params.token)

  let user  = await  User.findOne({mailToken:token})
  if(user){
    req.session.is_loggedin = true;
    req.session.current_user =  user.username;
    req.session.username =  user.username;
    req.session.user = user;
    req.session.count = 0;
    console.log(req.session.is_loggedin)
    res.redirect('/changepassword')
    return
  }
  else {
    res.send("it seems that  you haven't sign up yet")
  }
  })
app.get("/sendData", (req, res) => {
  const { id } = req.query;
  console.log(id);
  var x = Number(id);
  productmodel
    .find()
    .limit(5)
    .skip(5 * x)
    .then((data) => {
      res.send(data);
    });
});
app.get("/admindelete/:id",async function(req,res){
    let {id }= req.params
 let del = await productmodel.deleteOne({id:id})

res.redirect("/edit")
})





app.get("*", function (req, res) {
  res.send("404");
});

app.listen(port, () => {
  console.log("Listening to port at http://localhost:${port}");
});
// product =prudut.skip(page * limt-1).limit(limit)
