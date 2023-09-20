const { connection, AllDonationsModel, MonthlyDataModel, WhatsappTrackerModel, AnnouncementModel, CustomersInfoModel, ConfigurationModel, EmailTrackerModel, MeetingsModel, NotesModel, LogsModel, ContactsModel, AccountModel, MemberModel, UsersModel, FormModel } = require("./Model");
// const { app } = require("./app.js");
const userControllers = require("./Controllers/UsersController.js")
const { Route } = require("./Controllers/CommonController.js")
const { loginController } = require("./Controllers/LoginController.js");
const { sendMail } = require('./Features/SendMail');
const { Chat } = require("./Controllers/ChatsController");
const cron = require('node-cron');
const nodemailer = require('nodemailer');
require("dotenv").config();
const path = require('path');
const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }))
app.use(express.static("build"));
const cors = require("cors");
const { memberLoginController } = require("./Controllers/MemberController");
const { default: axios } = require("axios");
const port = process.env.PORT || 3001;

app.get(`/`, (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
})
app.get(`/client/:route`, (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
})

app.use(express.json({ limit: '50mb' }))
app.use(cors())
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
    }
});

io.on('connection', (socket) => {
    socket.on("sendMessage", (message) => {
        console.log(message)
        io.emit("recieveMessage", message)
    })
});

const Razorpay = require("razorpay");
const { authenticateToken } = require("./Authorization/AuthenticateToken");
// Payment Gateway Integration Starts Here

var instance = new Razorpay({
    key_id: 'rzp_test_nSahl5FThvw7uJ',
    key_secret: 'd4p6ON5LLXwJXM8gg9mB93qo'
})

app.post("/create/orderId", async (req, res) => {
    const data = req.body;

    const options = {
        amount: req.body.amount * 100,
        currency: "INR",
        receipt: "rcp1"
    }
    instance.orders.create(options, (err, order) => {
        console.log(order);
        res.send({
            orderId: order.id
        })
    })
});





// Users EndPoint

app
    .get("/users", userControllers.getUsers)
    .get("/users/:id", userControllers.getUsersById)
    .post("/users", userControllers.addUsers)
    .post("/addEmployee", userControllers.addAnyEmployee)
    .patch("/users/:id", userControllers.updateUsersById)
    .patch("/users/email/:email", userControllers.updatePasswordByEmail)
    .delete("/users/:id", userControllers.deleteUsersById);

app.post("/users/getDataByCenters", async (req, res) => {
    let centers = req.body.centers;
    if (!centers || centers.length === 0) return res.json([])
    let userID = req.body.userID;
    let data = await UsersModel.find({});
    let temp = [];
    console.log(centers)
    for (let item of data) {
        if (item.isAdmin) continue
        for (let cen of centers) {
            if (item.centers.includes(cen)) {
                temp.push(item);
                break;
            }
        }
    }
    temp = temp.filter(i => {
        if (userID == i.userID) return false;
        return true
    })
    console.log(temp)
    res.json(temp)
})





// Meeetings EndPoint
Route(app, "meetings", MeetingsModel)

// Notes EndPoint
Route(app, "notes", NotesModel)

// Contacts EndPoint
Route(app, "contacts", ContactsModel)

// Accounts EndPoint
Route(app, "accounts", AccountModel)

// Member EndPoint
Route(app, "member", MemberModel)

// Member EndPoint
Route(app, "logs", LogsModel)

app.post("/log", async (req, res) => {
    const data = req.body;
    try {
        const member = new LogsModel(data);
        await member.save();
        res.send(data);
    } catch (err) {
        // console.log(err)
        res.send(err);
    }
})

// form EndPoint
Route(app, "form", FormModel)

//announcement endpoint
Route(app, "announcement", AnnouncementModel)

//all donations endpoint
Route(app, "allDonations", AllDonationsModel)

//montly Data of donations endpoint
Route(app, "monthlyData", MonthlyDataModel)

app.post("/member/getDataByCenters", async (req, res) => {
    let centers = req.body.centers;
    console.log(centers)
    if (!centers || centers.length === 0) return res.json([])
    // let userID = req.body.userID;
    let temp = [];
    for (let i of centers) {
        temp.push({
            center: i
        })
    }
    if (req.query.donorType) {
        let data = await MemberModel.find({
            $or: temp,
            "details.donorType": req.query.donorType
        });
        return res.json(data)
    }
    let data = await MemberModel.find({
        $or: temp,
    });
    res.json(data)
})

app.get("/userDataByToken", authenticateToken, async (req, res) => {
    res.send(req.user)
})

// emailTracker EndPoint
Route(app, "emailTracker", EmailTrackerModel)


// whatsappTracker EndPoint
Route(app, "whatsappTracker", WhatsappTrackerModel);

app.post("/whatsappTracker/getDataByCenters", async (req, res) => {
    let centers = req.body.centers || [];

    if (!centers || centers.length === 0) return res.json([])
    let data = await WhatsappTrackerModel.find({});
    let temp = [];

    for (let item of data) {
        for (let cen of centers) {
            if ((item.center).includes(cen)) {
                temp.push(item);
                break;
            }
        }
    }

    console.log(temp)
    res.json(temp)
})
app.post("/emailTracker/getDataByCenters", async (req, res) => {
    let centers = req.body.centers || [];

    if (!centers || centers.length === 0) return res.json([])
    let data = await EmailTrackerModel.find({});
    let temp = [];

    for (let item of data) {
        for (let cen of centers) {
            if ((item.center).includes(cen)) {
                temp.push(item);
                break;
            }
        }
    }

    console.log(temp)
    res.json(temp)
})

// customersInfo EndPoint
Route(app, "customersInfo", CustomersInfoModel)

// Configuration EndPoint
Route(app, "configuration", ConfigurationModel)

// Send Mail

sendMail(app)

// Send Mail

Chat(app, io)

// login

app.post('/signin', loginController);

// Member login

app.post('/memberLogin', memberLoginController);

function formatDateToYYYYMMDD() {
    let date = new Date()
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

async function getTodaysBirthdayChildrens() {
    let today = formatDateToYYYYMMDD()
    const birthdayChildrens = await MemberModel.aggregate([
        {
            $match: {
                'details.children.dob': today
            }
        }
    ])
    let arr = [];
    for (let members of birthdayChildrens) {
        for (let i of members.details.children) {
            if (i.dob === today) {
                arr.push({
                    ...i, email: members.email, memberName: members.details.name
                })
            }
        }
    }
    return arr;
}
async function getTodaysAniversaryMembers() {
    const todayCheck = new Date();
    const todayFormatted = todayCheck.toISOString().slice(5, 10);
    console.log(todayFormatted)
    const aniversaryMembers = await MemberModel.find({ 'details.dateOfMarriage': { $regex: todayFormatted } })

    return aniversaryMembers;
}

//Birthday mail Sender
cron.schedule('0 0 * * *', async () => {
    console.log("Ran")
    // cron.schedule('0 0 * * *', async () => {
    try {
        // Get current date (ignore time)

        let today = formatDateToYYYYMMDD()
        let USER = await UsersModel.findById("64e8be4d1b836b49647d78aa")
        let user_email = USER.email;
        let refresh_token = USER.googleRefreshToken;
        const url = 'https://oauth2.googleapis.com/token';
        const params = new URLSearchParams();
        params.append('client_id', process.env.CLIENT_ID);
        params.append('client_secret', process.env.CLIENT_SECRET);
        params.append('refresh_token', refresh_token);
        params.append('grant_type', 'refresh_token');
        let { data } = await axios.post(url, params);
        let access_token = data.access_token;
        // Find members with today's birthday
        const birthdayMembers = await MemberModel.find({
            dob: today,
        });
        const birthdayChildrens = await getTodaysBirthdayChildrens();
        const aniversaryMembers = await getTodaysAniversaryMembers();


        console.log(birthdayMembers, birthdayChildrens)

        // Send birthday emails
        birthdayMembers.forEach(async (member) => {
            const mailOptions = {
                from: 'your-email@example.com',
                to: member.email,
                subject: 'Happy Birthday!',
                text: `Dear ${member.details.name},\n\nHappy birthday to you! 🎉🎂`,
            };
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: user_email,
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET,
                    refreshToken: refresh_token,
                    accessToken: access_token,
                },
            });

            await transporter.sendMail(mailOptions);
            console.log(`Birthday email sent to ${member.details.name}`);
        });
        birthdayChildrens.forEach(async (children) => {
            const mailOptions = {
                from: 'your-email@example.com',
                to: children.email,
                subject: 'Happy Birthday!',
                text: `Dear ${children.memberName},\n\nHappy birthday to your son ${children.name}! 🎉🎂`,
            };
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: user_email,
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET,
                    refreshToken: refresh_token,
                    accessToken: access_token,
                },
            });
            await transporter.sendMail(mailOptions);
            console.log(`Birthday email sent to ${children.details.name}`);
        });
        aniversaryMembers.forEach(async (children) => {
            const mailOptions = {
                from: 'your-email@example.com',
                to: children.email,
                subject: 'Happy Birthday!',
                text: `Dear ${children.details.name},\n\nHappy birthday to your wife ${children.details.spouseName}! 🎉🎂`,
            };
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: user_email,
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET,
                    refreshToken: refresh_token,
                    accessToken: access_token,
                },
            });
            await transporter.sendMail(mailOptions);
            console.log(`Birthday email sent to ${children.details.name}`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
});


cron.schedule('0 0 * * *', async () => {
    console.log("Ran")
    try {
        let today = formatDateToYYYYMMDD()
        let USER = await UsersModel.findById("64e8be4d1b836b49647d78aa")
        let user_email = USER.email;
        let refresh_token = USER.googleRefreshToken;
        const url = 'https://oauth2.googleapis.com/token';
        const params = new URLSearchParams();
        params.append('client_id', process.env.CLIENT_ID);
        params.append('client_secret', process.env.CLIENT_SECRET);
        params.append('refresh_token', refresh_token);
        params.append('grant_type', 'refresh_token');
        let { data } = await axios.post(url, params);
        let access_token = data.access_token;
        // Find members with today's birthday
        const BASE_CALENDAR_URL =
            "https://www.googleapis.com/calendar/v3/calendars";
        const BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY =
            "holiday@group.v.calendar.google.com"; // Calendar Id. This is public but apparently not documented anywhere officialy.
        const API_KEY = process.env.API_KEY;
        const CALENDAR_REGION = "en.indian";

        const url2 = `${BASE_CALENDAR_URL}/${CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${API_KEY}`;

        const Members = await MemberModel.find();

        let holidays = await axios.get(url2)
        holidays = holidays.data.items
        holidays = holidays.filter((el, i) => { return el.start.date == today })
        // Send birthday emails
        Members.forEach(async (member) => {
            for (let i = 0; i < holidays.length; i++) {
                const mailOptions = {
                    from: 'your-email@example.com',
                    to: member.email,
                    subject: holidays[i].summary,
                    text: `Dear ${member.details.name},\n\nWishing you a very happy ${holidays[i].summary} 🎉🎂`,
                };
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: user_email,
                        clientId: process.env.CLIENT_ID,
                        clientSecret: process.env.CLIENT_SECRET,
                        refreshToken: refresh_token,
                        accessToken: access_token,
                    },
                });

                await transporter.sendMail(mailOptions);
                console.log(`Wishing ${holidays[i].summary} email sent to ${member.details.name}`);

            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
});


server.listen(port, async () => {
    try {
        await connection
        console.log("Connected to db")
    }
    catch (err) {
        console.log(err)
    }
    // exec(`start http://localhost:3001`);
    console.log("Server Started at PORT", port)
})
