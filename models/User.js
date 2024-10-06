const mongoose = require("mongoose")
const bcrypt = require('bcrypt')
const saltRounds = 10;

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

const User = mongoose.model('User', userSchema)

module.exports = { User }