const { User } = require('../models/User');

let auth = async (req, res, next) => {
    // 인증 처리를 하는 곳

    // 클라이언트 쿠키에서 토큰을 가져오기
    let token = req.cookies.x_auth;
    if (!token) {
        return res.status(401).send({ success: false, message: "토큰이 제공되지 않았습니다." });
    }

    try {
        // 토큰을 복호화하여 유저를 찾는다
        const user = await User.findByToken(token);
        if (!user) {
            return res.status(401).send({ success: false, message: "유효한 사용자가 아닙니다." });
        }

        req.token = token;
        req.user = user;
        next();
    } catch (err) {
        res.status(500).send({ success: false, err });
    }
}

module.exports = { auth };