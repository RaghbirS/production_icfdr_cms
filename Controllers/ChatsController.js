const { authenticateToken } = require("../Authorization/AuthenticateToken.js");
const { ChatModel } = require("../Model.js");

exports.Chat = (app) => {
    const getData = async (req, res) => {
        const query = req.query;
        try {
            const data = await ChatModel.find(query);
            res.send(data);
        } catch (err) {
            res.send("Internal Server Error");
        }
    }

    const getDataById = async (req, res) => {
        const id = req.params.id;
        try {
            const data = await ChatModel.find({
                $or: [{ from: id }, { to: id }],
            });
            if (!data) {
                res.status(404).send("Object not found");
            } else {
                res.send(data);
            }
        } catch (err) {
            res.status(500).send("Internal Server Error");
        }
    }

    const addData = async (req, res) => {
        const data = req.body;
        try {
            const member = new ChatModel(data);
            await member.save();
            res.send(data);
        } catch (err) {
            console.log(err)
            res.send(err);
        }
    }
    const updateDataById = async (req, res) => {
        const id = req.params.id;
        try {
            const data = req.body;
            console.log(data)
            const updatedObjet = await ChatModel.findOneAndUpdate({ _id: id }, data);
            res.send(`Object with ID:${id} has been deleted`);
        }
        catch (err) {
            res.status(500).send("Internal Server Error");
        }
    }
    const deleteDataById = async (req, res) => {
        const id = req.params.id;
        try {
            const deletedObject = await ChatModel.findByIdAndDelete(id);
            if (!deletedObject) {
                res.status(404).send("Object not found");
            } else {
                res.send(`Object with ID:${id} has been deleted`);
            }
        } catch (err) {
            res.status(500).send("Internal Server Error");
        }
    }
    

    app
        .get(`/chats`,authenticateToken, getData)
        .get(`/chats/:id`,authenticateToken, getDataById)
        .post(`/chats`,authenticateToken, addData)
        .patch(`/chats/:id`,authenticateToken, updateDataById)
        .delete(`/chats/:id`,authenticateToken, deleteDataById)
}