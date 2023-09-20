const { uid } = require("uid");
const bcrypt = require('bcrypt');
const { UsersModel } = require("../Model.js");
// exports.getUsers = async (req, res) => {
//     const query = req.query;
//     try {
//         const data = await UsersModel.find(query);
//         res.send(data);
//     } catch (err) {
//         res.status(500).send("Internal Server Error");
//     }
// }
exports.getUsers = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided
    const skip = (page - 1) * limit;

    try {
        const dataQuery = UsersModel.find();
        const countQuery = UsersModel.countDocuments();

        const data = await dataQuery.skip(skip).limit(parseInt(limit));
        const count = await countQuery;

        res.send({ data, count });
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
}

exports.getUsersById = async (req, res) => {
    const id = req.params.id;
    try {
        const data = await UsersModel.findById(id);
        if (!data) {
            res.status(404).send("Object not found");
        } else {
            res.send(data);
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
}

exports.updatePasswordByEmail = async (req, res) => {
    const email = req.params.email;
    try {
        const data = req.body;

        // Hash the new password before updating
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;

        const updatedObject = await UsersModel.findOneAndUpdate({ email: email }, data);
        console.log(updatedObject);
        res.send(`Password has been reset for ${email}`);
    } catch (err) {
        console.log(err);
        res.send('Internal Server Error');
    }
};

exports.addUsers = async (req, res) => {
    const data = { ...req.body };
    try {
        let prevData = await UsersModel.find({ email: data.email });
        prevData = prevData[0];
        console.log(prevData);

        if (prevData) {
            if (!data.googleLogin) {
                return res.send({ error: 'User with this email already exists' });
            }
            if (data.googleLogin) {
                await UsersModel.findOneAndUpdate({ _id: prevData._id }, {
                    googleLogin: true,
                    googleRefreshToken: data.googleRefreshToken
                });
                return res.send({ _id: prevData._id });
            }
        } else {
            if (!data.googleLogin) {
                // Hash the password before saving
                const saltRounds = 10; // Number of salt rounds for bcrypt
                const hashedPassword = await bcrypt.hash(data.password, saltRounds);
                data.password = hashedPassword;
            }

            const member = new UsersModel(data);
            await member.save();
            res.send(data);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};


exports.addAnyEmployee = async (req, res) => {
    const body = req.body;
    const member = new UsersModel(body);
    await member.save();
    res.send(body);
}

exports.updateUsersById = async (req, res) => {
    const id = req.params.id;
    const isPass = req.query.password;
    const data = req.body;
    try {
        if (isPass) {
            const saltRounds = 10; // Number of salt rounds for bcrypt
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
            data.password = hashedPassword;
            const updatedObjet = await UsersModel.findOneAndUpdate({ _id: id }, data);
            res.send(`Object with ID:${id} has been deleted`);
            return
        }
        const updatedObjet = await UsersModel.findOneAndUpdate({ _id: id }, data);
        res.send(`Object with ID:${id} has been deleted`);
    }
    catch (err) {
        res.status(500).send("Internal Server Error");
    }
}
exports.deleteUsersById = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedObject = await UsersModel.findByIdAndDelete(id);
        if (!deletedObject) {
            res.status(404).send("Object not found");
        } else {
            res.send(`Object with ID:${id} has been deleted`);
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
}