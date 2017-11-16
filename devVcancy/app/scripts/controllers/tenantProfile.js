'use strict';

//=================================================
// Tenant Profile
//=================================================

vcancyApp
    .controller('tenantProfilelCtrl', ['$scope' , '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window) {
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
        
        $rootScope.invalid = '';
        $rootScope.success = '';
        $rootScope.error = '';

        firebase.database().ref('/users/' + tenantID).once('value').then(function (userdata) {
            $scope.$apply(function () {
                if (userdata.val() !== null) {
                    vm.email = userdata.val().email;
                    vm.firstname = userdata.val().firstname;
                    vm.lastname = userdata.val().lastname;
                     vm.address = userdata.val().address;
                    vm.contact = userdata.val().contact;
                    vm.loader = 0;
                }
            });
        });
        vm.profileSubmit = function (tdProfilectrl) {
          //alert($scope.tdProfilectrl.contact); return false;
 
            var updatedata = {};
            var tenantID = localStorage.getItem('userID');
          

            if($scope.tdProfilectrl.contact === undefined || $scope.tdProfilectrl.contact === ""){
              vm.contact = '';
              updatedata['contact'] = '';
            }else{
              updatedata['contact'] = $scope.tdProfilectrl.contact;
            }
             if($scope.tdProfilectrl.address === undefined || $scope.tdProfilectrl.address === ""){
              vm.address = '';
              updatedata['address'] = '';
            }else{
              updatedata['address'] = $scope.tdProfilectrl.address;
            }
            if($scope.tdProfilectrl.email === undefined || $scope.tdProfilectrl.email === ""){
              vm.email = '';
              updatedata['email'] = '';
            }else{
               updatedata['email'] = $scope.tdProfilectrl.email;
            }

            // alert(JSON.stringify(updatedata)); return false;
            firebase.database().ref('users/' + tenantID).update(updatedata).then(function(){
              confirm("Your Information updated!");
            });
        }

         vm.changepasswordSubmit = function(passworduser){

             $rootScope.invalid = '';
            $rootScope.success = '';
            $rootScope.error = '';
             var oldpassword = localStorage.getItem('password');
             var userEmail = localStorage.getItem('userEmail');
             var ncpassword = passworduser.ncpassword ;
             var password = passworduser.password ;
             var npassword = passworduser.npassword ;
              var landLordID = localStorage.getItem('userID');

            if(password === oldpassword){

                    if(ncpassword === npassword){
                        
                          //  alert(JSON.stringify(firebase.auth().currentUser));
                            var user = firebase.auth().currentUser;
                            var newPassword = ncpassword;
                            user.updatePassword(newPassword).then(function() {
                                console.log("success");
                                 confirm("Your password has been updated!");
                                 localStorage.setItem('password', newPassword);
                             $rootScope.success = 'Your password has been updated';
                             $rootScope.error = '';  
                             $rootScope.invalid = '';
                            }).catch(function(error) {
                              // An error happened.
                                $rootScope.invalid = 'regcpwd';         
                                $rootScope.error = 'your Passwords not updated please try again.';
                                $rootScope.success = '';
                            });


                    } else {
                        $rootScope.invalid = 'regcpwd';         
                        $rootScope.error = 'your Passwords don’t match with confirm password.';
                        $rootScope.success = '';
                    }


            } else {
                $rootScope.invalid = 'regcpwd';         
                $rootScope.error = 'your Passwords don’t match with old password.';
                $rootScope.success = '';
            }
        }
            
        
    }]);
