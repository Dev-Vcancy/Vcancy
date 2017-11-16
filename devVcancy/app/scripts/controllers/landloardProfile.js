'use strict';

//=================================================
// Tenant Dashboard
//=================================================

vcancyApp
    .controller('landlordProfilelCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window) {
        var vm = this;
        var landLordID = localStorage.getItem('userID');
        var password = localStorage.getItem('password');
        
        vm.email = '';
        vm.firstname = '';
        vm.lastname = '';
        vm.loader = 1;
        vm.contact = '';
        vm.address  = '';

		 $rootScope.invalid = '';
            $rootScope.success = '';
            $rootScope.error = '';
        //alert(landLordID);
       /* var commentsRef = firebase.database().ref('users/' + landLordID);
		      commentsRef.once('value', function(snapshot) {
		      	 snapshot.forEach(function(childSnapshot) {
		      	 	alert(childSnapshot.key);
		      	 	 });
		      });*/
        

        firebase.database().ref('/users/' + landLordID).once('value').then(function (userdata) {
            $scope.$apply(function () {
                if (userdata.val() !== null) {

                    vm.email = userdata.val().email;
                    vm.firstname = userdata.val().firstname;
                    vm.lastname = userdata.val().lastname;
                    vm.address = userdata.val().address;
                    vm.contact = userdata.val().contact;
                    vm.loader = 1;
                }
            });
        }); 
        
        vm.profileSubmit = function (ldProfilectrl) {
        	 var landLordID = localStorage.getItem('userID');


             var updatedata = {};
            //var tenantID = localStorage.getItem('userID');
            if($scope.ldProfilectrl.contact === undefined || $scope.ldProfilectrl.contact === ""){
              vm.contact = '';
              updatedata['contact'] = '';
            }else{
              updatedata['contact'] = $scope.ldProfilectrl.contact;
            }
             if($scope.ldProfilectrl.address === undefined || $scope.ldProfilectrl.address === ""){
              vm.address = '';
              updatedata['address'] = '';
            }else{
              updatedata['address'] = $scope.ldProfilectrl.address;
            }
            if($scope.ldProfilectrl.email === undefined || $scope.ldProfilectrl.email === ""){
              vm.email = '';
              updatedata['email'] = '';
            }else{
               updatedata['email'] = $scope.ldProfilectrl.email;
            }
            //alert(JSON.stringify(updatedata)); return false;

            firebase.database().ref('users/' + landLordID).update(updatedata).then(function(){
              confirm("Your Information updated!");
            });
        }

        vm.changepasswordSubmit = function(passworduser){

            //alert(JSON.stringify(passworduser));
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
}])