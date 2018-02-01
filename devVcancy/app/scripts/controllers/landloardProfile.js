'use strict';

//=================================================
// Tenant Dashboard
//=================================================

vcancyApp
    .controller('landlordProfilelCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window','Upload','config','$http','$uibModal', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window,Upload,config,$http,$uibModal) {
        var vm = this;
        var landLordID = localStorage.getItem('userID');
        var password = localStorage.getItem('password');
        var swal = window.swal;
        vm.email = '';
        vm.firstname = '';
        vm.lastname = '';
        vm.loader = 1;
        vm.contact = '';
        vm.address  = '';
        vm.notification  = 'Enable';
        vm.success = 0;
        vm.error = 0;
        vm.totaluser = 0;
        vm.users = [];

        vm.profilepic = '../assets/pages/media/profile/people19.png';
        vm.companylogo = '../assets/pages/media/profile/people19.png';
		        $rootScope.invalid = '';
            $rootScope.success = '';
            $rootScope.error = '';
        firebase.database().ref('/users/' + landLordID).once('value').then(function (userdata) {
            $scope.$apply(function () {
                if (userdata.val() !== null) {
                  
                  if(userdata.val().email != ''){
                    vm.email = userdata.val().email;
                  }else{
                    vm.email = localStorage.getItem('userEmail');
                  }
                    
                    vm.firstname = userdata.val().firstname;
                    vm.lastname = userdata.val().lastname;
                    vm.address = userdata.val().address;
                    vm.contact = userdata.val().contact;
                    vm.loader = 1;
                    vm.isadded = userdata.val().isadded;
                    vm.iscancelshow = userdata.val().iscancelshow;
                    vm.iscreditcheck = userdata.val().iscreditcheck;
                    vm.iscriminalreport = userdata.val().iscriminalreport;
                    vm.isexpiresoon = userdata.val().isexpiresoon;
                    vm.ispropertydelete = userdata.val().ispropertydelete;
                    vm.isrentalsubmit = userdata.val().isrentalsubmit ;
                    vm.isshowingtime = userdata.val().isshowingtime;
                    if(userdata.val().profilepic != '' && userdata.val().profilepic != null){
                      vm.profilepic = userdata.val().profilepic;
                    }
                    if(userdata.val().companylogo != '' && userdata.val().companylogo != null){
                      vm.companylogo = userdata.val().companylogo;
                    }
                    vm.companyname = userdata.val().companyname;

                   


                }
            });
        }); 
      
        
         var ref = firebase.database().ref("employee");
                    ref.orderByChild("refId").equalTo(landLordID).on("child_added", function(snapshot) {
                      var userdata = snapshot.val();
                      userdata['key'] = snapshot.key;
                      vm.users.push(userdata);
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
            if($scope.ldProfilectrl.companyname === undefined || $scope.ldProfilectrl.companyname === ""){
              vm.companyname = '';
              updatedata['companyname'] = '';
            }else{
               updatedata['companyname'] = $scope.ldProfilectrl.companyname;
            }
            //alert(JSON.stringify(updatedata)); return false;

            firebase.database().ref('users/' + landLordID).update(updatedata).then(function(){
              vm.opensuccesssweet("Profile Updated successfully!");  
              }, function(error) {
              
              vm.openerrorsweet("Profile Not Updated! Try again!");  
              return false;
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

                    if(password === ncpassword){
                      vm.openerrorsweet("Your old password and new password must be different");
                      return false;
                    }

                    if(ncpassword === npassword){
                        
                            var user = firebase.auth().currentUser;
                            var newPassword = ncpassword;
                            user.updatePassword(newPassword).then(function() {
                                 localStorage.setItem('password', newPassword);
                                  vm.opensuccesssweet("Your password has been updated!"); 
                            }).catch(function(error) {
                              

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

        vm.profilestore = function(){
           AWS.config.update({
                      accessKeyId : 'AKIAI6FJLQDDJXI4LORA',
                      secretAccessKey : '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'
            });
            AWS.config.region = 'us-west-2';
                      
            var bucket = new AWS.S3({params: {Bucket: 'sagar-vcancy-test/company-logo'}});
                            var fileChooser = document.getElementById('file');
                            var file = fileChooser.files[0];
                            var filename = moment().format('YYYYMMDDHHmmss')+file.name; 
                              filename = filename.replace(/\s/g,'');

                              if(file.size > 3145728) {
                                  alert('File size should be 3 MB or less.');
                                  return false;
                                } else if(!(filename.endsWith('.png')) 
                                  && !(filename.endsWith('.jpg'))
                                  && !(filename.endsWith('.jpeg')))  {
                                    alert('Invalid file type.');
                                    return false;
                                }


                            if (file) {
                                var params = {Key: filename, ContentType: file.type, Body: file,StorageClass: "STANDARD_IA" , ACL : 'public-read'};
                                bucket.upload(params).on('httpUploadProgress', function(evt) {
                                console.log("Uploaded :: " + parseInt((evt.loaded * 100) / evt.total)+'%');
                                }).send(function(err, data) {
                                    //console.log(data.Location); return false;
                                    if(data.Location != ''){
                                        var landLordID = localStorage.getItem('userID');
                                               var user = firebase.auth().currentUser;
                                                  if (user) { 
                                                      firebase.database().ref('users/' + landLordID).update({'companylogo':data.Location}).then(function(){
                                                        
                                                          
                                                            vm.opensuccesssweet("Your Company Logo Picture updated successfully."); 
                                                       }, function(error) {
                                                        vm.openerrorsweet("Company Logo Not Added! Try again!"); 
                                                        return false;
                                                      });
                                                  } 
                                    }
                               
                                });
                            }else{
                                alert("File Type is Invalid.");
                                return false;
                            }
        } 
    
       
         vm.newuserSubmit = function(newuser){
            var landLordID = localStorage.getItem('userID');
            var firstname = newuser.firstname;
            var lastname = newuser.lastname;
            var email = newuser.email;
            var refId = landLordID;
            var custome =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            var reguserdbObj = firebase.database();
           
            var pass = 'test@1234'; 
            var usertype = 2;

            var userarray = { firstname: firstname,
            lastname: lastname,
            refId : refId,
            email : email};
           
            reguserObj.$createUserWithEmailAndPassword(email, pass)
            .then(function(firebaseUser) {
                var reguserdbObj = firebase.database();
                    reguserdbObj.ref('users/' + firebaseUser.uid).set({
                    firstname: firstname,
                    lastname: lastname,
                    usertype : usertype,
                    email : email,
                    isadded : 1,
                    iscancelshow : 1,
                    iscreditcheck : 1,
                    iscriminalreport : 1,
                    isexpiresoon : 1,
                    ispropertydelete : 1,
                    isrentalsubmit : 1,
                    isshowingtime : 1,
                    profilepic : "",
                    companyname : ""
                });     


                    firebase.auth().signInWithEmailAndPassword(email, pass)
                     .then(function(firebaseUser) {
                         // Success 
                         firebaseUser.sendEmailVerification().then(function() {
                        console.log("Email Sent");
                          $rootScope.success = 'Confirmation email resent';
                          $rootScope.error = '';      
                    
                      }).catch(function(error) {
                         console.log("Error in sending email"+error);
                      });
                     })
            }).catch(function(error) {
                  //console.log(error);
                if(error.message){
                  if(error.message == "The email address is badly formatted."){
                      $rootScope.error = "Invalid Email.";
                      $rootScope.success = '';
                  }else{
                    $rootScope.error = error.message;
                    $rootScope.success = '';
                  }
                  //$rootScope.error = error.message;
                  
                }     
                
                if(error.code === "auth/invalid-email"){
                  $rootScope.invalid = 'regemail';
                } else if(error.code === "auth/weak-password"){
                  $rootScope.invalid = 'regpwd';          
                }  else {
                  $rootScope.invalid = '';
                }
            });

             reguserdbObj.ref('employee/' + custome).set(userarray, function(error){
                  if(error != null ){
                  
                    vm.openerrorsweet("User Not added Please Try again.");
                    return false; 
                  }else{
                    vm.opensuccesssweet("User Added successfully!"); 
                  }
                });

            
        }

        vm.deleteusers = function(val){
            swal({ 
             title: "Are you sure?",
             text: "Your will not be able to recover this user again!",
             type: "warning",
             showCancelButton: true,
             confirmButtonColor: "#DD6B55",
             confirmButtonText: "Yes, delete it!",
             closeOnConfirm: false}, 
            function(isConfirm){ 
                if (isConfirm) {
                  var propertyObj = $firebaseAuth();
                  var propdbObj = firebase.database();
                  propdbObj.ref('employee/' + val).remove(); 
                   swal({
                    title: "Success!",
                    text: "User has been deleted.",
                    type: "success",
                    confirmButtonColor: '#009999',
                     confirmButtonText: "Ok"
                    },function(isConfirm){
                        if (isConfirm) {
                          $state.reload();
                        }
                      }); 
                 } 
            });
          }

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

        vm.notificationSubmit = function(notificationuser){
      //    console.log(notificationuser);
          var landLordID = localStorage.getItem('userID');
          if(notificationuser != undefined){
              var notification = {};
          
              if( notificationuser.isadded != undefined){
                notification['isadded'] = notificationuser.isadded;
              }else{
                notification['isadded'] = 0;
              }


              if(notificationuser.isshowingtime != undefined){
                notification['isshowingtime'] = notificationuser.isshowingtime;
              }else{
                notification['isshowingtime'] = 0;
              }


              if(notificationuser.isrentalsubmit != undefined){
                notification['isrentalsubmit'] = notificationuser.isrentalsubmit;
              }else{
                notification['isrentalsubmit'] = 0;
              }



              if(notificationuser.iscancelshow != undefined){
                notification['iscancelshow'] = notificationuser.iscancelshow;
              }else{
                notification['iscancelshow'] = 0;
              }


              if(notificationuser.iscreditcheck != undefined){
                notification['iscreditcheck'] = notificationuser.iscreditcheck;
              }else{
                notification['iscreditcheck'] = 0;
              }



              if(notificationuser.iscriminalreport != undefined){
                notification['iscriminalreport'] = notificationuser.iscriminalreport;
              }else{
                notification['iscriminalreport'] = 0;
              }


              if(notificationuser.isexpiresoon != undefined){
                notification['isexpiresoon'] = notificationuser.isexpiresoon;
              }else{
                notification['isexpiresoon'] = 0;
              }



              if(notificationuser.ispropertydelete != undefined){
                notification['ispropertydelete'] = notificationuser.ispropertydelete;
              }else{
                notification['ispropertydelete'] = 0;
              }

             if(notification != null){
                  var user = firebase.auth().currentUser;
                  if (user) { 
                      firebase.database().ref('users/' + landLordID).update(notification).then(function(){
                      vm.opensuccesssweet("Your notification updated successfully!"); 
                      }, function(error) {
                       vm.openerrorsweet("May Be your session is expire please login again."); 
                       return false;
                      });
                  } else {
                     vm.openerrorsweet("May Be your session is expire please login again."); 
                     return false;
                  }
              }else{
                 
                  vm.openerrorsweet("Please Select Atleast one option."); 
                  return false;
              }
              
          }else{
                 vm.openerrorsweet("Please Select Atleast one option."); 
                 return false;
          }
          
        }

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

       vm.opensuccesssweet = function(value){
            swal({
                  title: "Success!",
                  text: value,
                  type: "success",
                  confirmButtonColor: '#009999',
                   confirmButtonText: "Ok"
                  },function(isConfirm){
                      if (isConfirm) {
                        $state.reload();
                      }
                    });

                    
           
      }

      vm.openerrorsweet = function(value){
            swal({ 
                 title:"Error",
                 text: value,
                 type: "warning",
                 confirmButtonColor: "#DD6B55",
                 confirmButtonText: "Ok",
                 closeOnConfirm: true}, 
                function(){ 
                 return false;
                });
           
      }

}]);

vcancyApp.controller('ModalInstanceCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window','Upload','config','$http','$modal', '$uibModalInstance', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window,Upload,config,$http,$modal,$uibModalInstance){
            var swal = window.swal;
            var vm = this;
           AWS.config.update({
                      accessKeyId : 'AKIAI6FJLQDDJXI4LORA',
                      secretAccessKey : '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'
            });
            AWS.config.region = 'us-west-2';

        $scope.ok = function () {
        
                  var bucket = new AWS.S3({params: {Bucket: 'sagar-vcancy-test/profile-images'}});
                  var fileChooser = document.getElementById('file321');
                  var file = fileChooser.files[0];
                  var filename = moment().format('YYYYMMDDHHmmss')+file.name; 
                    filename = filename.replace(/\s/g,'');

                    if(file.size > 3145728) {
                       // alert('File size should be 3 MB or less.');
                        vm.openerrorsweet('File size should be 3 MB or less.'); 
                        return false;
                      } else if(!(filename.endsWith('.png')) 
                        && !(filename.endsWith('.jpg'))
                        && !(filename.endsWith('.jpeg')))  {
                         // alert('Invalid file type.');
                          vm.openerrorsweet("Invalid file type."); 
                          return false;
                      }


                  if (file) {
                      var params = {Key: filename, ContentType: file.type, Body: file,StorageClass: "STANDARD_IA" , ACL : 'public-read'};
                      bucket.upload(params).on('httpUploadProgress', function(evt) {
                      console.log("Uploaded :: " + parseInt((evt.loaded * 100) / evt.total)+'%');
                      }).send(function(err, data) {
                          //console.log(data.Location); return false;
                          if(data.Location != ''){
                              var landLordID = localStorage.getItem('userID');
                                     var user = firebase.auth().currentUser;
                                        if (user) { 
                                            firebase.database().ref('users/' + landLordID).update({'profilepic':data.Location}).then(function(){
                                              vm.opensuccesssweet("Your profile Picture updated successfully."); 
                                              //$state.reload();
                                               }, function(error) {
                                               
                                            });
                                        } 
                          }
                     
                      });
                  }else{
                      vm.openerrorsweet("File Type is Invalid."); 
                      return false;
                      
                  }
        };  

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };


        vm.opensuccesssweet = function(value){
            swal({
                  title: "Success!",
                  text: value,
                  type: "success",
                  confirmButtonColor: '#009999',
                   confirmButtonText: "Ok"
                  },function(isConfirm){
                      if (isConfirm) {
                       $uibModalInstance.close();
                        $state.reload();
                      }
                    });
      }

      vm.openerrorsweet = function(value){
        swal({ 
             title:"Error",
             text: value,
             type: "warning",
             confirmButtonColor: "#DD6B55",
             confirmButtonText: "Ok",
             closeOnConfirm: true}, 
            function(){ 
             return false;
            });
       }
        
}]);
