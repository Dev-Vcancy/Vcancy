'use strict';

//=================================================
// Tenant Profile
//=================================================

vcancyApp
    .controller('tenantProfilelCtrl', ['$scope' , '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window','emailSendingService',
     function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window,emailSendingService) {
        var vm = this;
        var tenantID = localStorage.getItem('userID');
        var password = localStorage.getItem('password');


        vm.email = '';
        vm.firstname = '';
        vm.lastname = '';
         vm.contact = '';
        vm.address  = '';
        vm.password  = password;
        vm.loader = 1;
        vm.userdata={};
        
        vm.invalid = '';
        vm.success = '';
        vm.error = '';

        firebase.database().ref('/users/' + tenantID).once('value').then(function (userdata) {

            $scope.$apply(function () {
              vm.userData = userdata.val();
              console.log(vm.userData)

            });
          });

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

        // firebase.database().ref('/users/' + tenantID).once('value').then(function (userdata) {
        //     $scope.$apply(function () {
        //         if (userdata.val() !== null) {
        //             vm.email = userdata.val().email;
        //             vm.firstname = userdata.val().firstname;
        //             vm.lastname = userdata.val().lastname;
        //              vm.address = userdata.val().address;
        //             vm.contact = userdata.val().contact;
        //             vm.loader = 0;
        //         }
        //     });
        // });
        vm.profileSubmit = function (tdProfilectrl) {
            var tenantID = localStorage.getItem('userID');
          //alert($scope.tdProfilectrl.contact); return false;
 
           // var updatedata = {};
          
          

            // if($scope.tdProfilectrl.contact === undefined || $scope.tdProfilectrl.contact === ""){
            //   vm.contact = '';
            //   updatedata['contact'] = '';
            // }else{
            //   updatedata['contact'] = $scope.tdProfilectrl.contact;
            // }
            //  if($scope.tdProfilectrl.address === undefined || $scope.tdProfilectrl.address === ""){
            //   vm.address = '';
            //   updatedata['address'] = '';
            // }else{
            //   updatedata['address'] = $scope.tdProfilectrl.address;
            // }
            // if($scope.tdProfilectrl.email === undefined || $scope.tdProfilectrl.email === ""){
            //   vm.email = '';
            //   updatedata['email'] = '';
            // }else{
            //    updatedata['email'] = $scope.tdProfilectrl.email;
            // }

            // // alert(JSON.stringify(updatedata)); return false;
            // firebase.database().ref('users/' + tenantID).update(updatedata).then(function(){
            //   confirm("Your Information updated!");
            // });
            firebase.database().ref('users/' + tenantID).update(vm.userData).then(function () {
                vm.opensuccesssweet("Profile Updated successfully!");
              }, function (error) {
      
                vm.openerrorsweet("Profile Not Updated! Try again!");
                return false;
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
          }
    
        //  vm.changepasswordSubmit = function(passworduser){

        //      $rootScope.invalid = '';
        //     $rootScope.success = '';
        //     $rootScope.error = '';
        //      var oldpassword = localStorage.getItem('password');
        //      var userEmail = localStorage.getItem('userEmail');
        //      var ncpassword = passworduser.ncpassword ;
        //      var password = passworduser.password ;
        //      var npassword = passworduser.npassword ;
        //       var landLordID = localStorage.getItem('userID');

        //     if(password === oldpassword){

        //             if(ncpassword === npassword){
                        
        //                   //  alert(JSON.stringify(firebase.auth().currentUser));
        //                     var user = firebase.auth().currentUser;
        //                     var newPassword = ncpassword;
        //                     user.updatePassword(newPassword).then(function() {
                              
        //                        var emailData = '<p>Hello, </p><p>Your password has been changed. If you didn’t change the password then please contact  support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
                                    
        //                             // Send Email
        //                               emailSendingService.sendEmailViaNodeMailer(userEmail, 'Password changed', 'changepassword', emailData);


        //                         console.log("success");
        //                          confirm("Your password has been updated!");
        //                          localStorage.setItem('password', newPassword);
        //                      $rootScope.success = 'Your password has been updated';
        //                      $rootScope.error = '';  
        //                      $rootScope.invalid = '';
        //                     }).catch(function(error) {
        //                       // An error happened.
        //                         $rootScope.invalid = 'regcpwd';         
        //                         $rootScope.error = 'your Passwords not updated please try again.';
        //                         $rootScope.success = '';
        //                     });


        //             } else {
        //                 $rootScope.invalid = 'regcpwd';         
        //                 $rootScope.error = 'your Passwords don’t match with confirm password.';
        //                 $rootScope.success = '';
        //             }


        //     } else {
        //         $rootScope.invalid = 'regcpwd';         
        //         $rootScope.error = 'your Passwords don’t match with old password.';
        //         $rootScope.success = '';
        //     }
        // }
            
        
    }]);
