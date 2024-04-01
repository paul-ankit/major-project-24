var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
var mysql = require('mysql')
const util = require('util');
var session = require('express-session')
// MYSQL part
mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "",
    database: "node_project"
})

// Creating Localhost
var app = express();

app.use(express.static('public')); // accessing the public folder for css images etc

app.set("view engine", "ejs");  // setting up EJS as our view engine

// Server is listening on port 8000

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret:"secret"}))

// creating a function isProductInCart() to check if an item is already in cart or not

function isProductInCart(cart,id){

    for(let i=0;i<cart.length;i++){
        if (cart[i].id == id) {
            return true;
        }
    }

    return false;

}

// Creating a new function calculateTotal(cart,req) which will calculate the total  amount of products present in the cart and send it

function calculateTotal(cart,req){
    total = 0;
    for(let i=0; i.length; i++){
        if(cart[i].sales_price){
            total = total + (cart[i].sales_price * cart[i].quantity);
        }else{
            total = total + (cart[i].price * cart[i].quantity);
        }
    }
    req.session.total = total;
    return  total;
}

// localhost:8000

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'node_project'
});

// Convert query function to promise-based using util.promisify
const query = util.promisify(pool.query).bind(pool);

// Route handler with async/await
app.get('/', async function(req, res) {
    try {
        // Await the query execution
        const result = await query("SELECT * FROM products");
        console.log("result", result);

        // Render the page with the result
        res.render('pages/index', { result: result });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).send("An error occurred while fetching data");
    }
});

app.listen("8000"); 

// Addind cart route

app.post("/add_to_cart", function(req,res){

    var id = req.body.id;
    var name = req.body.name;
    var price = req.body.price;
    var sales_price = req.body.sales_price;
    var quantity = req.body.quantity;
    var image = req.body.image;

    var product = {id:id,name:name,price:price,sales_price:sales_price,quantity:quantity,image:image};

    if(req.session.cart){
        var cart = req.session.cart;

        if(!isProductInCart(cart,id)){
            cart.push(product);
        }
    }else{

        req.session.cart = [product];
        var cart = req.session.cart;

    }

    // calculate total
    calculateTotal(cart,req);
    
    // return to cart page
    res.redirect('/cart');
})

app.get('/cart', function(req,res){

    var cart = req.session.cart;
    var total = req.session.total;

    res.render('pages/cart',{cart:cart,total:total});

});

// creating function for remove product
app.post('/remove_product' ,function(req,res){

})

// creating function for edit quantity

app.post('/edit_product_quantity', function(req,res) {

    // get value from inputs
    var  id = req.body.id;
    var quantity = req.body.quantity;
    var increase_btn = req.body.increase_product_quantity;
    var decrease_btn = req.body.decrease_product_quantity;

    var cart = req.session.cart;

    // increase  the quantity of a single item in the cart

    if(increase_btn){
        for(let i=0; i<cart.length; i++){
            if(cart[i].id == id){
                if(cart[i].quantity > 0){
                    cart[i].quantity = parseInt(cart[i].quantity)+1;
                }
            }
        }
    }

    //  decrease the quantity of a single item in the cart

    if(decrease_btn){
        for(let i=0; i<cart.length; i++){
            if(cart[i].id == id){
                if(cart[i].quantity > 1){
                    cart[i].quantity = parseInt(cart[i].quantity)-1;
                }
            }
        }
    }

})