const router = require('express').Router()
const { User } = require('../models/user')
const {
    pokers,
    randomCards,
    CardGroup
} = require('../models/Card'); //引入Card.js,解构复制
const windRates = {
    'is5k': 750,
    'isrs': 250,
    'issf': 150,
    'is4k': 60,
    'isfh': 10,
    'isfl': 7,
    'isst': 5,
    'is3k': 4,
    'is2p': 3,
    'is1p': 2,
    '再接再厉': 0,
    //待操作
}

//indexes: []
function genCardGroup(randIdx) { //有问题
    let cards = new CardGroup();
    randIdx.forEach(id => {
        cards.push(id); //需要修改
    });
    return cards;
}



router.get('/random',(req, res) => {
    const userData = req.session.user
    const user = new User
    user.id = userData.id
    user.name = userData.name
    user.pass_hash = userData.pass_hash
    user.pass_salt = userData.pass_salt
    user.cash = userData.cash
    user.gameStart = userData.gameStart
    user.gameCards = userData.gameCards
    user.hash = userData.hash
    const randIdx = randomCards(); //调用函数[0,12,2,14,5]
    let gameCards = genCardGroup(randIdx);
    user.gameCards = randIdx 
    user.gameStart = true
    req.session.user = user
    res.json({
        cards: randIdx, //=>{(type:1,vaule:1)}
        result: gameCards.judge(),
        gameStart: true
    })//返回客户端
})

//下注
router.post('/pour', (req, res) => {
    if(!(req.session && req.session.user)){
        res.redirect('/reg')
        return
    }
    const userData = req.session.user
    const user = new User
    user.id = userData.id
    user.name = userData.name
    user.pass_hash = userData.pass_hash
    user.pass_salt = userData.pass_salt
    user.cash = userData.cash
    user.gameStart = userData.gameStart
    user.gameCards = userData.gameCards
    user.hash = userData.hash
    user.gameStart = true
    let coin = req.body.coin || 0
    if (coin < 1) {
        req.session.user = user
        res.json({
            code: 1,
            desc: '下注金额不能为0'
        })
        return
    }
    if (user.cash < coin) {
        req.session.user = user
        res.json({
            code: 1,
            desc: '金额不足'
        })
        return
    }
    user.cash -= coin
    let cash = user.cash
    let id = user.id
    user.save({cash,id},err=>{
        if(err){
            req.session.user = user
            res.json({
                code:1,
                desc:'更新失败'
            })
            return
        }
        req.session.user = user
        res.json({
            code: 0,
            currCoin: user.cash,
            gameStart: user.gameStart
        })
        return
    })
})


router.post('/switch', (req, res) => { //换牌
    /*
        keep = [0,1,2]
    */
    if(!(req.session && req.session.user)){
        res.redirect('/signin')
        return
    }
   const userData = req.session.user
   const user = new User
   user.id = userData.id
   user.name = userData.name
   user.pass_hash = userData.pass_hash
   user.pass_salt = userData.pass_salt
   user.cash = userData.cash
   user.gameStart = userData.gameStart
   user.gameCards = userData.gameCards
    let keep = req.body['keepcard[]']
    for (let i = 0; i < req.body.length; i++) {
        if (keep[i] == "0") {
            keep[i] = 0;
        } else if (keep[i] == "1") {
            keep[i] = 1;
        } else if (keep[i] == "2") {
            keep[i] = 2;
        } else if (keep[i] == "3") {
            keep[i] = 3;
        } else if (keep[i] == "4") {
            keep[i] = 4;
        }
    }
    if (!keep) {
        keep = [];
    }
    let temp = []
    for (let i = 0; i < 5; i++) {
        let cardtext = false;
        for (let j = 0; j < req.body.length; j++) {
            if (keep[j] == i) {
                cardtext = !cardtext;
                break;
            }
        }
        if (cardtext) {
            temp[i] = user.gameCards[i]._cardid;
        } else {
            temp[i] = null;
        }
    }

    user.gameCards = randomCards(temp)
    const cards = genCardGroup(user.gameCards)

    const result = cards.judge()

    const winCoin = (windRates[result] || 0) * req.body.pourCoin

    if (winCoin > 0) {
        user.cash += winCoin
        const cash = user.cash
        const id = user.id
        console.log('user-5',user)
        console.log('user.id-2',user.id)
        console.log('id-2',id)
        user.save({cash,id},err=>{
            console.log(2)
            if(err){
                req.session.user = user
                console.log('user-6',user)
                res.json({
                    code:1,
                    desc:'更新失败',
                    gameCoin: user.cash,
                    cards,
                    winCoin,
                    result
                })
                return
            }
            req.session.user = user
            console.log('user-7',user)
            res.json({
                gameCoin: user.cash,
                winCoin,
                cards,
                result
            })
            return
        })
    } else {
        user.cash = user.cash
        req.session.user = user
        console.log('user-8',user)
        res.json({
            gameCoin: user.cash,
            winCoin,
            cards,
            result
        })
        return
    }
})


router.post('/room',(req,res)=>{//进入房间
    if(!(req.session && req.session.user)){
        res.redirect('/reg')
        return
    }
    if(req.session.user.room===true){
        res.json({
            code: 1,
            msg: "已经进入其他房间，不能再进！"
        })
        return
    }
    let roomtf = req.body['roomtfarr[]']
    for(let i = 0;i<roomtf.length;i++){
        if(roomtf[i]==='true'){
            roomtf[i] = true
        }else{
            roomtf[i] = false
        }
    }
    const userData = req.session.user
    const user = new User
    user.id = userData.id
    user.name = userData.name
    user.pass_hash = userData.pass_hash
    user.pass_salt = userData.pass_salt
    user.cash = userData.cash
    user.gameStart = userData.gameStart//游戏是否开始
    user.gameCards = userData.gameCards//卡牌
    user.hash = userData.hash
    user.room = userData.room
    user.roomtf = userData.roomtf//房间是否有人
    user.roomid = userData.room.id//房间号
    user.room = true
    user.roomtf = roomtf
    user.roomid = req.body.roomid
    user.roomtf = roomtf
    req.session.user = user
    res.json({
        code: 0,
        msg: "成功进入房间！"
    })
    return
})

module.exports = router