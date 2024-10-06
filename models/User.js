const mongoose = require("mongoose")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // space 제거 역할
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0 // role default 값 설정
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// 비밀번호 암호화
// 스키마.pre를 사용하면 모델이 저장되기 전에 실행되는 함수를 만들 수 있다.
userSchema.pre('save', function (next) {
    var user = this
    if (user.isModified('password')) {
        // Only encrypt password if change password by using bcrypt
        bcrypt.genSalt(saltRounds)
            .then(salt => {
                bcrypt.hash(user.password, salt)
                    .then(hash => {
                        user.password = hash
                        next()
                    })
                    .catch((err) => {
                        next(err)
                    })
            })
            .catch((err) => {
                next(err)
            })
    } else {
        next()
    }
})

// 비밀번호 비교
userSchema.methods.comparePassword = function (plainPassword, cb) {
    // plainPassword를 암호화 하여 db에 저장된 암호화된 비밀번호와 비교
    var user = this
    bcrypt.compare(plainPassword, user.password, function (err, isMatch) {
        if (err) return cb(err)
        cb(null, isMatch)
    })
}

// 토큰 생성
userSchema.methods.generateToken = function (cb) {
    // jsonwebtoken을 이용하여 토큰 생성
    var user = this
    var token = jwt.sign(user._id.toHexString(), 'secretToken')

    // user._id + 'secretToken' = token

    user.token = token
    return user.save()
        .then(user => {
            cb(null, user)
        })
        .catch(err => {
            cb(err)
        })

    // user.save(function (err, user) {
    //     if (err) return cb(err)
    //     cb(null, user)
    // })
}

// 토큰을 통해 유저 찾기
userSchema.statics.findByToken = function (token, cb) {
    var user = this;

    // 토큰을 복호화 한다
    jwt.verify(token, 'secretToken', function (err, decoded) {
        // 유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이언트에서 가져온 토큰과 db에 저장된 토큰이 일치하는지 확인
        user.findOne({ "_id": decoded, "token": token }, function (err, user) {
            if (err) return cb(err);
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }