const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { User } = require('./models/User')
const config = require('./config/key')

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// application/json
app.use(bodyParser.json());

mongoose.connect(config.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));



app.get('/', (req, res) => {
    res.send('Hello World!')
})

// 회원가입 기능 구현
app.post('/register', (req, res) => {
    // 회원가입시 필요한 정보들을 client에서 가져오면
    // 그것들을 db에 넣어준다.
    const user = new User(req.body)

    // save 전에 비밀번호 암호화
    
    user.save()
        .then((userInfo) => {
            res.status(200).json({ success: true })
        })
        .catch((err) => {
            res.json({ success: false, err })
        })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
