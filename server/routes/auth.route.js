const express = require('express');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const isEmpty = require("../utils/is-empty");
const UserController = require("../controllers/user.controller");
const axios = require("axios");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const router = express.Router();
module.exports = router;

router.post('/register', async (req, res) => {
  if (req.headers.token) {
    if (typeof req.headers.token == "string" && req.headers.token.trim() !== "") {
      try {
        let payload = jwt.verify(req.headers.token, process.env.JWT_SECRET)
        User.findById(payload._id, "-password").populate("role").exec().then(doc => {
          if (doc) {
            let u = doc.toObject();
            // delete u.hashedPassword;
            req.user = u;
            res.json({ status: 200, data: u, errors: false, message: "You are already logged in!" });
          } else {
            res.status(403).json({ status: 403, data: null, errors: true, message: "Forbidden" });
          }
        })
      } catch (err) {
        if (err) {
          res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid token" });
        }
      }
    } else {
      res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid token" })
    }
  } else {
    result = await UserController.verifyRegister(req.body);
    if (!isEmpty(result.errors)) {
      console.log("HAS ERRORS");
      return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields required" });
    }
    User.findOne({ email: result.data.email }, (e, d) => {
      if (e) {
        return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while verifying user details" })
      }
      if (d) {
        return res.json({ status: 200, errors: true, data: null, message: "Email already exists" })
      } else {
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(result.data.password, salt, function (err, hash) {
            if (err)
              return res.status(500).json({ status: 500, data: null, errors: true, message: "Something went wrong with your password" });
            result.data.password = hash;
            result.data.wallet = 0;
            result.data.role = process.env.ADMIN_ROLE;
            result.data.user_id = "USR" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + Math.floor(Math.random() * (99 - 10) + 10);
            const newUser = new User(result.data);
            newUser.save().then(doc => {
              doc.populate("role", (e, d) => {
                // const u = { _id: d._id, role: d.role._id };
                jwt.sign({ _id: d._id }, process.env.JWT_SECRET, function (err, token) {
                  if (err) {
                    console.log(err);
                    res.status(500).json({ message: "Error while generating token", status: 500, errors: true, data: null });
                  }
                  else {
                    let u = d.toObject();
                    delete u.password;
                    req.user = u;
                    res.json({ message: "User registered successfully", status: 200, errors: false, data: { token, user: u } });
                  }
                });
              })
            }).catch(e => {
              console.log(e);
              res.status(500).json({ message: "Error while registering user", status: 500, errors: true, data: null });
            })
          });
        });
      }
    })
  }
});

router.post('/login', async (req, res) => {
  console.log("LOGIN ROUTE")
  if (req.headers.token != undefined) {
    if (typeof req.headers.token == "string" && req.headers.token.trim() !== "") {
      console.log("HAS TOKEN");
      jwt.verify(req.headers.token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
          console.log(err);
          res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid token" })
        } else {
          User.findById(payload._id, (err, doc) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while validating your token details" })
            }
            if (doc) {
              let u = doc.toObject();
              delete u.password;
              req.user = u;
              res.json({ status: 200, data: u, errors: false, message: "You are already logged in!" });
            } else {
              return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while validating your token details" })
            }
          }).populate('role')
          // next();
        }
      })
    } else {
      res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid token" });
    }
  } else {
    let result = UserController.verifyLogin(req.body);
    // console.log("NO TOKEN");
    if (!isEmpty(result.errors)) {
      return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields required" });
    }
    if (req.body.email && req.body.password) {
      let email = req.body.email.trim();
      User.findOne({ email: email }, (err, user) => {
        // console.log(user)
        if (err) {
          console.log(err);
          return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while finding the user" });
        }
        if (user) {
          // console.log("USER FOUND")
          bcrypt.compare(req.body.password, user.password, function (er, isMatched) {
            if (er) {
              console.log(er);
              return res.status(401).json({ status: 401, data: null, errors: true, message: "Error in validating Credentials" });
            }
            if (isMatched) {
              const u = user.toObject();
              delete u.password;
              req.user = u;
              jwt.sign({ _id: u._id }, process.env.JWT_SECRET, function (err, token) {
                if (err) {
                  console.log(err);
                  res.status(500).json({ status: 500, errors: true, data: null, message: "Error while generating token" })
                }
                else {
                  user = user.toObject();
                  delete user.password;
                  req.user = user;
                  res.json({ status: 200, data: { token, user }, errors: false, message: "Login successfull" })
                }
              });
            } else {
              return res.status(401).json({ status: 401, data: null, errors: true, notmessage: "Invalid Credentials" });
            }
          });
        } else {
          res.status(404).json({ status: 404, data: null, errors: true, message: "User not exist" });
        }
      }).populate('role')
    }
  }
});


router.post('/register2', async (req, res) => {
  console.log("REGISTER2")
  if (req.headers.token) {
    if (typeof req.headers.token == "string" && req.headers.token.trim() !== "") {
      try {
        let payload = jwt.verify(req.headers.token, process.env.JWT_SECRET)
        User.findById(payload._id, "-password").populate("role").exec().then(doc => {
          if (doc) {
            let u = doc.toObject();
            // delete u.hashedPassword;
            req.user = u;
            res.json({ status: 200, data: u, errors: false, message: "You are already logged in!" });
          } else {
            res.status(403).json({ status: 403, data: null, errors: true, message: "Forbidden" });
          }
        })
      } catch (err) {
        if (err) {
          res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid token" });
        }
      }
    } else {
      // console.log("THIS");
      res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid token" });
    }
  } else {
    result = await UserController.verifyMobileRegister(req.body);
    if (!isEmpty(result.errors)) {
      return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields required" });
    }
    let otp = Math.floor(Math.random() * (999999 - 100000) + 100000);
    let senderid = process.env.MSG_SENDER;
    let message = `${otp} is Your OTP(One Time Password) for logging into SGS Marketing App. For Secuirty Reasons, do not share the OTP. `;
    let mobile_no = req.body.mobile_number;
    let authkey = process.env.MSG_AUTH_KEY;
    axios.post(`https://control.msg91.com/api/sendotp.php?otp=${otp}&sender=${senderid}&message=${message}&mobile=${mobile_no}&authkey=${authkey}`)
      .then(response => {
        console.log("Response data : ", response.data);
        if (response.data.type == "success") {
          return res.json({ status: 200, data: null, errors: false, message: `OTP sent to ${mobile_no}` });
        } else {
          return res.status(400).json({ status: 400, data: null, errors: response.data, message: "Otp Not Verified" })
        }
      })
  }
});


router.post('/verifyotp/:type', async (req, res) => {
  if (req.headers.token) {
    if (typeof req.headers.token == "string" && req.headers.token.trim() !== "") {
      try {
        let payload = jwt.verify(req.headers.token, process.env.JWT_SECRET)
        User.findById(payload._id, "-password").populate("role").exec().then(doc => {
          if (doc) {
            let u = doc.toObject();
            // delete u.hashedPassword;
            req.user = u;
            res.json({ status: 200, data: u, errors: false, message: "You are already logged in!" });
          } else {
            res.status(403).json({ status: 403, data: null, errors: true, message: "Forbidden" });
          }
        })
      } catch (err) {
        if (err) {
          res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid token" });
        }
      }
    } else {
      // console.log("THIS");
      res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid token" });
    }
  } else {
    console.log("BODY IS ", req.body);
    result = await UserController.verifyMobileOtp(req.body);
    if (!isEmpty(result.errors)) {
      console.log("HAS ERRORS");
      return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields required" });
    }
    let otp = result.data.otp;
    let mobile_no = result.data.mobile_number;
    let authkey = process.env.MSG_AUTH_KEY;
    axios.post(`https://control.msg91.com/api/verifyRequestOTP.php?authkey=${authkey}&mobile=${mobile_no}&otp=${otp}`).then(response => {
      if (response.data.type == "success") {
        User.findOne({ mobile_number: result.data.mobile_number }, (err, user_found) => {
          console.log("User : ", user_found);
          if (err)
            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting user details" })
          if (user_found) {
            jwt.sign({ _id: user_found._id }, process.env.JWT_SECRET, function (err, token) {
              if (err) {
                console.log(err);
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while generating token" })
              }
              return res.json({ status: 200, data: { user: user_found, token: token }, errors: false, message: `OTP Verified` });
            });
          } else {
            let newUser = {};
            // newUser.role = 
            newUser.mobile_number = result.data.mobile_number;
            if (req.params.type == 'customer') {
              newUser.role = process.env.CUSTOMER_ROLE;//"5d5157820250e60017e64d42";
              newUser.dob = Date.now();
              newUser.anniversary = Date.now();
            }
            // else if (req.params.type == 'dboy') {
            //   newUser.role = process.env.DELIVERY_BOY_ROLE;//"5d5157820250e60017e64d42";
            //   newUser.dob = Date.now();
            //   newUser.city = "";
            //   newUser.vehicle_type = "";
            //   newUser.emergency_contact = "";
            //   newUser.permanent_address = "";
            //   newUser.dl_number = "";
            //   newUser.kyc = {
            //     documentType: "",
            //     image: "",
            //     verified: false
            //   }
            // }
            newUser.full_name = "";
            newUser.profile_picture = "";
            newUser.landmark = "";
            newUser.H_no_society = "";
            newUser.street_address = "";
            newUser.user_id = "USR" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + Math.floor(Math.random() * (99 - 10) + 10);
            const u = new User(newUser);
            u.save().then(d => {
              // console.log("User saved : ", d);
              jwt.sign({ _id: d._id }, process.env.JWT_SECRET, function (err, token) {
                if (err) {
                  console.log(err);
                  return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while generating token" })
                }
                return res.json({ status: 200, data: { user: d, token: token }, errors: false, message: `OTP Verified` });
              });
            }).catch(e => {
              console.log("Error while saving the user : ", e);
              return res.status(500).json({ status: 500, data: null, errors: false, message: `Error while saving the user` })
            })
          }
        })
      } else {
        res.status(400).json({ status: 400, data: null, errors: response.data, message: "Error while sending otp" })
      }
    })
  }
});


router.get('/me', async (req, res) => {
  if (req.headers.token) {
    if (typeof req.headers.token == "string" && req.headers.token.trim() !== "") {
      // console.log("HAS TOKEN");
      // if (req.method === "GET") {
      jwt.verify(req.headers.token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
          console.log(err);
          res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid token" });
        } else {
          // req.user = payload;
          User.findById(payload._id, (e, d) => {
            if (e) {
              res.status(500).json({ status: 500, data: null, errors: true, message: "Error while retriving user details" });
            }
            if (d) {
              d = d.toObject();
              delete d.password;
              req.user = d;

              res.json({ status: 200, data: { user: d }, errors: false, message: "User Details" });
            }
            else {
              res.status(403).json({ status: 403, data: null, errors: true, message: "Your token is not valid anymore" });
            }
          }).populate("area route")
        }
      })
    } else {
      res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid token" })
    }
  } else {
    console.log("THIS CALLED");
    res.status(401).json({ status: 401, data: null, errors: true, message: "Unauthorized" })
  }
});
