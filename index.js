const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { User } = require('./models/User')
const config = require('./config/key')
const cookieParser = require('cookie-parser')
const { auth } = require('./middleware/auth')


// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// application/json
app.use(bodyParser.json());
app.use(cookieParser())

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
    // User.js에서 bcrypt를 사용하여 암호화
    user.save()
        .then((userInfo) => {
            res.status(200).json({ success: true })
        })
        .catch((err) => {
            res.json({ success: false, err })
        })
})

// login 기능 구현
app.post('/api/users/login', async (req, res) => {
    try {
        // 1. db안에서 요청된 이메일 찾기
        const userInfo = await User.findOne({ email: req.body.email });
        if (!userInfo) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당되는 유저가 없습니다"
            });
        }
        // 2. db에 있다면 비밀번호 일치 여부 확인
        userInfo.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({
                    loginSuccess: false,
                    message: "비밀번호가 일치하지 않습니다."
                });
            }
            // 3. 비밀번호가 일치하면 토큰을 생성하기
            userInfo.generateToken((err, user) => {
                if (err) return res.status(400).send(err);

                // 토큰을 쿠키, 로컬 스토리지 등에 저장 가능
                // 쿠키에 토큰 저장
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id });
            });
        });
    } catch (err) {
        return res.status(500).json({ loginSuccess: false, err });
    }
});

// Auth 기능 구현
app.get('api/users/auth', auth, (req, res) => {
    // 여기까지 오면 Authentication true의 의미
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true, // role 0 -> 일반유저, 아니면 어드민
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
