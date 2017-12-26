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
        vm.notification  = 'Enable';
        vm.success = 0;
        vm.error = 0;

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
                    vm.notification = userdata.val().notification;
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
              //confirm("Your Information updated!");
               vm.success = 1;
            }, function(error) {
              // The Promise was rejected.
              console.error(error);
              vm.error = 1;
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
                                $rootScope.success = 'Your password has been updated!';
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

        vm.profilestore = function(){
          vm.error = 0;
            alert("hfgjdfg");
            function checkFile() {
              if($('#uploadfile')[0].files[0]) {
                var _fileName = $('#uploadfile')[0].files[0].name.toLowerCase();        
                if($('#uploadfile')[0].files[0].size > 3145728) {
                  return 'File size should be 3 MB or less.'
                } else if(!(_fileName.endsWith('.png')) 
                  && !(_fileName.endsWith('.jpg'))
                  && !(_fileName.endsWith('.jpeg')))  {
                    return 'Invalid file type.'
                }
              }
            }

            var fileCheckMsg = checkFile();
            if(fileCheckMsg) {
                vm.error = 1;
                vm.errormessage = "Invalid File Extensions."
            }

            var filename = $('#filename').val() === '' ? '' : $('#filename').val();
            var filepath = filename != '' ? "https://vcancy.ca/login/uploads/" + filename : appfiles;

            console.log(filename, filepath, appfiles);
        }

        vm.notificationSubmit = function(notificationuser){
          //alert("fjghkdf");

        }
}])