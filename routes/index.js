const router = require('express').Router()
const path = require('path');
const { User } = require('../models/user')

const viewPath = path.join(__dirname,'../views')


router.get('/', (req, res) => {
    if(req.session && req.session.user){
        const htmlPath = viewPath + ('/card.html')
        res.sendFile(htmlPath);
    }else{
        res.redirect('/login')
    }
});

router.get('/login',(req,res)=>{
    const signinPath = viewPath + '/login.html'
    res.sendFile(signinPath)
})

router.get('/reg',(req,res)=>{
    const signupPath = viewPath + '/reg.html'
    res.sendFile(signupPath)
})

router.get('/room',(req,res)=>{
    const roomPath = viewPath + '/room.html'
    res.sendFile(roomPath)
})


const regName = /^[a-zA-Z]\w{3,}///正则表达式


router.post('/main',(req,res)=>{
    if(req.session&&req.session.user){
        const { user } =req.session
        res.json({
            code:0,
            data:{
                cash:user.cash,
                roomtf:user.roomtf,
                roomid:user.roomid
            }
        })
    }else{
        res.redirect('/reg')
    }
})



router.post('/reg', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    if (!username){
        res.json({
            err: 1,
            msg: '请输入用账号!'
        })
        return
    }else
    if(!regName.test(username)){
        res.json({
            err: 1,
            msg: '用户名不规范!'
        })
        return
    }else
    if (!password){
        res.json({
            err: 1,
            msg: '请输入用密码!'
        })
        return
    }else
    if (!req.body.repassword){
        res.json({
            err: 1,
            msg: '请输入密码!'
        })
        return
    }else 
    if(req.body.repassword!=password){
        res.json({
            err: 1,
            msg: '两次输入密码不一致!'
        })
        return
    }
    User.find(username,(err,user)=>{
        if(err){
            console.error('find user failed:',err.message)
            res.json({
                err:1,
                msg:err.message
            })
            return
        }
        if(user){
            res.json({
                err:1,
                msg:'用户已存在!'
            })
            return
        }
    })

    User.create({username,password},err=>{
        if(err){
            res.json({
                err:1,
                msg:'创建用户失败'
            })
        }else{
            res.json({
                err:0,
                msg:'创建用户成功'
            })
        }
    })
}),


router.post('/login', (req, res) => {
    const username = req.body.username
    User.find(username,(err,user)=>{
        if(err){
            console.error('find user failed:',err.message)
            res.json({
                err:1,
                msg:err.message
            })
            return
        }
        if(user){
            const password = req.body.password
            req.session.user = user
            const userData = req.session.user
            const us = new User
            us.id = userData.id
            us.name = userData.name
            us.pass_hash = userData.pass_hash
            us.pass_salt = userData.pass_salt
            us.cash = userData.cash
            us.gameStart = userData.gameStart
            us.gameCards = userData.gameCards
            us.room = userData.room
            
            us.room = false
            if(!us.checkPassword(password)){
                res.json({
                    err:1,
                    msg:"密码错误"
                })
                return
            }
            us.gameStart = false
            us.gameCards = ''
            us.room = false
            req.session.user = us

            res.json({
                err:0,
                msg:"登录成功!"
            })
        }else{
            res.json({
                err:1,
                msg:"用户错误"
            })
            return
        }
    })
});


module.exports = router