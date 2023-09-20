const expressJwt = require('express-jwt');
const bcrypt = require('bcrypt');
const secret = 'accha-theekHai-samajhGaya';
const { UsersModel } = require('../Model.js');
const jwt = require('jsonwebtoken');

exports.loginController = async (req, res) => {
    const { email, password, isGoogleLogin, googleRefreshToken } = req.body;

    const user = await UsersModel.findOne({ email });
    if (!user) {
        return res.json({ message: 'User Not Found' });
    }

    if (!isGoogleLogin) {
        if (!user.password) {
            return res.json({ message: 'You have registered your account with google, please generate a new password by going to forgot password to login without google' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.json({ message: 'Invalid Password' });
        }

        const token = jwt.sign({ userId: user._id }, secret);
        return res.json({
            token,
            _id: user._id,
            whatsApp: user?.whatsApp || '0000000000',
            email: user.email,
            assignedCenter: res.assignedCenter,
            isAdmin: user.isAdmin,
            role: user.role,
            name: user.name,
            permission: user.permissions,
            password_changed: user.password_changed,
            ownerID: user.ownerID
        });
    }

    if (isGoogleLogin && user.googleLogin) {
        await UsersModel.findOneAndUpdate({ email }, {
            googleRefreshToken
        });

        const token = jwt.sign({ userId: user._id }, secret);
        res.json({
            token,
            _id: user._id,
            whatsApp: user?.whatsApp || '0000000000',
            email: user.email,
            creator: res?.creator,
            assignedCenter: res.assignedCenter,
            isAdmin: user.isAdmin,
            role: user.role,
            name: user.name,
            permission: user.permissions,
            password_changed: user.password_changed,
            ownerID: user.ownerID
        });
    }
};

