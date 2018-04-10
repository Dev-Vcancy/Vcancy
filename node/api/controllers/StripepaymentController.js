/**
 * StripepaymentController
 *
 * @description :: Server-side logic for managing stripepayments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var stripe = require("stripe")("sk_test_3fpVP60CLMtFE79cCvSY81i4");
module.exports = {



  /**
   * `StripepaymentController.successs()`
   */
  successs: function (req, res) {
    return res.json({
      todo: 'successs() is not implemented yet!'
    });
  },


  /**
   * `StripepaymentController.failure()`
   */
  failure: function (req, res) {
    return res.json({
      todo: 'failure() is not implemented yet!'
    });
  },


  /**
   * `StripepaymentController.paymentcharge()`
   */
  paymentcharge: function (req, res) {
    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    // var token = req.body.stripeToken; // Using Express
    var amount = parseFloat(req.body.amount); // Using Express
    var cardno = req.body.cardno;
    var expiry = req.body.expiry;
    var expmonth = req.body.expiryMonth; 
    var expyear = req.body.expiryYear;
    var cvc = req.body.cvc;   // 3 digits
    var zipcode = req.body.zipcode;   // 3 digits
    var desciption = req.body.desciption; // Using Express
    var amountinCentes = amount * 100;
    amountinCentes = parseFloat(amountinCentes.toFixed(2));

    stripe.tokens.create({
      card: {
        "number": cardno,
        "exp_month": expmonth,
        "exp_year": expyear,
        "cvc": cvc
      }
    }, function (err, token) {
      // asynchronously called
      if (err)
        res.json({ 'error': err });
      if (token) {
        // token represents token to be used for charge
        // res.json({ 'token': token.id });
        stripe.charges.create({
          amount: amountinCentes,
          currency: "usd",
          source: token.id, // obtained with Stripe.js
          description: desciption
        }, function (err, charge) {
          // console.log('Error==>>', err);
          // console.log('Success=>>', charge);
          // asynchronously called
          res.json({
            err: err,
            charge: charge
          });
        });
      }
    });

   
  }
};

