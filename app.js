const express = require('express');
const app = express();
const userModel = require('./models/user');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render("index");
});


app.post('/register', (req, res) => {
    let { name, email, password, age } = req.body;
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, async function(err, hash) {
            try {
                let user = await userModel.create({
                    name,
                    email,
                    password: hash, 
                    age
                });
                res.render("user");
            } catch (error) {
                res.status(500).send("Error creating user");
            }
        });
    });
});

app.get('/login',(req,res)=>{
    res.render("login");
})


const secretKey = "yourSecretKey";
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    userModel.findOne({ email: email })
        .then(user => {
            if (!user) return res.send("User not found");
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) return res.send("Error comparing passwords");
                if (result) {
                    const token = jwt.sign({ email: user.email, id: user._id }, secretKey);
                    res.cookie("token", token, {
                        httpOnly: true,
                        secure: false, // set to true if using HTTPS
                    });
                
                    // 🔥 Fix: Pass full user with payments to dashboard
                    res.render("dashboard", { user: user });
                }
                
            });
        })
        .catch(err => {
            res.send("Something went wrong: " + err.message);
        });
});

app.get('/dashboard', isLoggedIn, async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email });
    res.render("dashboard", { user });
});



app.post('/payment', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    const {amount ,description,date} = req.body;
   
    user.payments.push({amount,description,date});
    user.save();
    res.redirect("/dashboard");
})


app.get('/logout', (req, res) => {
    res.cookie("token", "", { maxAge: 0 }); // Clear the cookie effectively
    res.redirect("/login");
});

function isLoggedIn(req, res, next) {
    if (req.cookies.token === "" || !req.cookies.token) {
        return res.redirect("/login");
    }
    try {
        let data = jwt.verify(req.cookies.token, "yourSecretKey");
        req.user = data;
        next();
    } catch (error) {
        console.error("JWT verification failed:", error);
        return res.redirect("/login");
    }
}


app.listen(3000);
