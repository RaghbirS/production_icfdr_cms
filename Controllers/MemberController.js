const { MemberModel } = require("../Model.js");
exports.memberLoginController = async (req, res) => {
    const { phone, dob } = req.body;

    const member = await MemberModel.findOne({ phone });

    if (!member) {
        return res.json({ message: 'User Not Found' });
    }

    if (member.dob !== dob) return res.json({ message: 'DOB does not match !' });

    res.json(member)
}
