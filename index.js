const express = require('express')
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { type } = require('os');
const app = express()
mongoose
.connect(
 "mongodb+srv://aseemjoshi75:NZ3jCgZk8DOdKB2Z@cluster0.pxsvjf6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)
.then(() => console.log("Mongodb Connected"))
.catch((err) => console.log("mongo error", err));

app.use(cors());
app.use(express.static(path.join(__dirname, 'Assets')));
app.use(bodyParser.json());


const ContactSchema = new mongoose.Schema({
name: {
type: String,
require: true,
},
email: {
type: String,
require: true,
},
number: {
type: Number,
require: true,
},
message: {
type: String,
require: true,
},
});

const Contact = mongoose.model("contact", ContactSchema);

const NewAccountSchema = new mongoose.Schema({
  name: {
  type: String,
  require: true,
  },
  email: {
  type: String,
  require: true,
  },

  number: {
  type: Number,
  require: true,
  },
  password: {
  type: String,
  require: true,
  },

cart:[
{
categoryid:{
  type:Number
},
productid:{
  type:Number
},
img:{
  type:String
},
price:{
type:String
},
name:{
  type:String
},
quantity:{
  type:Number,
  default:1
}
}
],

wish:[
{
categoryid:{
  type:Number
},
productid:{
  type:Number
},
img:{
  type:String
},
price:{
type:String
},
name:{
  type:String
}
}
],
shippingInfo: {
name: String,
mobile: String,
email: String,
address: String,
state: String,
pincode: String,
landmark: String,
city: String,
   
},

order: [

{

orderDate:{ 
type: String

},

categoryid: {
type: Number,
required:true,
},
productid:
{
type: Number,
required:true,

},
productimg:
{
type: String,



},
productname:
{
type: String,

},
productprice:
{
type:String,

},

quantity:
{
type: Number,
default: 1
}

},
],

});

const NewAccount = mongoose.model("new-account", NewAccountSchema);

const UserSchema = new mongoose.Schema({

email: {
type: String,
require: true,
},

password: {
type: String,
require: true,
},
});
// user schema end
const User = mongoose.model("user", UserSchema);

const  NewsletterSchema = new mongoose.Schema({
  email: {
  type: String,
  require: true,
  },
}); 
const Newsletter = mongoose.model("newsletter", NewsletterSchema);

app.get('/api', (req, res) => {
const filePath = path.join(__dirname, 'data.json');
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
   console.error(err);
   return res.json({ success: false, error: 'Internal Server Error' });
  }
 const jsonData = JSON.parse(data);
  
  const updatedJson = jsonData.map(item => {
 if (item.category_img) {
item.category_img = 'https://backendjs.vercel.app/' + item.category_img;
 }

if (item.pro_icon) {
  item.pro_icon = 'https://backendjs.vercel.app/' + item.pro_icon;
 }
  
 item.pro = item.pro.map(product => {
 if (product.pro_main_img) {
 product.pro_main_img = 'https://backendjs.vercel.app/' + product.pro_main_img;
 }
  
 if (product.images) {
 product.images = product.images.map(a => {
 if (a.original) {
 a.original = 'https://backendjs.vercel.app/' + a.original;
 }
 if (a.thumbnail) {
 a.thumbnail = 'https://backendjs.vercel.app/' + a.thumbnail;
 }
 return a;

   });
 }
  
 return product;
 });
  
 return item;
});
  
res.json({ success: true, data: updatedJson });


});
});

app.post('/contact',async(req,res)=> {
const{name,number,email,message}=req.body

const exist = await Contact.findOne({email,message})
if(exist){
 return res.json({success:false,error:'already exist'})
}

// add data
const result = await Contact.create({
name,
email,
number,
message
          
});
            
console.log(result);

const transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
user: 'aseemjoshi75@gmail.com',
pass: 'drxw xtdq nsjs ormc',
},
});


const mailOptions = {
from: 'aseemjoshi75@gmail.com',
to: email,
subject: 'Welcome to Solemates...',
html: `
<p>Hello ${name},</p>
<p>Thank you for contacting with Solemates. We will reply to you soon.</p>
<p>Best regards,</p>
<p>Solemates Team</p>
`,
};

const info =  await transporter.sendMail(mailOptions);
console.log('Email sent:', info.response);
res.json({success:true,message:"Thanks for contacting"})


})


app.get('/contact-info',async(req,res)=> {

const contactdata = await Contact.find()

res.json({data:contactdata})
  
  })

app.post('/new-account',async(req,res)=> {
const{name,number,email,password}=req.body

// Check if the user with the given email already exists
const existingUser = await NewAccount.findOne({ email });
     
    
if (existingUser) {
  // If user exists, return an error response
  return res.json({ success: false, error: 'Email already registered, please do login' });
}
      
const hashedPassword = await bcrypt.hash(password, 10);

const result = await NewAccount.create({
name,
email,
number,
password:hashedPassword,

});
    
console.log(result)

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
user: 'aseemjoshi75@gmail.com',
pass: 'drxw xtdq nsjs ormc',
},
});

// Define email options
const mailOptions = {
from:'aseemjoshi75@gmail.com',
to: email,
subject: 'Welcome to Solemates...',
html: `
<p>Hello ${name}</p>
<p>Thank you for registering with Solemates. We are excited to have you on board!</p>
<p>Best regards,</p>
<p>Solemates Team</p>
// <img src="https://i.ibb.co/qnVVcMk/digital-camera-photo-1080x675.jpg">
`,
};

const info =  await transporter.sendMail(mailOptions);
console.log('Email sent:', info.response);
res.json({ success: true, message: 'Thanks for register' });


})
app.get('/new-account-info',async(req,res)=> {

const contactdata = await NewAccount.find()
  
res.json({data:contactdata})
    
})


app.get('/orders',async(req,res)=> {

const contactdata = await NewAccount.find()

res.json({data:contactdata})
  
})

app.post('/update-account-data', async (req, res) => {
const { name,email,number,password } = req.body;


  
try {   
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({success: false,  alert: 'Token not provided' });
}
    
jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
  return res.status(401).json({success: false, alert: 'Invalid token' });
}
    
const user = await NewAccount.findOne({ email: decoded.email });
if (!user) {
  return res.status(404).json({success: false, alert: 'User not found' });
}

const hashedPassword = await bcrypt.hash(password, 10);
user.name = name;
user.email = email;
user.number = number;
    
user.password=hashedPassword
await user.save();
    
res.json({ success: true, message: 'Thanks Your Information has Been Updated' });  
        
});
} catch (error) {
  console.error('Error fetching user address:', error);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
}
       
    
     
});
app.post('/user', async (req,res)=> {
const{email,password}=req.body

console.log(email+password)

// Check if the user with the given email already exists
const existingUser1 = await NewAccount.findOne({ email });
   
if (!existingUser1) {
// If user exists, return an error response
return res.json({ success: false, error: 'invalid user.' });
}
 const passwordMatch = await bcrypt.compare(password, existingUser1.password);
          
if (!passwordMatch) {
return res.json({ success: false, error: 'Invalid  password' });

}
const token = jwt.sign({ email }, 'secret-key', { expiresIn: '24h' });
      
console.log(token)

//   console.log(result)
 
res.json({ success: true, message: 'Thanks.Login Successful',data:token,cartInfo:existingUser1.cart,wishInfo:existingUser1.wish,orderInfo:existingUser1.order });


})

app.post('/reset',async(req,res)=>{
  const{name,email} = req.body
  
  const forgotpassword = await register.create({
  name,
  email,
  });
  
  const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aseemjoshi75@gmail.com',
    pass: 'drxw xtdq nsjs ormc',
  },
  });
  
  const mailOptions = {
  from: 'aseemjoshi75@gmail.com',
  to: email,
  subject: 'To Change Password',
  html: `
  <p>Hello ${name}</p>
  <p>To Change Password</p>
  <p><a href="http://localhost:3034/changepassword">http://localhost:3034/changepassword</a></p>
  <p>Thank You,</p>
  `,
  };
  const mail = await transporter.sendMail(mailOptions);
  await forgotpassword.save();
  res.json({ success: true, message: ' Link send to Your Mail id'});
});


app.get('/api/user', async (req, res) => {
try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) { return res.status(401).json({ message: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
return res.status(401).json({ message: 'Invalid token' });
}

const user = await NewAccount.findOne({ email: decoded.email });
if (!user) {
return res.status(404).json({ message: 'User not found' });
}

const accountInfo = {
name: user.name,
email: user.email,
number: user.number,
password: user.password,
};

res.json({ accountInfo:accountInfo });
});
} catch (error) {
console.error('Error fetching cart items:', error);
res.status(500).json({ message: 'Internal Server Error' });
}
});
app.post('/add-to-cart', async (req, res) => {
const{categoryid,productid,img,price,name} = req.body

try {
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
return res.status(401).json({ error: 'Token not provided' });
}

jwt.verify(token, 'secret-key', async (err, decoded) => {
if (err) {
return res.status(401).json({ error: 'Invalid token' });
}

const user = await NewAccount.findOne({ email: decoded.email });
if (!user) {
  return res.status(404).json({ error: 'User not found' });
}

      
// Check if the product already exists in the cart with the same categoryid, productid, and size
const existingProduct = user.cart.find(
  item => item.categoryid === categoryid && item.productid === productid 
);

if (existingProduct) {
  return res.json({ success:false,error: 'Product already in cart ' });
}

     
user.cart.push({
  categoryid,productid,img,price,name
  
});

await user.save();

console.log(user)

res.json({ success: true, message: 'Thanks Product added to cart', cartInfo:user.cart});
});
} catch (error) {
console.error('Error adding to cart:', error);
res.status(500).json({ success: false, error: 'Internal Server Error' });
}
});

app.post('/increase-quantity', async (req, res) => {
  const { categoryid, productid } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Find the user by email from the decoded token
      const user = await NewAccount.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const productInCart = user.cart.find(item => item.categoryid === categoryid && item.productid === productid );
      if (productInCart) {
        
        if (productInCart.quantity < 10) {
          productInCart.quantity = productInCart.quantity + 1;
        } else {
          return res.json({success:false, error: 'Maximum quantity 10' });
        }
      } else {
        return res.json({success:false, error: 'Product not found in cart' });
      }

      
      await user.save();


      res.json({ success: true, message: ' Thanks Quantity increased', cartInfo: user.cart });
    });
  } catch (error) {
    console.error('Error increasing quantity:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/decrease-quantity', async (req, res) => {
  const { categoryid, productid } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Find the user by email from the decoded token
      const user = await NewAccount.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const productInCart = user.cart.find(item => item.categoryid === categoryid && item.productid === productid );
      if (productInCart) {
        
        if (productInCart.quantity >1) {
          productInCart.quantity = productInCart.quantity - 1;
        }  else {
          return res.json({success:false, error: 'Maximum quantity 1' });
        }
      } else {
        return res.json({success:false, error: 'Product not found in cart' });
      }

      
      await user.save();


      res.json({ success: true, message: ' Thanks Quantity decreased', cartInfo: user.cart });
    });
  } catch (error) {
    console.error('Error decreasing quantity:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
app.post('/remove-from-cart', async (req, res) => {
  const { categoryid,productid } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }


      const user = await NewAccount.findOneAndUpdate(
        { email: decoded.email },
        { $pull: { cart: { categoryid,productid} } },
        { new: true }
      );

   
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

    

      res.json({ success: true, message: 'Thanks Product removed from cart', cartInfo: user.cart });
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/add-to-wish', async (req, res) => {
  const{categoryid,productid,img,price,name} = req.body


  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = await NewAccount.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      
      // Check if the product already exists in the cart with the same categoryid, productid, and size
      const existingProduct = user.wish.find(
        item => item.categoryid === categoryid && item.productid === productid 
      );

      if (existingProduct) {
        return res.json({ success:false,error: 'Product already in wish ' });
      }

     
      user.wish.push({
        categoryid,productid,img,price,name
        
      });

      await user.save();

      console.log(user)

      res.json({ success: true, message: 'Thanks Product added to wish', wishInfo:user.wish});
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/remove-from-wish', async (req, res) => {
  const { categoryid,productid } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }


      const user = await NewAccount.findOneAndUpdate(
        { email: decoded.email },
        { $pull: { wish: { categoryid,productid} } },
        { new: true }
      );

   
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

    

      res.json({ success: true, message: 'Thanks Product removed from wishlist', wishInfo: user.wish });
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/save-shipping-info', async (req, res) => {
  const { name, mobile, email, address, state, pincode, landmark, city } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await NewAccount.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Prepare the shipping information
      const shippingInfo = {
        name,
        mobile,
        email,
        address,
        state,
        pincode,
        landmark,
        city
      };

      // Update user's shipping information
      user.shippingInfo = shippingInfo;
      await user.save();

      console.log(user);

      res.json({
        success: true,
        message: 'Thanks Shipping information saved successfully',
        shippingInfo: user.shippingInfo
      });
    });
  } catch (error) {
    console.error('Error saving shipping information:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/get-user-address', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await NewAccount.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // You can directly send the shipping information in the response
      const shippingInfo = user.shippingInfo || {};

      res.json({ success: true, data:shippingInfo });
      console.log(shippingInfo)
    });
  } catch (error) {
    console.error('Error fetching user address:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/save-order-info', async (req, res) => {

  const { orderDate } = req.body;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = await NewAccount.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }



      // Add each cart item to the order with the current date
      user.cart.forEach(item => {
        user.order.push({
          orderDate,
          categoryid: item.categoryid,
          productid: item.productid,
          productimg:item.img,
          productname:item.name,
          productprice:item.price,
          size:item.size,
          quantity: item.quantity,

        });
      });

      // Clear user cart after adding to order
      user.cart = [];

      await user.save();

      res.json({
        success: true,
        message: 'Thanks! Your Order has Been Confirmed',
        orderInfo: user.order,
        cartInfo: user.cart
      });
    });
  } catch (error) {
    console.error('Error adding to order:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/get-order-info', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await NewAccount.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

    
      res.json({ orderInfo: user.order });
    });
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/order-info',async(req,res)=> {

const orderdata = await NewAccount.find()
  
res.json({data:orderdata})
    
})

app.post('/newsletter',async(req,res)=> {
  const{email}=req.body

  console.log(email)

  const exist = await Newsletter.findOne({email})
  if(exist){
   return res.json({success:false,error:'Email Already exists...!'})
  }
  const result = await Newsletter.create({
  email,
  });
  
  const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aseemjoshi75@gmail.com',
    pass: 'drxw xtdq nsjs ormc',
  },
  });
  
  
  const mailOptions = {
  from: 'aseemjoshi75@gmail.com',
  to: email,
  subject: 'Welcome to Solemates',
  html: `
  <p>Hello ${email},</p>
  <p>Thank you for Subscribing to Solemates. We will get back to you soon.</p>
  <p>Best regards,</p>
  <p>Solemates Team</p>
  `,
  };
  
  const info =  await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.response);
  res.json({success:true,message:"Thanks for Subscribing to Solemates!"})
 
});

app.get('/', (req, res) => {
  res.send('Hello Backend Is Live Now!')
  })

app.listen(3034, () => {
console.log("Yay! You are connected with us")
})