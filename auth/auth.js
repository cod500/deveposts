const auth = function(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/');
}

const guest = function(req, res, next){
    if(req.isAuthenticated()){
        res.redirect('/posts')
    }else{
        return next()
    }
}

module.exports = {auth, guest};