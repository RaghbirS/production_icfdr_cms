const { default: axios } = require('axios');
require("dotenv").config();
// let CLIENT_ID = "390139244489-92v6mqj5oljo5a6iago8q8445eu35lpd.apps.googleusercontent.com"
// let CLIENT_SECRET = "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"
let CLIENT_ID = process.env.CLIENT_ID
let CLIENT_SECRET = process.env.CLIENT_SECRET
const nodemailer = require('nodemailer');
const { UsersModel } = require('../Model');
exports.sendMail = (app) => {
    app.post("/sendMail", async (req, res) => {
        try {
            let { userID, email, subject, body } = req.body;
            let USER = await UsersModel.findById(userID);
            if (!USER.googleLogin) {
                USER = await UsersModel.findById("64e8be4d1b836b49647d78aa");
            }
            let user_email = USER.email;
            let refresh_token = USER.googleRefreshToken;
            const url = 'https://oauth2.googleapis.com/token';
            const params = new URLSearchParams();
            params.append('client_id', CLIENT_ID);
            params.append('client_secret', CLIENT_SECRET);
            params.append('refresh_token', refresh_token);
            params.append('grant_type', 'refresh_token');
            let { data } = await axios.post(url, params);
            let access_token = data.access_token;
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: user_email,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: refresh_token,
                    accessToken: access_token,
                },
            });
            const mailOptions1 = {
                from: user_email,
                to: email,
                subject: subject,
                html: body
            };

            transporter.sendMail(mailOptions1, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            res.send({ email, subject, body,message:`Email sent Successfully to ${email}` })
        }
        catch (err) {
            res.send({error:err,message:"Session Expired. Please Login Again!"})
        }
    })
}