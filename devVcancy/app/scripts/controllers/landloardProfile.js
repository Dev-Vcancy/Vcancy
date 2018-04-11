'use strict';

//=================================================
// Tenant Dashboard
//=================================================

vcancyApp
  .controller('landlordProfilelCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', 'Upload', 'config', '$http', '$uibModal', 'emailSendingService', 'NgTableParams',
    function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, Upload, config, $http, $uibModal, emailSendingService, NgTableParams) {
      var vm = this;
      var landLordID = localStorage.getItem('userID');
      vm.refId = localStorage.getItem('refId');

      var password = localStorage.getItem('password');
      var swal = window.swal;
      vm.userData = {};
      vm.email = '';
      vm.firstname = '';
      vm.lastname = '';
      vm.loader = 1;
      vm.contact = '';
      vm.address = '';
      vm.notification = 'Enable';
      vm.success = 0;
      vm.error = 0;
      vm.totaluser = 0;
      vm.companyUsers = [];
      /* LWS */
      vm.billingtab = 1;
      vm.allowFreUnits = true;
      vm.setasdefault = false;
      vm.savecardforFuture = false;
      vm.invoice = {
        username: "",
        id: "",
        amount: "",
        tax: "",
        units: "",
        subscription: "",
        paymethod: "",
        data: "",
        date: ''
      };
      vm.currentYear = new Date().getFullYear();
      vm.years = [];
      for (var i = 0; i < 15; i++) {
        vm.years.push(vm.currentYear + i);
      }
      vm.subscriptionValid = true;  // landlord user has purchased a plan
      vm.subscriptionPlan = "Free";  // purchased plan
      vm.subscriptionOldPlan = "Free";  // purchased plan
      vm.userOldPlanInfo = undefined;  // purchased plan
      vm.subscriptionLastPurchasedOnDate = "";  // purchased plan
      vm.creditcardNumber = "";
      vm.currentPlan = ""; // selected plan 
      vm.unitsAllowed = 5;
      vm.freeUnitsAlloted = 5;
      vm.unitsSelected = 5;
      vm.unitsBillable = 5;
      vm.allowFreeUnits = false;
      vm.billingRequired = false;
      vm.discountRequired = false;
      vm.unitsFreeUnitsAllocated = 5;
      vm.unitsProvidedToUser = 5;
      vm.nextBillingCycleDate = '';
      vm.planExpiryDate = '';
      vm.unitsAlreadyAdded = 5;
      vm.discount = 10;
      vm.discountAmount = 0;
      vm.daysinFreePlan = 15;
      vm.taxes = 2; // 2 %
      vm.usertaxes = 0;
      vm.totalEstimatedCharges = 0;
      vm.totalAfterDiscount = 0;
      vm.amountTobePayed = 0;
      vm.additionalBillableUnits = 0;
      vm.unitsFree = 5;
      vm.unitsChange = 5;
      vm.degradePlan = false;
      vm.degradeInfo = undefined;
      vm.pricePerUnit = 0.5;
      vm.rangeSlider = {
        value: 0,
        options: {
          floor: 0,
          ceil: 1000,
          step: 1,
          disabled: false,
          minLimit: 5,
          maxLimit: 1000,
          onEnd: function (val) {
            vm.updatePayableAmount();
          }
        }
      };
      vm.newcard = {
        name: "",
        cardnumber: "",
        cvv: "",
        expiryMonth: "",
        expiryYear: "",
        last4: ''
      };
      vm.defaultCard = {
        name: "",
        cardnumber: "",
        cvv: "",
        expiryMonth: "",
        expiryYear: ""
      };
      vm.selectedCard = {
        cardnumber: '',
        cvv: "",
        expiry: "",
        expiryMonth: "",
        expiryYear: "",
        id: "",
        last4: "",
        name: ""
      };
      vm.cards = [];
      vm.userBillingHistory = [];
      vm.nextBillingCycleStartDate = '';
      vm.nextBillingCycleEndDate = '';

      // fetch billing constants
      firebase.database().ref('/billing').once('value').then(function (userdata) {
        // console.log("--biling constants--", userdata.val());
        vm.unitsFree = userdata.val().freeUnits;
        vm.daysinFreePlan = userdata.val().days;
        vm.pricePerUnit = userdata.val().pricePerUnit;
      });

      /* LWS end */

      // vm.companylogo = '../assets/pages/img/no_image_found.jpg';
      $rootScope.invalid = '';
      $rootScope.success = '';
      $rootScope.error = '';
      firebase.database().ref('/users/' + landLordID).once('value').then(function (userdata) {

        $scope.$apply(function () {
          console.log("landlord", userdata.val());
          // fetch user data and store 
          vm.userData = userdata.val();
          if (vm.userData.cards) {
            // vm.cards = JSON.parse(vm.userData.cards);
            var cardsCollection = JSON.parse(vm.userData.cards) ? JSON.parse(vm.userData.cards) : [];
            cardsCollection.forEach(function (card) {
              var Tempcard = card;
              Tempcard.type = Stripe.card.cardType(card.cardnumber);
              vm.cards.push(Tempcard);
            });
          }
          // fetch default card of user
          if (vm.userData.defaultCard && vm.userData.defaultCard != '') {
            var userDefaultcard = JSON.parse(vm.userData.defaultCard);
            vm.defaultCard = {
              name: userDefaultcard.name,
              cardnumber: parseInt(userDefaultcard.cardnumber),
              cvv: "",
              expiryMonth: userDefaultcard.expiryMonth,
              expiryYear: userDefaultcard.expiryYear
            };
          } else {
            if (vm.cards.length > 0)
              vm.defaultCard = {
                name: vm.userData.firstname + ' ' + vm.userData.lastname,
                cardnumber: parseInt(vm.cards[0].cardnumber),
                cvv: "",
                expiryMonth: vm.cards[0].expiryMonth,
                expiryYear: vm.cards[0].expiryYear,
              };
          }
          /*  change from here */

          /*  check for subscription plan subscribed, if not change plan o free plan,
              assign free allocated units to current user as per admin settings
          */
          if (vm.userData.unitsProvidedToUser && vm.userData.freeUnitsAlloted && vm.userData.unitsProvidedToUser != '' && vm.userData.freeUnitsAlloted != '') {
            vm.unitsProvidedToUser = vm.userData.unitsProvidedToUser;
            vm.allowFreeUnits = false;
            vm.unitsFreeUnitsAllocated = vm.userData.freeUnitsAlloted;
            vm.unitsAlreadyAdded = vm.userData.unitsProvidedToUser;
            vm.userBillingHistory = vm.userData.billingHistory ? vm.userData.billingHistory : [];
            vm.rangeSlider = {
              value: 5,
              options: {
                floor: vm.userData.freeUnitsAlloted,
                ceil: 1000,
                step: 1,
                minLimit: vm.userData.freeUnitsAlloted,
                maxLimit: 1000,
                disabled: false,
                onEnd: function (val) {
                  vm.updatePayableAmount();
                }
              }
            };
          } else {
            // allocate free units and subscribe free plan
            vm.allowFreeUnits = true;
            vm.unitsProvidedToUser = vm.unitsFree;
            vm.unitsFreeUnitsAllocated = vm.unitsFree;
            //set free units being assigned to user
            firebase.database().ref('users/' + landLordID + "/").update({ freeUnitsAlloted: vm.unitsFreeUnitsAllocated, unitsProvidedToUser: vm.unitsFreeUnitsAllocated }).then(function (snap) {
              firebase.database().ref('users/' + landLordID + "/").once('value', function (snap) {
                vm.userData = snap.val();
                vm.rangeSlider = {
                  value: 5,
                  options: {
                    floor: vm.userData.freeUnitsAlloted,
                    ceil: 1000,
                    step: 1,
                    minLimit: vm.userData.freeUnitsAlloted,
                    maxLimit: 1000,
                    disabled: false,
                    onEnd: function (val) {
                      vm.updatePayableAmount();
                    }
                  }
                };  // slider initialize
              }); // get latest data
            }); // update free units in db

          } // free units allocation done

          // get subscripbed plan if any
          if (vm.userData.currentPlan && vm.userData.currentPlan != '' && vm.userData.currentPlan != undefined) {
            vm.subscriptionPlan = vm.userData.currentPlan;
            vm.currentPlan = vm.userData.currentPlan;
            vm.subscriptionOldPlan = vm.userData.currentPlan;
            if (vm.userData.currentPlanInfo && vm.userData.currentPlanInfo != '') {
              vm.userOldPlanInfo = vm.userData.currentPlanInfo;
            } else {
              vm.userOldPlanInfo = JSON.stringify({
                name: "Free",
                units: vm.unitsProvidedToUser,
                days: 15,
                start: moment(new Date()).toDate(),
                end: moment(new Date()).add(15, "days").toDate()
              });
              vm.subscriptionPlan = "Free";
              vm.currentPlan = "Free";
              vm.subscriptionOldPlan = "Free";
              firebase.database().ref('users/' + landLordID + "/").update({ currentPlanInfo: vm.subscriptionOldPlanInfo, currentPlan: "Free", }).then(function (data) {
                firebase.database().ref('users/' + landLordID + "/").once('value', function (snap) {
                  vm.userData = snap.val();
                });
              });
            }
          }
          else { // no plan subscribed
            vm.subscriptionOldPlanInfo = JSON.stringify({
              name: "Free",
              units: vm.unitsProvidedToUser,
              days: 15,
              start: moment(new Date()).toDate(),
              end: moment(new Date()).add(15, "days").toDate()
            });
            vm.subscriptionPlan = "Free";
            vm.currentPlan = "Free";
            vm.subscriptionOldPlan = "Free";
            firebase.database().ref('users/' + landLordID + "/").update({
              currentPlanInfo: vm.subscriptionOldPlanInfo,
              currentPlan: "Free",
            }).then(function (data) {
              firebase.database().ref('users/' + landLordID + "/").once('value', function (snap) {
                vm.userData = snap.val();
                vm.userOldPlanInfo = vm.userData.currentPlanInfo;
              });
            });
          }

          // check degraded plan if user has degraded his plan units
          if (vm.userData.degradeInfo && vm.userData.degradeInfo != '' && vm.userData.degradeInfo != 'Undefined' && vm.userData.degradeInfo != undefined) {
            // apply degrade info
            var info = JSON.parse(vm.userData.degradeInfo);
            console.log(info);
            if (Date.parse(info.startDate) < Date.now()) {
              var newPlanInfo = {
                units: vm.userData.unitsProvidedToUser - info.units,
                currentPlan: JSON.stringify({
                  start: info.startDate,
                  end: info.endDate,
                  units: 45,
                  unitsTotal: 100,
                  plan: info.plan
                }),
                degradeInfo: ''
              };
              console.log(newPlanInfo);
              firebase.database().ref('users/' + landLordID + '/').update(newPlanInfo).then(function () {
              }, function (error) {
                return false;
              });
            }
          }

          if (vm.userData.currentPlanInfo) {
            var info = JSON.parse(vm.userData.currentPlanInfo);
            if (Date.parse(info.end) < Date.now()) {
              vm.subscriptionValid = false;
              swal({
                title: "Error",
                text: "Your subscription has been expired. Please renew your plan now.",
                type: "warning",
                confirmButtonColor: '#009999',
                confirmButtonText: "Ok",
                showCancelButton: false,
                closeOnClickOutside: false,
                allowEscapeKey: true
              },
                function (isConfirm) {
                  if (isConfirm) {
                    console.log("Your account has been deactivated.");
                    $scope.$apply(function () {
                      $scope.tab = 2;
                      // show billing tab
                    });
                     var disableAccount = firebase.database().ref('users/' + landLordID + "/").update({ disable: true }).then(function (snap) {
                      console.log("Account disabled.");
                     });

                  } else {
                    console.log("Your account has been deactivated.");
                  }
                });
            } else {
              vm.subscriptionValid = true;
            }
          }


          // refresh slider
          $scope.$broadcast('reCalcViewDimensions');
          $scope.$broadcast('rzSliderForceRender');
          setTimeout(function () {
            $scope.$broadcast('reCalcViewDimensions');
            $scope.$broadcast('rzSliderForceRender');
          }, 1000);
        }); // scope apply end
      });

      var ref = firebase.database().ref("users");
      ref.orderByChild("refId").equalTo(landLordID).on("child_added", function (snapshot) {
        var companyUser = snapshot.val();
        companyUser.key = snapshot.key;
        vm.companyUsers.push(companyUser);
      });

      vm.profileSubmit = function () {
        var landLordID = localStorage.getItem('userID');

        // var updatedata = {};
        // //var tenantID = localStorage.getItem('userID');
        // if ($scope.ldProfilectrl.contact === undefined || $scope.ldProfilectrl.contact === "") {
        //   vm.contact = '';
        //   updatedata['contact'] = '';
        // } else {
        //   updatedata['contact'] = $scope.ldProfilectrl.contact;
        // }
        // if ($scope.ldProfilectrl.address === undefined || $scope.ldProfilectrl.address === "") {
        //   vm.address = '';
        //   updatedata['address'] = '';
        // } else {
        //   updatedata['address'] = $scope.ldProfilectrl.address;
        // }
        // if ($scope.ldProfilectrl.email === undefined || $scope.ldProfilectrl.email === "") {
        //   vm.email = '';
        //   updatedata['email'] = '';
        // } else {
        //   updatedata['email'] = $scope.ldProfilectrl.email;
        // }
        // if ($scope.ldProfilectrl.companyname === undefined || $scope.ldProfilectrl.companyname === "") {
        //   vm.companyname = '';
        //   updatedata['companyname'] = '';
        // } else {
        //   updatedata['companyname'] = $scope.ldProfilectrl.companyname;
        // }
        //alert(JSON.stringify(updatedata)); return false;

        firebase.database().ref('users/' + landLordID).update(vm.userData).then(function () {
          localStorage.setItem('userData', JSON.stringify(vm.userData));
          vm.opensuccesssweet("Profile Updated successfully!");
        }, function (error) {
          vm.openerrorsweet("Profile Not Updated! Try again!");
          return false;
        });
      };

      //update company image
      $scope.uploadDetailsImages = function (event) {
        var file = event.target.files[0];
        AWS.config.update({
          accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
          secretAccessKey: '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'
        });
        AWS.config.region = 'ca-central-1';

        var bucket = new AWS.S3({
          params: {
            Bucket: 'vcancy-final'
          }
        });
        var filename = moment().format('YYYYMMDDHHmmss') + file.name;
        filename = filename.replace(/\s/g, '');

        if (file.size > 3145728) {
          swal({
            title: "Error!",
            text: 'File size should be 3 MB or less.',
            type: "error",
          });
          return false;
        } else if (file.type.indexOf('image') === -1) {
          swal({
            title: "Error!",
            text: 'Only files are accepted.',
            type: "error",
          });
          return false;
        }

        var params = {
          Key: 'company-logo/' + filename,
          ContentType: file.type,
          Body: file,
          StorageClass: "STANDARD_IA",
          ACL: 'public-read'
        };

        bucket.upload(params).on('httpUploadProgress', function (evt) { })
          .send(function (err, data) {
            if (data && data.Location) {
              $scope.$apply(function () {
                vm.userData.companylogo = data.Location;
              });
              firebase.database().ref('users/' + landLordID).update(vm.userData).then(function () {
                vm.opensuccesssweet("Profile Updated successfully!");
              }, function (error) {

                vm.openerrorsweet("Profile Not Updated! Try again!");
                return false;
              });
            }
          });
      };

      vm.changepasswordSubmit = function (passworduser) {

        $rootScope.invalid = '';
        $rootScope.success = '';
        $rootScope.error = '';
        var oldpassword = localStorage.getItem('password');
        var userEmail = localStorage.getItem('userEmail');
        var ncpassword = passworduser.ncpassword;
        var password = passworduser.password;
        var npassword = passworduser.npassword;
        var landLordID = localStorage.getItem('userID');

        if (password === oldpassword) {

          if (password === ncpassword) {
            vm.openerrorsweet("Your old password and new password must be different");
            return false;
          }

          if (ncpassword === npassword) {

            var user = firebase.auth().currentUser;
            var newPassword = ncpassword;
            user.updatePassword(newPassword).then(function () {
              localStorage.setItem('password', newPassword);
              vm.opensuccesssweet("Your password has been updated!");
              var emailData = '<p>Hello, </p><p>Your password has been changed. If you didn’t change the password then please contact  support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
              // Send Email
              passworduser.npassword = '';
              passworduser.password = '';
              passworduser.ncpassword = '';
              emailSendingService.sendEmailViaNodeMailer(userEmail, 'Password changed', 'changepassword', emailData);



            }).catch(function (error) {
              console.log(error);
              vm.openerrorsweet("your Passwords not updated please try again.");
              return false;
            });


          } else {
            vm.openerrorsweet("Passwords don't match.");
            return false;
          }


        } else {
          vm.openerrorsweet("Passwords don't match with your current password.");
          return false;
        }
      };

      vm.profilestore = function () {
        AWS.config.update({
          accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
          secretAccessKey: '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'
        });
        AWS.config.region = 'ca-central-1';

        var bucket = new AWS.S3({ params: { Bucket: 'vcancy-final' } });
        var fileChooser = document.getElementById('file');
        var file = fileChooser.files[0];
        var filename = moment().format('YYYYMMDDHHmmss') + file.name;
        filename = filename.replace(/\s/g, '');

        if (file.size > 3145728) {
          swal({
            title: "Error!",
            text: 'File size should be 3 MB or less.',
            type: "error",
          });
          return false;
        } else if (!(filename.endsWith('.png'))
          && !(filename.endsWith('.jpg'))
          && !(filename.endsWith('.jpeg'))) {
          swal({
            title: "Error!",
            text: 'Invalid file type.',
            type: "error",
          });
          return false;
        }


        if (file) {
          var params = { Key: 'company-logo/' + filename, ContentType: file.type, Body: file, StorageClass: "STANDARD_IA", ACL: 'public-read' };
          bucket.upload(params).on('httpUploadProgress', function (evt) {
            console.log("Uploaded :: " + parseInt((evt.loaded * 100) / evt.total) + '%');
          }).send(function (err, data) {
            //console.log(data.Location); return false;
            if (data.Location != '') {
              var landLordID = localStorage.getItem('userID');
              var user = firebase.auth().currentUser;
              if (user) {
                firebase.database().ref('users/' + landLordID).update({ 'companylogo': data.Location }).then(function () {


                  vm.opensuccesssweet("Your Company Logo Picture updated successfully.");
                }, function (error) {
                  vm.openerrorsweet("Company Logo Not Added! Try again!");
                  return false;
                });
              }
            }

          });
        } else {
          swal({
            title: "Error!",
            text: "File Type is Invalid.",
            type: "error",
          });
          return false;
        }
      };

      vm.newuserSubmit = function (newuser) {
        var landLordID = localStorage.getItem('userID');
        var firstname = newuser.firstname;
        var lastname = newuser.lastname;
        var email = newuser.email;
        // var custome = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        var reguserdbObj = firebase.database();
        var random = parseInt(Math.random() * 10000);
        var characterArray = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var pass = '';
        for (var i = 0; i < 6; i++) {
          var num = Math.floor((Math.random() * 60) + 1);
          pass += characterArray[num];
        }
        //console.log(pass);
        var usertype = 2;

        // var userarray = {
        //   firstname: firstname,
        //   lastname: lastname,
        //   refId: refId,
        //   email: email
        // };
        var reguserObj = $firebaseAuth();
        reguserObj.$createUserWithEmailAndPassword(email, pass)
          .then(function (firebaseUser) {
            var reguserdbObj = firebase.database();
            reguserdbObj.ref('users/' + firebaseUser.uid).set({
              firstname: firstname,
              lastname: lastname,
              usertype: usertype,
              refId: landLordID,
              email: email,
              isadded: 1,
              iscancelshow: 1,
              iscreditcheck: 1,
              iscriminalreport: 1,
              isexpiresoon: 1,
              ispropertydelete: 1,
              isrentalsubmit: 1,
              isshowingtime: 1,
              companyname: ""
            });
            vm.opensuccesssweet("User Added successfully!");

            firebase.auth().signInWithEmailAndPassword(email, pass)
              .then(function (firebaseUser) {

                var emailData = '<p>Hello, </p><p>A new user,' + firstname + ' ,has been added to on https://vcancy.ca/ .</p><p>Your email is ' + email + '.</p><p>Your password : <strong>' + pass + '</strong></p><p>If you have any questions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

                // Send Email
                emailSendingService.sendEmailViaNodeMailer(email, 'A new user account has been added to your portal', 'Welcome', emailData);
                // Success 
                firebaseUser.sendEmailVerification().then(function () {

                  var emailData = '<p>Hello, </p><p>A new user,' + firstname + ' ,has been added to your portal.</p><p>An account confirmation email has been sent to the user at ' + email + '.</p><p>To view/edit user details, please log in https://vcancy.ca/ and go to “Profile” and click on “Users”</p><p>If you have any questions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

                  // Send Email
                  emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'A new user account has been added to your portal', 'Welcome', emailData);

                  console.log("Email Sent");
                  $rootScope.success = 'Confirmation email resent';
                  $rootScope.error = '';
                  setTimeout(function () { $rootScope.success = '' }, 1000);
                }).catch(function (error) {
                  console.log("Error in sending email" + error);
                });
              })
          }).catch(function (error) {
            //console.log(error);
            if (error.message) {
              if (error.message == "The email address is badly formatted.") {
                $rootScope.error = "Invalid Email.";
                $rootScope.success = '';
              } else {
                $rootScope.error = error.message;
                setTimeout(function () { $rootScope.error = '' }, 1000);
                $rootScope.success = '';
              }
              //$rootScope.error = error.message;

            }

            if (error.code === "auth/invalid-email") {
              $rootScope.invalid = 'regemail';
            } else if (error.code === "auth/weak-password") {
              $rootScope.invalid = 'regpwd';
            } else {
              $rootScope.invalid = '';
            }
          });

        // reguserdbObj.ref('employee/' + custome).set(userarray, function (error) {
        //   if (error != null) {

        //     vm.openerrorsweet("User Not added Please Try again.");
        //     return false;
        //   } else {
        //     vm.opensuccesssweet("User Added successfully!");
        //   }
        // });


      };

      vm.deleteCompanyUsers = function (val) {
        swal({
          title: "Are you sure?",
          text: "Your will not be able to recover this user again!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          closeOnConfirm: false
        },
          function (isConfirm) {
            if (isConfirm) {
              var propertyObj = $firebaseAuth();
              var propdbObj = firebase.database();
              propdbObj.ref('users/' + val).set({
                isDeleted: true,
              })
                .then(function () {
                  var indexOfDeletedUser = vm.companyUsers.find(function (user) {
                    if (user.key === val) return true;
                  });
                  vm.companyUsers.splice(indexOfDeletedUser, 1);
                  swal({
                    title: "Success!",
                    text: "User has been deleted.",
                    type: "success",
                    confirmButtonColor: '#009999',
                    confirmButtonText: "Ok"
                  });
                  $state.reload();
                });
            }
          });
      };

      vm.upload = function (file, filename) {
        file = file.replace("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,", "");
        file = file.replace("data:application/pdf;base64,", "");
        file = file.replace(/^data:image\/\w+;base64,/, "");
        file = file.replace("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,", "");
        //console.log(file,filename);

        var req = {
          method: 'POST',
          url: config.sailsBaseUrl + 'fileupload/upload',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Headers": "Content-Type,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
          },
          data: {
            file: file,
            filename: filename
          }
        }

        $http(req).then(function successCallback(response) {
          console.log(response);
          console.log("Done");
          return true;
        }, function errorCallback(response) {
          console.log("Fail");
          return false;
        });
      };

      vm.notificationSubmit = function (notificationuser) {
        //    console.log(notificationuser);
        // if (notificationuser != undefined) {
        //     var notification = {};

        //     if( notificationuser.isadded != undefined){
        //       notification['isadded'] = notificationuser.isadded;
        //     }else{
        //       notification['isadded'] = 0;
        //     }


        //     if(notificationuser.isshowingtime != undefined){
        //       notification['isshowingtime'] = notificationuser.isshowingtime;
        //     }else{
        //       notification['isshowingtime'] = 0;
        //     }


        //     if(notificationuser.isrentalsubmit != undefined){
        //       notification['isrentalsubmit'] = notificationuser.isrentalsubmit;
        //     }else{
        //       notification['isrentalsubmit'] = 0;
        //     }



        //     if(notificationuser.iscancelshow != undefined){
        //       notification['iscancelshow'] = notificationuser.iscancelshow;
        //     }else{
        //       notification['iscancelshow'] = 0;
        //     }


        //     if(notificationuser.iscreditcheck != undefined){
        //       notification['iscreditcheck'] = notificationuser.iscreditcheck;
        //     }else{
        //       notification['iscreditcheck'] = 0;
        //     }



        //     if(notificationuser.iscriminalreport != undefined){
        //       notification['iscriminalreport'] = notificationuser.iscriminalreport;
        //     }else{
        //       notification['iscriminalreport'] = 0;
        //     }


        //     if(notificationuser.isexpiresoon != undefined){
        //       notification['isexpiresoon'] = notificationuser.isexpiresoon;
        //     }else{
        //       notification['isexpiresoon'] = 0;
        //     }



        //     if(notificationuser.ispropertydelete != undefined){
        //       notification['ispropertydelete'] = notificationuser.ispropertydelete;
        //     }else{
        //       notification['ispropertydelete'] = 0;
        //     }

        // if (notification != null) {
        //   var user = firebase.auth().currentUser;
        //   if (user) {
        //     firebase.database().ref('users/' + landLordID).update(notification).then(function () {
        //       vm.opensuccesssweet("Your notification updated successfully!");
        //     }, function (error) {
        //       vm.openerrorsweet("May Be your session is expire please login again.");
        //       return false;
        //     });
        //   } else {
        //     vm.openerrorsweet("May Be your session is expire please login again.");
        //     return false;
        //   }
        // } else {

        //   vm.openerrorsweet("Please Select Atleast one option.");
        //   return false;
        // }

        // } else {
        //   vm.openerrorsweet("Please Select Atleast one option.");
        //   return false;
        // }
        var landLordID = localStorage.getItem('userID');
        var user = firebase.auth().currentUser;
        if (user) {
          firebase.database().ref('users/' + landLordID).update(vm.userData).then(function () {
            vm.opensuccesssweet("Your notification updated successfully!");
          }, function (error) {
            vm.openerrorsweet("May Be your session is expire please login again.");
            return false;
          });
        } else {
          vm.openerrorsweet("May Be your session is expire please login again.");
          return false;
        }

      };

      $scope.items = ['item1', 'item2', 'item3'];

      $scope.open = function (size) {

        var modalInstance = $uibModal.open({
          templateUrl: 'myModalContent.html',
          controller: 'ModalInstanceCtrl',
          size: size,

        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
        });
      };

      vm.opensuccesssweet = function (value) {
        swal({
          title: "Success!",
          text: value,
          type: "success",
          confirmButtonColor: '#009999',
          confirmButtonText: "Ok"
        }, function (isConfirm) {
          if (isConfirm) {
            // $state.reload();
          }
        });
      };

      vm.openerrorsweet = function (value) {
        swal({
          title: "Error",
          text: value,
          type: "warning",
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Ok",
          closeOnConfirm: true
        },
          function () {
            return false;
          });

      };

      /* LWS start */

      vm.moveToBillingInfo = function () {
        if (vm.billingRequired = true) {
          // switch tab and allow to pay
          vm.billingtab = 2;
        }
        else {
          // no billing required
          vm.openerrorsweet("No payment needed.");
        }
      };

      vm.selectCCard = function (card) {
        console.log(card);
        vm.selectedCard.name = card.name;
        vm.selectedCard.cardnumber = parseInt(card.cardnumber);
        vm.selectedCard.cvv = '';
        vm.selectedCard.expiry = card.expiryMonth + "/" + card.expiryYear;
        vm.selectedCard.expiryMonth = card.expiryMonth;
        vm.selectedCard.expiryYear = card.expiryYear;
      };

      vm.removeCard = function (selectedCard) {
        var cards = vm.cards;
        vm.cards = cards.filter(card => card.cardnumber != selectedCard.cardnumber);
        var cardData = { cards: JSON.stringify(vm.cards) };
        firebase.database().ref('users/' + landLordID + "/").update(cardData).then(function () {
          vm.opensuccesssweet("Card Deleted successfully!");
          vm.selectedCard = {
            cardnumber: '',
            cvv: "",
            expiry: "",
            expiryMonth: "",
            expiryYear: "",
            id: "",
            last4: "",
            name: ""
          };
        }, function (error) {
          vm.openerrorsweet("Unable to delete card! Try again!");
          return false;
        });
      };

      vm.addNewCard = function () {
        // add new card in database
        var findCard = vm.cards.find(card => card.cardnumber == vm.newcard.cardnumber);
        if (findCard) {
          vm.openerrorsweet('Card with number: ' + vm.newcard.cardnumber + ' already exists.');
        } else {
          var cardToBeAdded = {
            id: vm.newcard.name + vm.newcard.cardnumber,
            name: vm.newcard.name,
            cardnumber: vm.newcard.cardnumber.toString(),
            cvv: vm.newcard.cvv.toString(),
            expiryMonth: vm.newcard.expiryMonth,
            expiryYear: vm.newcard.expiryYear,
            last4: vm.newcard.cardnumber.toString().slice(-4),
          };
          vm.cards.push(cardToBeAdded);
          vm.selectCCard(cardToBeAdded);
          vm.newcard = {
            name: "",
            cardnumber: "",
            cvv: "",
            expiryMonth: "",
            expiryYear: "",
            last4: ''
          };
          console.log(vm.setasdefault);
          console.log(JSON.stringify(cardToBeAdded));
          if (vm.setasdefault) {
            var cardData = { cards: JSON.stringify(vm.cards), defaultCard: JSON.stringify(cardToBeAdded) };
            firebase.database().ref('users/' + landLordID + "/").update(cardData).then(function () {
              vm.opensuccesssweet("Card Added successfully!");
              vm.defaultCard = cardToBeAdded;
            }, function (error) {
              vm.openerrorsweet("Unable to add card! Try again!");
              return false;
            });
          } else {
            var cardData = { cards: JSON.stringify(vm.cards) };
            firebase.database().ref('users/' + landLordID + "/").update(cardData).then(function () {
              vm.opensuccesssweet("Card Added successfully!");
            }, function (error) {
              vm.openerrorsweet("Unable to add card! Try again!");
              return false;
            });
          }
        }
      };

      vm.cardTypeDetect = function (cardnumber) {
        var cardno = cardnumber;
        vm.newcard.type = Stripe.card.cardType(cardno);
      };

      vm.cardnoHandler = function (cardnumber) {
        var cardno = cardnumber;
        if (Stripe.card.validateCardNumber(cardno)) {
        } else {
          swal({
            title: "Warning!",
            text: "Please enter a valid card no.",
            type: "warning",
            confirmButtonColor: '#009999',
            confirmButtonText: "Ok",
            showCancelButton: false,
            closeOnClickOutside: false,
            allowEscapeKey: true
          }, function (isConfirm) {
            if (isConfirm) {
              console.log("Plan changes beign done");
            } else {
              console.log("No changes needed");
            }
          });
        }
      };

      vm.cardexpiryHandler = function (month, year) {
        var expiryMonth = month;
        var expiryYear = year;
        if (expiryMonth != '' && expiryYear != '') {
          if (Stripe.card.validateExpiry(expiryMonth, expiryYear))
          { } else {
            swal({
              title: "Warning!",
              text: "Please select correct expiry date.",
              type: "warning",
              confirmButtonColor: '#009999',
              confirmButtonText: "Ok",
              showCancelButton: false,
              closeOnClickOutside: false,
              allowEscapeKey: true
            }, function (isConfirm) {
              if (isConfirm) {
                console.log("Plan changes beign done");
              } else {
                console.log("No changes needed");
              }
            });
          }
        }
      };

      vm.cardcvcHandler = function (cvc) {
        var cvc = cvc;
        if (Stripe.card.validateCVC(cvc))
        { } else {
          swal({
            title: "Warning!",
            text: "Please enter correct cvv code.",
            type: "warning",
            confirmButtonColor: '#009999',
            confirmButtonText: "Ok",
            showCancelButton: false,
            closeOnClickOutside: false,
            allowEscapeKey: true
          }, function (isConfirm) {
            if (isConfirm) {
              console.log("Plan changes beign done");
            } else {
              console.log("No changes needed");
            }
          });
        }
      };

      vm.downloadInvoice = function (data) {
        //console.log(data);
        vm.invoice.username = data.firstname + " " + data.lastname;
        vm.invoice.date = moment(data.date).format("MMMM DD, YYYY HH:mm A");
        vm.invoice.id = data.id;
        vm.invoice.amount = data.amount;
        vm.invoice.tax = data.tax;
        vm.invoice.paymethod = data.payMethod;
        vm.invoice.subscription = data.plan;
        vm.invoice.data = data;
        $('#invoice').show(1, function () {
          var pdf = new jsPDF('p', 'pt', 'letter');
          pdf.addHTML($('#invoice')[0], function () {
            pdf.save('Test.pdf');
            $('#invoice').hide(1);
          });
        });
      };

      // make payment from selected card
      vm.makePaymentFromSelectedCard = function () {
        console.log(vm.selectedCard);
        var expiryMonth, expiryYear;
        if (vm.selectedCard) {
          expiryMonth = vm.selectedCard.expiryMonth;
          expiryYear = vm.selectedCard.expiryYear;
        } else {
          expiryMonth = vm.selectedCard.expiry.slice(0, vm.selectedCard.expiry.indexOf("/"));
          expiryYear = vm.selectedCard.expiry.slice(vm.selectedCard.expiry.indexOf("/") + 1);
        }
        swal({
          title: "Warning!",
          text: "Are you sure to pay using card [" + vm.selectedCard.cardnumber + "].",
          type: "warning",
          confirmButtonColor: '#009999',
          confirmButtonText: "Ok",
          showCancelButton: false,
          closeOnClickOutside: false,
          allowEscapeKey: true
        }, function (isConfirm) {
          if (isConfirm) {
            // user choses to pay
            var req = {
              method: 'POST',
              url: 'http://localhost:1337/api/v1/stipecharge',
              // url: config.sailsBaseUrl + 'email/sendemail',
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Headers": "Content-Type,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
              },
              data: {
                user: vm.userData,
                amount: vm.amountTobePayed,
                desciption: 'Units payment from landlord ' + localStorage.userEmail,
                cardno: vm.selectedCard.cardnumber,
                expiryMonth: expiryMonth,
                expiryYear: expiryYear,
                cvc: vm.selectedCard.cvv
              }
            };
            // console.log("req", req);
            $http(req).then(function (response) {
              var data = response.data;
              console.log(data);
              if (data.err) {
                // show error regarding transaction
                swal({
                  title: "Error!",
                  text: response.data.err.message,
                  type: "error",
                  confirmButtonColor: '#009999',
                  confirmButtonText: "Ok",
                  showCancelButton: false,
                  closeOnClickOutside: true,
                  allowEscapeKey: true
                }, function (isConfirm) {
                  // do nothing
                });
              }
              // handle charge response
              if (response.data.charge) {
                // save card in db
                if (vm.savecardforFuture == true) {
                  var cardToBeAdded = {
                    id: vm.defaultCard.name + vm.defaultCard.cardnumber,
                    name: vm.defaultCard.name,
                    cardnumber: vm.defaultCard.cardnumber.toString(),
                    cvv: vm.defaultCard.cvv.toString(),
                    expiryMonth: vm.defaultCard.expiryMonth,
                    expiryYear: vm.defaultCard.expiryYear,
                    last4: vm.defaultCard.cardnumber.toString().slice(-4),
                  };
                  vm.cards.push(cardToBeAdded);
                  var cardData = { cards: JSON.stringify(vm.cards) };
                  firebase.database().ref('users/' + landLordID + "/").update(cardData).then(function () {
                    vm.opensuccesssweet("Card saved successfully!");
                    if (vm.setasdefault == true) {
                      var defaultCard = { defaultCard: JSON.stringify(cardToBeAdded) };
                      firebase.database().ref('users/' + landLordID + "/").update(defaultCard).then(function () {
                      }, function (error) {
                        return false;
                      });
                    }
                  }, function (error) {
                    vm.openerrorsweet("Unable to save card! Try again!");
                    return false;
                  });
                }
                var charge = response.data.charge;
                console.log(charge);
                var cdate = new Date();
                var upgradeOrRenew = JSON.stringify({
                  start: vm.nextBillingCycleStartDate,
                  end: vm.nextBillingCycleEndDate,
                  units: vm.unitsBillable,
                  unitsTotal: vm.unitsProvidedToUser,
                  plan: vm.currentPlan
                });
                var transaction = {
                  date: cdate,
                  amount: '$' + vm.amountTobePayed,
                  tax: '$' + vm.usertaxes,
                  id: Date.parse(cdate),
                  plan: vm.currentPlan,
                  payMethod: 'Credit/Debit Card',
                  firstname: vm.userData.firstname,
                  lastname: vm.userData.lastname,
                  email: vm.userData.email,
                  unitsTotal: vm.unitsProvidedToUser,
                  unitsChange: vm.unitsBillable,
                  status: "Success",
                  stripeResponse: JSON.stringify(charge)
                };
                vm.userBillingHistory.push(transaction);
                var billinginfo = angular.copy(vm.userBillingHistory);
                // update database 
                var updateUser = firebase.database().ref('users/' + landLordID + '/').update({
                  currentPlan: vm.currentPlan,
                  unitsProvidedToUser: vm.unitsProvidedToUser,
                  unitsAllowed: vm.unitsProvidedToUser,
                  billingHistory: billinginfo,
                  nextBillingDate: vm.nextBillingCycleStartDate,
                  newPaymentApplyFrom: vm.nextBillingCycleStartDate,
                  currentPlanInfo: upgradeOrRenew,
                }).then(function () {
                  swal({
                    title: "Success!",
                    text: "Transaction completed successfully.",
                    type: "success",
                    confirmButtonColor: '#009999',
                    confirmButtonText: "Ok"
                  }, function (isConfirm) {
                    if (isConfirm) {
                      $state.reload();
                    }
                  });
                });
              }
            }).catch(function (err) {
              console.log(err)
            });
          }
          else {
            // do nothing as user cancelled for payment
          }
        });
      } // make payment from selected card end

      // make payment from popup
      vm.makePaymentFromPopUp = function () {
        if (Stripe.card.validateCardNumber(vm.defaultCard.cardnumber) && Stripe.card.validateCVC(vm.defaultCard.cvv) && Stripe.card.validateExpiry(vm.defaultCard.expiryMonth, vm.defaultCard.expiryYear)) {
          // make payment
          swal({
            title: "Warning!",
            text: "Are you sure to pay using card [" + vm.defaultCard.cardnumber + "].",
            type: "warning",
            confirmButtonColor: '#009999',
            confirmButtonText: "Ok",
            showCancelButton: false,
            closeOnClickOutside: false,
            allowEscapeKey: true
          }, function (isConfirm) {
            if (isConfirm) {
              // user choses to pay
              var req = {
                method: 'POST',
                url: 'http://localhost:1337/api/v1/stipecharge',
                // url: config.sailsBaseUrl + 'email/sendemail',
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                  "Access-Control-Allow-Headers": "Content-Type,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
                },
                data: {
                  user: vm.userData,
                  amount: vm.amountTobePayed,
                  desciption: 'Units payment from landlord ' + localStorage.userEmail,
                  cardno: vm.defaultCard.cardnumber,
                  expiryMonth: vm.defaultCard.expiryMonth,
                  expiryYear: vm.defaultCard.expiryYear,
                  cvc: vm.defaultCard.cvv
                }
              };
              // console.log("req", req);
              $http(req).then(function (response) {
                var data = response.data;
                console.log(data);
                if (data.err) {
                  // show error regarding transaction
                  swal({
                    title: "Error!",
                    text: response.data.err.message,
                    type: "error",
                    confirmButtonColor: '#009999',
                    confirmButtonText: "Ok",
                    showCancelButton: false,
                    closeOnClickOutside: true,
                    allowEscapeKey: true
                  }, function (isConfirm) {
                    // do nothing
                  });
                }
                // handle charge response
                if (response.data.charge) {
                  // save card in db
                  if (vm.savecardforFuture == true) {
                    var cardToBeAdded = {
                      id: vm.defaultCard.name + vm.defaultCard.cardnumber,
                      name: vm.defaultCard.name,
                      cardnumber: vm.defaultCard.cardnumber.toString(),
                      cvv: vm.defaultCard.cvv.toString(),
                      expiryMonth: vm.defaultCard.expiryMonth,
                      expiryYear: vm.defaultCard.expiryYear,
                      last4: vm.defaultCard.cardnumber.toString().slice(-4),
                    };
                    vm.cards.push(cardToBeAdded);
                    var cardData = { cards: JSON.stringify(vm.cards) };
                    firebase.database().ref('users/' + landLordID + "/").update(cardData).then(function () {
                      vm.opensuccesssweet("Card saved successfully!");
                      if (vm.setasdefault == true) {
                        var defaultCard = { defaultCard: JSON.stringify(cardToBeAdded) };
                        firebase.database().ref('users/' + landLordID + "/").update(defaultCard).then(function () {
                        }, function (error) {
                          return false;
                        });
                      }
                    }, function (error) {
                      vm.openerrorsweet("Unable to save card! Try again!");
                      return false;
                    });
                  }
                  var charge = response.data.charge;
                  console.log(charge);
                  var cdate = new Date();
                  var upgradeOrRenew = JSON.stringify({
                    start: vm.nextBillingCycleStartDate,
                    end: vm.nextBillingCycleEndDate,
                    units: vm.unitsBillable,
                    unitsTotal: vm.unitsProvidedToUser,
                    plan: vm.currentPlan
                  });
                  var transaction = {
                    date: cdate,
                    amount: '$' + vm.amountTobePayed,
                    tax: '$' + vm.usertaxes,
                    id: Date.parse(cdate),
                    plan: vm.currentPlan,
                    payMethod: 'Credit/Debit Card',
                    firstname: vm.userData.firstname,
                    lastname: vm.userData.lastname,
                    email: vm.userData.email,
                    unitsTotal: vm.unitsProvidedToUser,
                    unitsChange: vm.unitsBillable,
                    status: "Success",
                    stripeResponse: JSON.stringify(charge)
                  };
                  vm.userBillingHistory.push(transaction);
                  var billinginfo = angular.copy(vm.userBillingHistory);
                  // update database 
                  var updateUser = firebase.database().ref('users/' + landLordID + '/').update({
                    currentPlan: vm.currentPlan,
                    unitsProvidedToUser: vm.unitsProvidedToUser,
                    unitsAllowed: vm.unitsProvidedToUser,
                    billingHistory: billinginfo,
                    nextBillingDate: vm.nextBillingCycleStartDate,
                    newPaymentApplyFrom: vm.nextBillingCycleEndDate,
                    currentPlanInfo: upgradeOrRenew,
                  }).then(function () {
                    swal({
                      title: "Success!",
                      text: "Transaction completed successfully.",
                      type: "success",
                      confirmButtonColor: '#009999',
                      confirmButtonText: "Ok"
                    }, function (isConfirm) {
                      if (isConfirm) {
                        $state.reload();
                      }
                    });
                  });
                }
              }).catch(function (err) {
                console.log(err)
              });
            }
            else {
              // do nothing as user cancelled for payment
            }

          });
        }
        else {
          // show error
          swal({
            title: "Warning!",
            text: "Please Fill all necessary fields.",
            type: "warning",
            confirmButtonColor: '#009999',
            confirmButtonText: "Ok",
            showCancelButton: false,
            closeOnClickOutside: false,
            allowEscapeKey: true
          }, function (isConfirm) {
          });
        }
      }

      // calculate next cycle date
      vm.calculateNextCycleDate = function () {
        var currentPlan = vm.currentPlan, oldPlan = vm.userData.currentPlan, oldPlanInfo = vm.userData.currentPlanInfo;
        var startdate = '', enddate = '';

        // check if user have a plan
        if (oldPlanInfo != '' && oldPlanInfo != undefined) {
          var userOldPlanInfo = JSON.parse(oldPlanInfo);
          if (Date.parse(oldPlanInfo.end) < Date.now()) {
            console.log("Plan subscription is expired.");
            // check for different plan
            if (currentPlan != oldPlan) {
              console.log("Diffrent Plan selected");
              // check for expiry of old plan
              if (Date.parse(userOldPlanInfo.end) < Date.now()) {
                console.log("Plan subscription is expired.");
                if (currentPlan == "Free") {
                  startdate = new moment().toDate();
                  enddate = new moment().add(15, 'day').toDate();
                } else if (currentPlan == "Monthly") {
                  startdate = new moment().toDate();
                  enddate = new moment().add(30, 'day').toDate();
                }
                else if (currentPlan == "Annual") {
                  startdate = new moment().toDate();
                  enddate = new moment().add(365, 'day').toDate();
                } else {
                }
              }
              else {
                console.log("Plan subscription is still valid.");
                // calculat next cycle date after current plan
                var oldPlanEndDate = userOldPlanInfo.end;
                if (currentPlan == "Free") {
                  startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                  enddate = new moment(startdate).add(15, 'day').toDate();
                } else if (currentPlan == "Monthly") {
                  startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                  enddate = new moment(startdate).add(30, 'day').toDate();
                }
                else if (currentPlan == "Annual") {
                  startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                  enddate = new moment(startdate).add(365, 'day').toDate();
                } else {
                }
              }
            }
            else {
              // same plan selected as old
              if (Date.parse(oldPlanInfo.end) < Date.now()) {
                console.log("Plan subscription is expired.");
                if (currentPlan == "Free") {
                  startdate = new moment().toDate();
                  enddate = new moment().add(15, 'day').toDate();
                } else if (currentPlan == "Monthly") {
                  startdate = new moment().toDate();
                  enddate = new moment().add(30, 'day').toDate();
                }
                else if (currentPlan == "Annual") {
                  startdate = new moment().toDate();
                  enddate = new moment().add(365, 'day').toDate();
                } else {
                }
              }
              else {
                console.log("Plan subscription is still valid.");
                // calculat next cycle date after current plan
                var oldPlanEndDate = oldPlanInfo.end;
                if (currentPlan == "Free") {
                  startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                  enddate = new moment(startdate).add(15, 'day').toDate();
                } else if (currentPlan == "Monthly") {
                  startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                  enddate = new moment(startdate).add(30, 'day').toDate();
                }
                else if (currentPlan == "Annual") {
                  startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                  enddate = new moment(startdate).add(365, 'day').toDate();
                } else {
                }
              }
            } // end same plan else
          } else {
            var oldPlanEndDate = JSON.parse(oldPlanInfo).end;
            if (currentPlan == "Free") {
              startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
              enddate = new moment(startdate).add(15, 'day').toDate();
            } else if (currentPlan == "Monthly") {
              startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
              enddate = new moment(startdate).add(30, 'day').toDate();
            }
            else if (currentPlan == "Annual") {
              startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
              enddate = new moment(startdate).add(365, 'day').toDate();
            } else {
            }
          }
        }
        else {
          console.log("User have no plan subscribed.");
          vm.currentPlan = "Free";
          vm.unitsProvidedToUser = vm.unitsFree;
          console.log("Free plan selected, Check for expiry.")
          if (currentPlan == "Free") {
            startdate = new moment().toDate();
            enddate = new moment().add(15, 'day').toDate();
          } else if (currentPlan == "Monthly") {
            startdate = new moment().toDate();
            enddate = new moment().add(30, 'day').toDate();
          }
          else if (currentPlan == "Annual") {
            startdate = new moment().toDate();
            enddate = new moment().add(365, 'day').toDate();
          } else {
          }
        }
        vm.nextBillingCycleStartDate = startdate;
        vm.nextBillingCycleEndDate = enddate;
      };

      vm.selecctDefaultCard = function () {
        vm.selectedCard = {
          cardnumber: vm.defaultCard.cardnumber,
          cvv: "",
          expiry: vm.defaultCard.expiryMonth + '/' + vm.defaultCard.expiryYear,
          expiryMonth: vm.defaultCard.expiryMonth,
          expiryYear: vm.defaultCard.expiryYear,
          id: "",
          last4: "",
          name: vm.defaultCard.name
        };
      };
      $scope.$broadcast('reCalcViewDimensions');
      $scope.$broadcast('rzSliderForceRender');

      vm.updatePayableAmount = function () {
        vm.calculateNextCycleDate();
        // next plan changes dates to be calculated.
        var billableUnits = 0,
          estimatedCharge = 0,
          pricePerUnit = vm.pricePerUnit,
          freeUnits = vm.userData.freeUnitsAlloted,
          discount = 0,
          totalAfterDiscount = 0,
          taxTodeduct = 0,
          totalDue = 0,
          unitsAddedDeleted = 0,
          unitsAlreadyPaidFor = vm.unitsAlreadyAdded,
          unitsSelected = vm.unitsProvidedToUser,
          date = '',
          oldPlan = vm.userData.currentPlan;

        if (vm.currentPlan != vm.subscriptionOldPlan) {
          // plan change
          var oldPlanInfo = JSON.parse(vm.userData.currentPlanInfo);
          console.log("Another plan selected");
          // check if old plan is expired
          if (Date.parse(oldPlanInfo.end) < Date.now()) {
            console.log("Plan expired. Pay for all units selected.");
            // like monthly to annual
            if (vm.currentPlan == "Annual" && vm.subscriptionOldPlan == "Monthly") {
              console.log("Upgrade from monthly o annual. Billing cyckle will be next month first day.");
              console.log("Pay for selected units annually");
              vm.billingRequired = true;
              vm.discountRequired = true;
              billableUnits = vm.unitsProvidedToUser - freeUnits;
              vm.unitsBillable = parseInt(billableUnits);
              estimatedCharge = billableUnits * vm.pricePerUnit * 12;
              discount = estimatedCharge * 0.1;
              vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
              vm.discountAmount = parseFloat(discount.toFixed(2));
              totalAfterDiscount = vm.totalEstimatedCharges - vm.discountAmount;
              vm.totalAfterDiscount = parseFloat(totalAfterDiscount.toFixed(2));
              taxTodeduct = vm.totalAfterDiscount * vm.taxes / 100;
              vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
              payableAmount = vm.totalAfterDiscount + vm.usertaxes;
              vm.amountTobePayed = parseFloat(payableAmount.toFixed(2));
            }
            // free to Annual
            if (vm.currentPlan == "Annual" && vm.subscriptionOldPlan == "Free") {
              console.log("Upgrade from free to annual. Billing cyckle will be next month first day.");
              // Billing cycle date will be next month first day
              console.log("Pay for selected units annually");
              vm.billingRequired = true;
              vm.discountRequired = true;
              billableUnits = vm.unitsProvidedToUser - freeUnits;
              vm.unitsBillable = parseInt(billableUnits);
              estimatedCharge = billableUnits * vm.pricePerUnit * 12;
              discount = estimatedCharge * 0.1;
              vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
              vm.discountAmount = parseFloat(discount.toFixed(2));
              totalAfterDiscount = vm.totalEstimatedCharges - vm.discountAmount;
              vm.totalAfterDiscount = parseFloat(totalAfterDiscount.toFixed(2));
              taxTodeduct = vm.totalAfterDiscount * vm.taxes / 100;
              vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
              payableAmount = vm.totalAfterDiscount + vm.usertaxes;
              vm.amountTobePayed = parseFloat(payableAmount.toFixed(2));
            }
            // free to Monthly
            if (vm.currentPlan == "Monthly" && vm.subscriptionOldPlan == "Free") {
              console.log("Upgrade from free to monthly. Billing cyckle will be next month first day.");
              console.log("Pay for selected units for month");
              // Billing cycle date will be next month first day
              vm.billingRequired = true;
              vm.discountRequired = false;
              billableUnits = vm.unitsProvidedToUser - freeUnits;
              vm.unitsBillable = parseInt(billableUnits);
              estimatedCharge = billableUnits * vm.pricePerUnit;
              discount = 0;
              vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
              vm.discountAmount = 0;
              totalAfterDiscount = vm.totalEstimatedCharges - vm.discountAmount;
              vm.totalAfterDiscount = parseFloat(totalAfterDiscount.toFixed(2));
              taxTodeduct = vm.totalAfterDiscount * vm.taxes / 100;
              vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
              payableAmount = vm.totalAfterDiscount + vm.usertaxes;
              vm.amountTobePayed = parseFloat(payableAmount.toFixed(2));
            }
            // free to Monthly
            if (vm.currentPlan == "Monthly" && vm.subscriptionOldPlan == "Annual") {
              console.log("Upgrade from annual to monthly. Billing cyckle will be next month first day.");
              console.log("Pay for selected units");
              // Billing cycle date will be next month first day
              vm.billingRequired = true;
              vm.discountRequired = false;
              billableUnits = vm.unitsProvidedToUser - freeUnits;
              vm.unitsBillable = parseInt(billableUnits);
              estimatedCharge = billableUnits * vm.pricePerUnit;
              discount = 0;
              vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
              vm.discountAmount = 0;
              totalAfterDiscount = vm.totalEstimatedCharges - vm.discountAmount;
              vm.totalAfterDiscount = parseFloat(totalAfterDiscount.toFixed(2));
              taxTodeduct = vm.totalAfterDiscount * vm.taxes / 100;
              vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
              vm.amountTobePayed = vm.totalAfterDiscount + vm.usertaxes;
            }
            if (vm.currentPlan == "Free" && vm.subscriptionOldPlan == "Annual") {
              console.log("Plan chaged from Annual to Free");
              swal({
                title: "Warning!",
                text: 'Are you sure you want to change your subscription to Free. You will not be able to use more than free units.',
                type: "warning",
                showCancelButton: true,
              }, function (isConfirm) {
                if (isConfirm) {
                  vm.billingRequired = false;
                  vm.discountRequired = false;
                  vm.unitsBillable = 0;
                  vm.discountAmount = 0;
                  vm.totalEstimatedCharges = 0;
                  vm.totalAfterDiscount = 0;
                  vm.usertaxes = 0;
                  vm.amountTobePayed = 0;
                } else { }
              });
            }
            if (vm.currentPlan == "Free" && vm.subscriptionOldPlan == "Monthly") {
              console.log("Plan chaged from Monthly to Free");
              swal({
                title: "Warning!",
                text: 'Are you sure you want to change your subscription to Free. You will not be able to use more than free units.',
                type: "warning",
                showCancelButton: true,
              }, function (isConfirm) {
                if (isConfirm) {
                  vm.billingRequired = false;
                  vm.discountRequired = false;
                  vm.unitsBillable = 0;
                  vm.discountAmount = 0;
                  vm.totalEstimatedCharges = 0;
                  vm.totalAfterDiscount = 0;
                  vm.usertaxes = 0;
                  vm.amountTobePayed = 0;
                } else { }
              });
            }

          } else {
            console.log("Plan is valid");
            if (vm.currentPlan == "Annual" && vm.subscriptionOldPlan == "Monthly") {
              console.log("Upgrade from monthly to annual. Billing cycle will be next month first day.");
              if (unitsSelected > unitsAlreadyPaidFor) {
                // More units added, Add units and update billing cycle from future
                console.log("Pay for all units and update plan from month to annual.");
                // pay for all units except free units
                vm.billingRequired = true;
                vm.discountRequired = true;
                billableUnits = vm.unitsProvidedToUser - freeUnits;
                vm.unitsBillable = parseInt(billableUnits);
                estimatedCharge = billableUnits * vm.pricePerUnit * 12;
                discount = estimatedCharge * 0.1;
                vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
                vm.discountAmount = parseFloat(discount.toFixed(2));
                totalAfterDiscount = vm.totalEstimatedCharges - vm.discountAmount;
                vm.totalAfterDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                taxTodeduct = vm.totalAfterDiscount * vm.taxes / 100;
                vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
                vm.amountTobePayed = vm.totalAfterDiscount + vm.usertaxes;
              }
              else if (unitsSelected == unitsAlreadyPaidFor) {
                console.log("Same no of units. Charge for units annually. Upgrade plan to annually and update added units.");
                vm.billingRequired = true;
                vm.discountRequired = true;
                billableUnits = vm.unitsProvidedToUser - freeUnits;
                vm.unitsBillable = parseInt(billableUnits);
                estimatedCharge = billableUnits * vm.pricePerUnit * 12;
                discount = estimatedCharge * 0.1;
                vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
                vm.discountAmount = parseFloat(discount.toFixed(2));
                totalAfterDiscount = vm.totalEstimatedCharges - vm.discountAmount;
                vm.totalAfterDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                taxTodeduct = vm.totalAfterDiscount * vm.taxes / 100;
                vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
                vm.amountTobePayed = vm.totalAfterDiscount + vm.usertaxes;
              }
              else {
                // units decreased save info indb so stat it can be changes in furure when plan is expired
                console.log("Same plan plan selected and units degraded", "set information for next billing cycle.");
                vm.billingRequired = false;
                vm.discountRequired = false;
                billableUnits = vm.unitsProvidedToUser - freeUnits;
                vm.unitsBillable = parseInt(billableUnits);
                estimatedCharge = 0;
                discount = 0;
                vm.totalEstimatedCharges = 0;
                vm.discountAmount = 0;
                vm.totalAfterDiscount = 0;
                taxTodeduct = 0;
                vm.usertaxes = 0;
                vm.amountTobePayed = 0;
                swal({
                  title: "Are you sure!",
                  text: "Do you really want to decrease number of units for this user?",
                  type: "warning",
                  confirmButtonColor: '#009999',
                  confirmButtonText: "Ok",
                  showCancelButton: true,
                  closeOnClickOutside: false,
                  allowEscapeKey: true
                }, function (isConfirm) {
                  if (isConfirm) {
                    console.log("Degrade in progress");
                    vm.degradeUserPlan(); // apply degrade changes
                  } else {
                    console.log("No changes needed");
                    $scope.$apply(function () {
                      vm.unitsProvidedToUser = vm.userData.unitsProvidedToUser;
                    });
                    // reset units to old already purchased units
                  }
                });
              }
            }
            // free to Annual
            if (vm.currentPlan == "Annual" && vm.subscriptionOldPlan == "Free") {
              console.log("Upgrade from free to annual. Billing cyckle will be after free trial plan expire.");
              // Billing cycle date will be next month first day
              if (unitsSelected > unitsAlreadyPaidFor) {
                // More units added, Add units and update billing cycle from future
                console.log("Pay for all units and update plan from Free to annual.");
                // pay for all units except free units
                vm.billingRequired = true;
                vm.discountRequired = true;
                billableUnits = vm.unitsProvidedToUser - freeUnits;
                vm.unitsBillable = parseInt(billableUnits);
                estimatedCharge = billableUnits * vm.pricePerUnit * 12;
                discount = estimatedCharge * 0.1;
                vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
                vm.discountAmount = parseFloat(discount.toFixed(2));
                totalAfterDiscount = vm.totalEstimatedCharges - vm.discountAmount;
                vm.totalAfterDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                taxTodeduct = vm.totalAfterDiscount * vm.taxes / 100;
                vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
                vm.amountTobePayed = vm.totalAfterDiscount + vm.usertaxes;
              }
              else if (unitsSelected == unitsAlreadyPaidFor) {
                console.log("Same no of units. Charge for units annually. Upgrade plan to annually and update added units.");
                vm.billingRequired = true;
                vm.discountRequired = true;
                billableUnits = vm.unitsProvidedToUser - freeUnits;
                vm.unitsBillable = parseInt(billableUnits);
                estimatedCharge = billableUnits * vm.pricePerUnit * 12;
                discount = estimatedCharge * 0.1;
                vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
                vm.discountAmount = parseFloat(discount.toFixed(2));
                totalAfterDiscount = vm.totalEstimatedCharges - vm.discountAmount;
                vm.totalAfterDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                taxTodeduct = vm.totalAfterDiscount * vm.taxes / 100;
                vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
                vm.amountTobePayed = vm.totalAfterDiscount + vm.usertaxes;
              }
              else {
                // units decreased save info indb so stat it can be changes in furure when plan is expired
                console.log("Same plan plan selected and units degraded", "set information for next billing cycle.");
                vm.billingRequired = false;
                vm.discountRequired = false;
                billableUnits = vm.unitsProvidedToUser - freeUnits;
                vm.unitsBillable = parseInt(billableUnits);
                estimatedCharge = 0;
                discount = 0;
                vm.totalEstimatedCharges = 0;
                vm.discountAmount = 0;
                vm.totalAfterDiscount = 0;
                taxTodeduct = 0;
                vm.usertaxes = 0;
                vm.amountTobePayed = 0;
                swal({
                  title: "Are you sure!",
                  text: "Do you really want to decrease number of units for this user?",
                  type: "warning",
                  confirmButtonColor: '#009999',
                  confirmButtonText: "Ok",
                  showCancelButton: true,
                  closeOnClickOutside: false,
                  allowEscapeKey: true
                }, function (isConfirm) {
                  if (isConfirm) {
                    console.log("Degrade in progress");
                    vm.degradeUserPlan(); // apply degrade changes
                  } else {
                    console.log("No changes needed");
                    $scope.$apply(function () {
                      vm.unitsProvidedToUser = vm.userData.unitsProvidedToUser;
                    });
                    // reset units to old already purchased units
                  }
                });
              }
            }
            // free to Monthly
            if (vm.currentPlan == "Monthly" && vm.subscriptionOldPlan == "Free") {
              console.log("Upgrade from monthly to annual. Billing cyckle will be next month first day.");
              // Billing cycle date will be next month first day
              if (unitsSelected > unitsAlreadyPaidFor) {
                // More units added, Add units and update billing cycle from future
                console.log("Pay for all units and update plan from Free to Monthly.");
                // pay for all units except free units
                vm.billingRequired = true;
                vm.discountRequired = false;
                billableUnits = vm.unitsProvidedToUser - freeUnits;
                vm.unitsBillable = parseInt(billableUnits);
                estimatedCharge = billableUnits * vm.pricePerUnit;
                discount = 0;
                vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
                vm.discountAmount = parseFloat(discount.toFixed(2));
                totalAfterDiscount = vm.totalEstimatedCharges - vm.discountAmount;
                vm.totalAfterDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                taxTodeduct = vm.totalAfterDiscount * vm.taxes / 100;
                vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
                vm.amountTobePayed = vm.totalAfterDiscount + vm.usertaxes;
              }
              else if (unitsSelected == unitsAlreadyPaidFor) {
                console.log("Same no of units. Plan is still valid. No need for Payment");
                vm.billingRequired = false;
                vm.discountRequired = false;
                billableUnits = 0;
                vm.unitsBillable = parseInt(billableUnits);
                estimatedCharge = 0;
                discount = 0;
                vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
                vm.discountAmount = parseFloat(discount.toFixed(2));
                totalAfterDiscount = 0;
                vm.totalAfterDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                taxTodeduct = 0;
                vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
                vm.amountTobePayed = 0;
              }
              else {
                // units decreased save info indb so stat it can be changes in furure when plan is expired
                console.log("Same plan plan selected and units degraded", "set information for next billing cycle.");
                vm.billingRequired = false;
                vm.discountRequired = false;
                billableUnits = 0;
                vm.unitsBillable = parseInt(billableUnits);
                estimatedCharge = 0;
                discount = 0;
                vm.totalEstimatedCharges = 0;
                vm.discountAmount = 0;
                vm.totalAfterDiscount = 0;
                taxTodeduct = 0;
                vm.usertaxes = 0;
                vm.amountTobePayed = 0;
                swal({
                  title: "Are you sure!",
                  text: "Do you really want to decrease number of units for this user?",
                  type: "warning",
                  confirmButtonColor: '#009999',
                  confirmButtonText: "Ok",
                  showCancelButton: true,
                  closeOnClickOutside: false,
                  allowEscapeKey: true
                }, function (isConfirm) {
                  if (isConfirm) {
                    console.log("Degrade in progress");
                    vm.degradeUserPlan(); // apply degrade changes
                  } else {
                    console.log("No changes needed");
                    $scope.$apply(function () {
                      vm.unitsProvidedToUser = vm.userData.unitsProvidedToUser;
                    });
                    // reset units to old already purchased units
                  }
                });
              }

            }
            // from annual to monthly
            if (vm.currentPlan == "Monthly" && vm.subscriptionOldPlan == "Annual") {
              console.log("Change from annual subscription to monthly. Billing cycle will be next years first day.");
              console.log("No need for Payment.");
              console.log("Change upgrade info in db.");
            }
            if (vm.currentPlan == "Free" && vm.subscriptionOldPlan == "Annual") {
              vm.discountRequired = false;
              vm.billingRequired = false;
              vm.discountAmount = 0;
              vm.totalEstimatedCharges = 0;
              vm.totalAfterDiscount = 0;
              vm.usertaxes = 0;
              vm.amountTobePayed = 0;
              swal({
                title: "Are you sure!",
                text: "Do you really want to Change you plan to Free Trial version?",
                type: "warning",
                confirmButtonColor: '#009999',
                confirmButtonText: "Ok",
                showCancelButton: false,
                closeOnClickOutside: false,
                allowEscapeKey: true
              }, function (isConfirm) {
                if (isConfirm) {
                  console.log("Change plan to free plan after period expire.");
                } else {
                  console.log("No changes needed");
                  // reset units to old already purchased units
                }
              });
            }
            if (vm.currentPlan == "Free" && vm.subscriptionOldPlan == "Monthly") {
              vm.discountRequired = false;
              vm.billingRequired = false;
              vm.billingRequired = false;
              vm.discountAmount = 0;
              vm.totalEstimatedCharges = 0;
              vm.totalAfterDiscount = 0;
              vm.usertaxes = 0;
              vm.amountTobePayed = 0;
              swal({
                title: "Are you sure!",
                text: "Do you really want to Change you plan to Free Trial version?",
                type: "warning",
                confirmButtonColor: '#009999',
                confirmButtonText: "Ok",
                showCancelButton: false,
                closeOnClickOutside: false,
                allowEscapeKey: true
              }, function (isConfirm) {
                if (isConfirm) {
                  console.log("Change plan to free plan after period expire.");
                } else {
                  console.log("No changes needed");
                  // reset units to old already purchased units
                }
              });
            }
          }
        }   // plan change end
        else {
          // No change in  subscription plan 
          console.log("Same subscription plan is selected. Pay if extra units are selected. else no payment is required.");
          // check if current plan expired
          var oldPlanInfo = JSON.parse(vm.userData.currentPlanInfo);
          if (Date.parse(oldPlanInfo.end) < Date.now()) { // check plan nvalidity
            console.log("Plan expired");
            console.log("Pay for units selected.");
            vm.billingRequired = true;
            billableUnits = vm.unitsProvidedToUser - freeUnits;
            vm.unitsBillable = parseInt(billableUnits);
            if (vm.currentPlan == "Annual") {
              vm.discountRequired = true;
              estimatedCharge = billableUnits * vm.pricePerUnit * 12;
              discount = estimatedCharge * 0.1; // 10% dicount for annual plan
              vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
              vm.discountAmount = parseFloat(discount.toFixed(2));
              totalAfterDiscount = vm.totalEstimatedCharges - vm.discountAmount;
              vm.totalAfterDiscount = parseFloat(totalAfterDiscount.toFixed(2));
              taxTodeduct = vm.totalAfterDiscount * vm.taxes / 100;
              vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
              vm.amountTobePayed = vm.totalAfterDiscount + vm.usertaxes;
            }
            else if (vm.currentPlan == "Monthly") {
              vm.discountRequired = false;
              estimatedCharge = billableUnits * vm.pricePerUnit;
              discount = 0;
              vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
              vm.discountAmount = 0;
              totalAfterDiscount = vm.totalEstimatedCharges;
              vm.totalAfterDiscount = parseFloat(totalAfterDiscount.toFixed(2));
              taxTodeduct = vm.totalAfterDiscount * vm.taxes / 100;
              vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
              vm.amountTobePayed = vm.totalAfterDiscount + vm.usertaxes;
            }
            else {
              estimatedCharge = 0;
              discount = 0;
              vm.totalEstimatedCharges = 0;
              vm.discountAmount = 0;
              vm.usertaxes = 0;
              vm.totalAfterDiscount = 0;
              vm.amountTobePayed = 0;
              swal({
                title: "Warning!",
                text: 'User cannot have more than free units allowed in free plan? Hence No payment required.',
                type: "warning",
                showCancelButton: true,
              }, function (isConfirm) {
                vm.unitsProvidedToUser = freeUnits;
              });
            }   // free plan extra units selected in free plan
          }
          else {
            console.log("Plan is valid");
            // check and restrict for free plan
            if ((unitsSelected > freeUnits) && vm.currentPlan == "Free") {
              vm.billingRequired = false;
              estimatedCharge = 0;
              discount = 0;
              vm.totalEstimatedCharges = 0;
              vm.discountAmount = 0;
              vm.totalAfterDiscount = 0;
              vm.usertaxes = 0;
              vm.amountTobePayed = 0;
              swal({
                title: "Warning!",
                text: 'User cannot have more than free units allowed in free plan?',
                type: "warning",
                showCancelButton: true,
              }, function (isConfirm) {
              });
              vm.unitsProvidedToUser = freeUnits;
            }// free plan check end
            else {
              if (unitsSelected > unitsAlreadyPaidFor) {
                // More units added
                console.log("Same plan plan selected and units added, pay for extra units");
                // pay for only extra units
                vm.billingRequired = true;
                billableUnits = vm.unitsProvidedToUser - unitsAlreadyPaidFor;
                vm.unitsBillable = parseInt(billableUnits);
                if (vm.currentPlan == "Annual") {
                  vm.discountRequired = true;
                  estimatedCharge = billableUnits * vm.pricePerUnit * 12;
                  discount = estimatedCharge * 0.1; /// 10% dicount for annual plan
                  vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
                  vm.discountAmount = parseFloat(discount.toFixed(2));
                  totalAfterDiscount = vm.totalEstimatedCharges - vm.discountAmount;
                  vm.totalAfterDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                  taxTodeduct = vm.totalAfterDiscount * vm.taxes / 100;
                  vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
                  vm.amountTobePayed = vm.totalAfterDiscount + vm.usertaxes;
                }
                else if (vm.currentPlan == "Monthly") {
                  estimatedCharge = billableUnits * vm.pricePerUnit;
                  discount = 0;
                  vm.totalEstimatedCharges = parseFloat(estimatedCharge.toFixed(2));
                  vm.discountAmount = 0;
                  vm.totalAfterDiscount = vm.totalEstimatedCharges;
                  taxTodeduct = vm.totalAfterDiscount * vm.taxes / 100;
                  vm.usertaxes = parseFloat(taxTodeduct.toFixed(2));
                  vm.amountTobePayed = vm.totalAfterDiscount + vm.usertaxes;
                }
              }
              else if (unitsSelected == unitsAlreadyPaidFor) {
                console.log("Same no of units. No changes required.");
                vm.billingRequired = false;
                vm.discountAmount = 0;
                vm.totalEstimatedCharges = 0;
                vm.totalAfterDiscount = 0;
                vm.usertaxes = 0;
                vm.amountTobePayed = 0;
                // openerrorsweet("No payment needed");
              }
              else {
                // units decreased save info indb so stat it can be changes in furure when plan is expired
                console.log("Same plan plan selected and units degraded", "set information for next billing cycle.");
                vm.billingRequired = false;
                swal({
                  title: "Are you sure!",
                  text: "Do you really want to decrease number of units for this user?",
                  type: "warning",
                  confirmButtonColor: '#009999',
                  confirmButtonText: "Ok",
                  showCancelButton: true,
                  closeOnClickOutside: false,
                  allowEscapeKey: true
                }, function (isConfirm) {
                  if (isConfirm) {
                    console.log("Degrade in progress");
                    vm.degradeUserPlan(); // apply degrade changes
                  } else {
                    console.log("No changes needed");
                    $scope.$apply(function () {
                      vm.unitsProvidedToUser = vm.userData.unitsProvidedToUser;
                    });
                    // reset units to old already purchased units
                  }
                });
              }
            }
          }
        }
      }

      vm.degradeUserPlan = function () {
        var decreasedUnits = vm.userData.unitsProvidedToUser - vm.unitsProvidedToUser;
        var oldPlan = vm.userData.currentPlan;
        // updateplan in database
        var degradeInfo = JSON.stringify({
          startDate: vm.nextBillingCycleStartDate,
          endDate: vm.nextBillingCycleEndDate,
          units: decreasedUnits,
          plan: vm.currentPlan
        });
        console.log("degrade info", JSON.parse(degradeInfo));
        firebase.database().ref('users/' + landLordID + '/').update({
          degradeInfo: degradeInfo
        }).then(function () {
          vm.opensuccesssweet("Plan for " + vm.userData.firstname + " " + vm.userData.lastname + " has been degraded.! Settings will b eupdated from " + moment(vm.nextBillingCycleStartDate).format('MMMM DD, YYYY.'));
          var emailData = '<p>Hello ' + vm.userData.firstname + ' ' + vm.userData.lastname + '</p>' + '<p>Your number of units has been changed from ' + vm.userData.unitsProvidedToUser + ' to ' + vm.unitsProvidedToUser + '. This change will be applied from ' + vm.nextBillingCycleStartDate + '</p>' + 'If you didn’t change the units then please contact  <a href="mailto:support@vcancy.ca">support@vcancy.ca</a></p><p>Thanks,</p><p>Team Vcancy</p>';
          vm.sendEmail(vm.userData.email, "Decreased number of units.", "Degrade Plan", emailData);
        }, function (error) {
          vm.openerrorsweet("May Be your session is expire please login again.");
          return false;
        });
      }

      vm.sendEmail = function (email, subject, mode, data) {
        emailSendingService.sendEmailViaNodeMailer(email, subject, mode, data);
      };

      // firebase.database().ref('/').once('value').then(function (userdata) {
      //   console.log("--db snapshot--", userdata.val());
      // });

      // var resetUSer = firebase.database().ref('users/' + landLordID).update({
      //   currentPlan: '',
      //   currentPlanInfo: '',
      //   lastRenewalDate: '',
      //   registrationDate: '',
      //   unitsAlreadyAdded: 0,
      //   upgradeOrRenew: '',
      //   billingHistory: '',
      //   unitsAllowed: 15,
      //   unitsProvidedToUser: 15,
      //   freeUnitsAlloted: 15
      // }).then(function () {
      //   console.log("User records reset.");
      // }, function (error) {
      //   console.log("user reset failed.");
      //   return false;
      // });
      /* LWS end */

    }]);


// modal instance controller
vcancyApp.controller('ModalInstanceCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', 'Upload', 'config', '$http', '$modal', '$uibModalInstance', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, Upload, config, $http, $modal, $uibModalInstance) {
  var swal = window.swal;
  var vm = this;
  AWS.config.update({
    accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
    secretAccessKey: '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'
  });
  AWS.config.region = 'ca-central-1';

  $scope.ok = function () {

    var bucket = new AWS.S3({ params: { Bucket: 'vacancy-final' } });
    var fileChooser = document.getElementById('file321');
    var file = fileChooser.files[0];
    var filename = moment().format('YYYYMMDDHHmmss') + file.name;
    filename = filename.replace(/\s/g, '');

    if (file.size > 3145728) {
      // alert('File size should be 3 MB or less.');
      vm.openerrorsweet('File size should be 3 MB or less.');
      return false;
    } else if (!(filename.endsWith('.png'))
      && !(filename.endsWith('.jpg'))
      && !(filename.endsWith('.jpeg'))) {
      // alert('Invalid file type.');
      vm.openerrorsweet("Invalid file type.");
      return false;
    }


    if (file) {
      var params = { Key: 'profile-images/' + filename, ContentType: file.type, Body: file, StorageClass: "STANDARD_IA", ACL: 'public-read' };
      bucket.upload(params).on('httpUploadProgress', function (evt) {
        console.log("Uploaded :: " + parseInt((evt.loaded * 100) / evt.total) + '%');
      }).send(function (err, data) {
        //console.log(data.Location); return false;
        if (data.Location != '') {
          var landLordID = localStorage.getItem('userID');
          var user = firebase.auth().currentUser;
          if (user) {
            firebase.database().ref('users/' + landLordID).update({ 'profilepic': data.Location }).then(function () {
              vm.opensuccesssweet("Your profile Picture updated successfully.");
              //$state.reload();
            }, function (error) {

            });
          }
        }

      });
    } else {
      vm.openerrorsweet("File Type is Invalid.");
      return false;

    }
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };


  vm.opensuccesssweet = function (value) {
    swal({
      title: "Success!",
      text: value,
      type: "success",
      confirmButtonColor: '#009999',
      confirmButtonText: "Ok"
    }, function (isConfirm) {
      if (isConfirm) {
        $uibModalInstance.close();
        $state.reload();
      }
    });
  }

  vm.openerrorsweet = function (value) {
    swal({
      title: "Error",
      text: value,
      type: "warning",
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Ok",
      closeOnConfirm: true
    },
      function () {
        return false;
      });
  }

}]);
