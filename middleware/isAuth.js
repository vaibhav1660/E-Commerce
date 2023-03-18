module.exports = (req,res,next)=>{
    if(req.session.is_loggedin&&req.session.user.isVerified){
        next();
        return
    }
    else if(req.session.is_loggedin){
        res.send("please verify your account")
    }
    else {
        res.render("home");
    }
}