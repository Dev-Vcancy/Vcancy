'use strict';

vcancyApp
    .controller('adminProfileCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '_', 'emailSendingService',
        function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, _, emailSendingService) {

            var vm = this;
            var landlordID = localStorage.getItem('userID');
            vm.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
            var password = localStorage.getItem('password');
            vm.updatePassword = {};

            vm.changePassword = function () {
                if (vm.updatePassword.newPwd != vm.updatePassword.conPwd) {
                    swal({
                        title: 'Error',
                        text: 'New password should match with confirm password',
                        type: 'error'
                    });
                }
                else if (password != vm.updatePassword.oldPwd) {
                    swal({
                        title: 'Error',
                        text: 'Old password dont match',
                        type: 'error'
                    });
                }
                else if (vm.updatePassword.newPwd == vm.updatePassword.conPwd && vm.userData.email && password == vm.updatePassword.oldPwd) {
                    var user = firebase.auth().currentUser;
                    var newPassword = vm.updatePassword.newPwd;
                    user.updatePassword(newPassword).then(function () {
                        vm.updatePassword = {};
                        swal({
                            title: 'Success',
                            text: 'Password updated',
                            type: 'success'
                        });
                        localStorage.setItem('password', newPassword);
                        var emailData = '<p>Hello, </p><p>Your password has been changed. If you didn’t change the password then please contact  support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
                        emailSendingService.sendEmailViaNodeMailer(vm.userData.email, 'Password changed', 'changepassword', emailData);
                    });
                }
            };

            vm.createUserByEmail = function () {

                var usertype = 3;
                var characterArray = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                var pass = '';
                for (var i = 0; i < 6; i++) {
                    var num = Math.floor((Math.random() * 60) + 1);
                    pass += characterArray[num];
                }
                $scope.loader = 1;
                var reguserObj = $firebaseAuth();
                reguserObj.$createUserWithEmailAndPassword(vm.createUser.email, pass)
                    .then(function (firebaseUser) {
                        var reguserdbObj = firebase.database();
                        reguserdbObj.ref('users/' + firebaseUser.uid).set({
                            firstname: 'admin',
                            lastname: 'admin',
                            usertype: usertype,
                            email: vm.createUser.email,
                        });
                        firebase.auth().signInWithEmailAndPassword(vm.createUser.email, pass)
                            .then(function (firebaseUser) {
                                // Success 
                                firebaseUser.sendEmailVerification().then(function () {
                                    $scope.loader = 0;
                                    // Send Email
                                    vm.createUser.email = '';
                                    
                                    swal({
                                        title: 'Success',
                                        text: 'User created',
                                        type: 'success'
                                    });
                                    emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'A new user account has been added to your portal', 'Welcome', emailData);
        
                                    var emailData = '<p>Hello, </p><p>' + vm.createUser.email + ' ,has been added to on https://vcancy.com/ as admin.</p><p>Your password : <strong>' + pass + '</strong></p><p>If you have any questions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
        
                                    // Send Email
                                    emailSendingService.sendEmailViaNodeMailer(vm.createUser.email, 'A new user account has been added to your portal', 'Welcome', emailData);
                                });
                            });
                    });

            };
        }]);
