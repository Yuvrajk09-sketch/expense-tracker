const uuid = require('uuid');
const axios = require('axios');
const bcrypt = require('bcrypt');
const { User, ForgotPasswordRequests } = require('../models');
const sequelize = require('../util/database');

exports.forgotpassword = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ where: { email } });
        if (user) {
            const id = uuid.v4();
            await user.createForgotpassword({ id, isActive: true });
            
            const brevoApiKey = process.env.BREVO_API_KEY;
            const url = 'https://api.brevo.com/v3/smtp/email';
            const data = {
                sender: { email: "yuvraj.keshu09@gmail.com" },
                to: [{ email: user.email }],
                subject: "Reset your password",
                htmlContent: `<p>Click <a href="http://localhost:8080/resetpassword.html?id=${id}">here</a> to reset your password</p>`
            };

            const response = await axios.post(url, data, {
                headers: {
                    'accept': 'application/json',
                    'api-key': brevoApiKey,
                    'content-type': 'application/json'
                }
            });
            console.log("Brevo Response:", response.data);

            return res.status(202).json({ message: 'Link to reset password sent to your mail', success: true });
        } else {
            throw new Error('User doesnt exist');
        }
    } catch (err) {
        return res.status(500).json({ message: err.message || 'Error', success: false });
    }
};

exports.resetpassword = async (req, res) => {
    try {
        const id = req.params.id;
        const forgotpasswordrequest = await ForgotPasswordRequests.findOne({ where: { id, isActive: true } });
        if (forgotpasswordrequest) {
            res.status(200).json({ success: true, message: 'Link is valid' });
        } else {
            res.status(404).json({ success: false, message: 'Link is invalid or has expired' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

exports.updatepassword = async (req, res) => {
    try {
        const newpassword = req.body.newpassword;
        const resetId = req.params.resetId;

        const resetpasswordrequest = await ForgotPasswordRequests.findOne({ where: { id: resetId } });
        if (!resetpasswordrequest) {
            return res.status(404).json({ success: false, message: 'Invalid request' });
        }
        
        if (!resetpasswordrequest.isActive) {
            return res.status(400).json({ success: false, message: 'Link has expired' });
        }

        const user = await User.findOne({ where: { id: resetpasswordrequest.userId } });
        if (user) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newpassword, saltRounds);
            
            const t = await sequelize.transaction();
            try {
                await user.update({ password: hashedPassword }, { transaction: t });
                await resetpasswordrequest.update({ isActive: false }, { transaction: t });
                await t.commit();
                res.status(200).json({ success: true, message: 'Successfully updated the password. You can now login.' });
            } catch (error) {
                await t.rollback();
                throw new Error('Database transaction failed');
            }
        } else {
            return res.status(404).json({ success: false, message: 'User does not exist' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};
