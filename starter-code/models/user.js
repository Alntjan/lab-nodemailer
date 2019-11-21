const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending Confirmation', 'Active'],
    default: 'Pending Confirmation'
  },
  confirmationCode: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// assign a function to the "methods" object of our animalSchema
userSchema.methods.sendConfirmationEmail = function (callback) {
  const nodemailer = require("nodemailer");
  const EMAIL = 'ih174test@gmail.com';
  const PASSWORD = 'IH174@lis';
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD
    }
  });
  return transporter.sendMail({
    from: `${this.email}`,
    to: EMAIL,
    subject: "Account Confirmation Email",
    html: `
        <h1 style="color: green">Hello ${this.username}!</h1>
        <a href="http://localhost:3000/auth/confirm/${this.confirmationCode}">Verify your email here.</a>
      `
  }, callback);
};


const User = mongoose.model('User', userSchema);

module.exports = User;