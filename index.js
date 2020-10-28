var express = require('express');
var parser = require('body-parser');
var path = require('path');
var app = express();
var edit=require('edit-json-file');
app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())
var multer  = require('multer');
var upload = multer();
const fs=require('fs');
app.use(function(req,res,next){
    res.locals.userValue = null;
    next();
});

app.set('view engine', 'ejs');
app.set('views','./');

app.use(express.static(__dirname+'/public'));

app.get('/', function(req, res)
{
    res.render('home.ejs');
});

app.post('/customer', function(req, res)
{
    res.render('customerMenu.ejs');
});

app.post('/customer/registration', function(req, res)
{
    res.render("registration.ejs");
});

function readFile(filename, promise) {
    var promise=new Promise((resolve, reject)=>
    {
        fs.readFile(filename,(err, data)=>
        {
            if(err)
            return(reject(err));
            resolve(data); //executes the then function
        })
    })
    return(promise);
}

app.post('/customer/registration/details', upload.none(), function(req, res)
{
    var name=req.body.name;
    var email=req.body.email;
    var pass1=req.body.pass1;
    var pass2=req.body.pass2;
    
    var file=edit('users.json');
    file.set(name, [email, pass1]);
    file.save();
    file=edit('users.json', {autosave: true});
    res.render('login.ejs');
});
app.post('/customer/login', function(req, res)
{
    res.render('login.ejs', {msge: "Welcome. Please login to continue"});
});
app.post('/customer/login/details', function(req, res)
{
    var uname=req.body.uname;
    var upass=req.body.upass;
    var file=edit('users.json');
    var x=file.get(uname);
    if(x=={})
    {
        res.render('login.ejs', {msge: "Invalid username. Please login again"});
    }
    var upass1=x[1];
    if(upass==upass1)
    {

        res.render('productMenu.ejs', {name: uname});
    }
    else
    {
        res.render('login', {msge:"The password entered is invalid. Please login again."})
    }
});
app.post('/products/:category', function(req, res)
{
    var cat=req.params.category;
    if(cat=="women")
    {
        var file1=edit('stocks.json');
        var arr=file1.get("women");
        /*var items=[];
        var brands=[];
        var quantity=[];
        for(var i=0;i<arr.length;i++)
        {
            items.push(arr[i][0]);
            brands.push(arr[i][1]);
            quantity.push(arr[i][2]);
        } */
        res.render("women.ejs", {arr:arr});
    }
    if(cat=="men")
    {
        var file1=edit('stocks.json');
        var arr=file1.get("men");
        res.render("men.ejs", {arr:arr});
    }
    if(cat=="footwear")
    {
        var file1=edit('stocks.json');
        var arr=file1.get("footwear");
        res.render("footwear.ejs", {arr:arr});
    }
});

app.post('/customer/cart/:filter', upload.none(), function(req, res)
{
    var filt=req.params.filter;
    var file2=edit('cart.json');
    var buy=req.body.toBuy;
    var qty=req.body.qty;
    file2.set(buy, qty);
    file2.save();
    file2=edit('cart.json', {autosave: true});

    var file3=edit('stocks.json');
    var arr1=file3.get(filt);
    for(var i=0;i<arr1.length;i++)
    {
        if(arr1[i][0]==buy) 
        {
            arr1[i][2]=arr1[i][2]-qty;
            break;
        }
    }
    file3.set(filt, arr1);
    file3.save();
    file3=edit('stocks.json', {autosave: true});
    res.render('productMenu');

});

app.post('/customer/cart', upload.none(), function(req, res)
{
    var file4=edit('cart.json');
    var j=JSON.stringify(file4);
    var pos=j.lastIndexOf("data");
    res.render("cartView.ejs", {cartItems: j.substring(pos+7, j.length-2)});
});
app.listen(1111);