/**
 * EmailController
 *
 * @description :: Server-side logic for managing emails
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var nodemailer = require('nodemailer');
module.exports = {
	
  /**
   * `EmailController.sendemail()`
   */
  sendemail: function (req, res) {
	var transporter = nodemailer.createTransport({
		// service: 'Gmail',
		host: 'smtp.office365.com',
    port: 587,
    secure: false,
		auth: {
			user: sails.config.SMTP.email, // Your email id
			pass: sails.config.SMTP.password // Your password
		}
	});
	
	var mailOptions = {
		from: '"Team Vcancy" '+ sails.config.SMTP.email,  // sender address
		// to: 'megha@aroracomfortechs.com',  // list of receivers
		// subject: '123',  // Subject line
		// text: "hello" // plaintext body
		to: req.body.to,  // list of receivers
		subject: req.body.subject,  // Subject line
		// text: req.body.emailData // plaintext body
		html: req.body.emailData // You can choose to send an HTML body instead
	};
	
	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			console.log(error);
			res.json({yo: 'error'});
		}else{
			console.log('Message sent: ' + info.response);
			res.json({yo: info.response});
		};
	});
	
	// sails.hooks.email.send(
	  // "testEmail",
	  // {
		// recipientName: "Joe",
		// senderName: "Sue"
	  // },
	  // {
		// to: "megha@aroracomfortechs.com",
		// subject: "Hi there"
	  // },
	  // function(err,abc) {console.log(err || "It worked!"); console.log(abc);}
	// )
	 // console.log(req.body);
    return res.json({
      todo: req.body
    });
  },
  
  test: function (req, res) {
	  console.log('here is the test');
	 },
	 
};

