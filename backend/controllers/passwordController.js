const uuid = require('uuid');
const axios = require('axios');
const bcrypt = require('bcrypt');
const { User, ForgotPasswordRequests } = require('../models');

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
                htmlContent: `<p>Click <a href="http://localhost:3000/password/resetpassword/${id}">here</a> to reset your password</p>`
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
            res.status(200).send(`
                <html>
                    <head>
                        <title>Update Password</title>
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    </head>
                    <body>
                        <div class="container mt-5">
                            <form action="/password/updatepassword/${id}" method="POST">
                                <label for="newpassword" class="form-label">Enter New Password</label>
                                <input type="password" name="newpassword" class="form-control" required></input>
                                <button type="submit" class="btn btn-primary mt-3">Update Password</button>
                            </form>
                        </div>
                    </body>
                </html>
            `);
        } else {
            res.status(404).send('<html><body><h4>Link is invalid or has expired</h4></body></html>');
        }
    } catch (err) {
        res.status(500).send('<html><body><h4>Something went wrong</h4></body></html>');
    }
};

exports.updatepassword = async (req, res) => {
    try {
        const newpassword = req.body.newpassword;
        const resetId = req.params.resetId;

        const resetpasswordrequest = await ForgotPasswordRequests.findOne({ where: { id: resetId } });
        if (!resetpasswordrequest) {
            return res.status(404).send('<html><body><h4>Invalid request</h4></body></html>');
        }
        
        if (!resetpasswordrequest.isActive) {
            return res.status(400).send('<html><body><h4>Link has expired</h4></body></html>');
        }

        const user = await User.findOne({ where: { id: resetpasswordrequest.userId } });
        if (user) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newpassword, saltRounds);
            await user.update({ password: hashedPassword });
            await resetpasswordrequest.update({ isActive: false });
            res.status(200).send('<html><body><h4>Successfully updated the password. You can now login.</h4></body></html>');
        } else {
            return res.status(404).send('<html><body><h4>User does not exist</h4></body></html>');
        }
    } catch (err) {
        res.status(500).send('<html><body><h4>Something went wrong</h4></body></html>');
    }
};
