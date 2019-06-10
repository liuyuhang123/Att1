const mysql = require('./mysql')
const crypto = require('crypto')

const md5encode = (str) =>{//随机盐
    const hash = crypto.createHash('md5')
    hash.update(str)
    return hash.digest('hex')
}

class User{
    static find(name, callback) {
        let sql = `select * from user where name='${name}'`
        mysql.query(sql,(err,result) =>{
            if(err){
                callback(err,null)
                return
            }

            if(result.length===0){
                callback(null,null)
                return
            }

            const userData = result[0]
            const user = new User()
            user.id = userData.id
            user.name = userData.name
            user.pass_hash = userData.pass_hash
            user.pass_salt = userData.pass_salt
            user.cash = userData.cash
            user.gameStart = userData.gameStart
            user.gameCoin = userData.gameCoin
            user.gameCards = userData.gameCards
            callback(null,user)
        })
    }

    /* static create(userInfo,callback){
        const pass_salt = md5encode(`${Date.now()}`)//盐
        const {username,pass_hash,salt}=userInfo
        const pass_hash = md5encode(`${pass_salt}^^^${password}`)//原始密码加上盐
        const pass_salt = md5(pass_hash+salt)
        let sql = `insert into user(
            name,pass_hash,,salt
        ) values(
            '${username}','${pass_hash}','${pass_salt}','${salt}'
        )`
        mysql.query(sql,(err,result)=>{
            if(err){
                callback(err,null)
                return
            }

            if(result.affectedRows===1){
                callback(null)
            }else{
                callback(new Error('insert error'))
            }
        })
    } */

    static create(userInfo,callback){
        const pass_salt = md5encode(`${Date.now()}`)//盐
        const {username,password}=userInfo
        const pass_hash = md5encode(`${pass_salt}^^^${password}`)//原始密码加上盐
        let sql = `insert into user(
            name,pass_hash,pass_salt
        ) values(
            '${username}','${pass_hash}','${pass_salt}'
        )`
        mysql.query(sql,(err,result)=>{
            if(err){
                callback(err,null)
                return
            }

            if(result.affectedRows===1){
                callback(null)
            }else{
                callback(new Error('insert error'))
            }
        })
    }

    checkPassword(passwd){//判断密码是否正确
        const passhash = md5encode(`${this.pass_salt}^^^${passwd}`)
        if(passhash===this.pass_hash){
            return true
        }else{
            return false
        }
    }
    save(userInfo,callback) {
        const {cash,id}=userInfo
        let sql = `update user set cash=${cash} where id=${id}`
        mysql.query(sql,(err,result)=>{
            if(err){
                callback(err)
                return
            }
            if(result.affectedRows===1&&result.changedRows===1){
                callback(null)
            }else{
                callback(new Error('update user error'))
            }
        })
    }
}

//info= {username='gaofei',password='123'}
/* User.create(info,(err)=>{

}) */

module.exports = {
    User
}