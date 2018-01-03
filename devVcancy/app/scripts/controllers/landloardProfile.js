'use strict';

//=================================================
// Tenant Dashboard
//=================================================

vcancyApp
    .controller('landlordProfilelCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window','Upload','config','$http','$uibModal', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window,Upload,config,$http,$uibModal) {
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
        vm.totaluser = 0;
        vm.profilepic = '../assets/pages/media/profile/people19.png';
        vm.companylogo = '../assets/pages/media/profile/people19.png';
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
                  //  console.log(userdata.val());
                    vm.email = userdata.val().email;
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
                    vm.profilepic = userdata.val().profilepic;
                    vm.companylogo = userdata.val().companylogo;
                    vm.companyname = userdata.val().companyname;

                   


                }
            });
        }); 
        
        
         var ref = firebase.database().ref("employee");
                    ref.orderByChild("refId").equalTo(landLordID).on("child_added", function(snapshot) {
                      console.log(snapshot.key);
                      vm.totaluser++;
                    });

                   var setinterval =  setInterval(function(){ if(vm.totaluser != 0){
                    $("#totaluser").text(vm.totaluser);
                      console.log(vm.totaluser);
                      clearInterval(setinterval);
                   } }, 3000);

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
              //confirm("Your Information updated!");
            // ldProfilectrl.success = "Profile Updated successfully"
             if (confirm("Profile Updated successfully!") == true) {
               // window.reload();
              } else {
                return false;
              }
            }, function(error) {
              // The Promise was rejected.
              console.error(error);
              if (confirm("Profile not Updated!") == true) {
                return false;
               
              }
                
              //ldProfilectrl.error = "Profile Updated successfully"
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
                                 
                            /* $rootScope.success = 'Your password has been updated';
                             $rootScope.error = '';  
                             $rootScope.invalid = '';*/
                            }).catch(function(error) {
                              // An error happened.
                                $rootScope.invalid = 'regcpwd';         
                                $rootScope.error = 'your Passwords not updated please try again.';
                                $rootScope.success = '';
                            });


                    } else {
                           if(confirm("Passwords don't match.") == true){
                              return false;
                            }
                        /*$rootScope.invalid = 'regcpwd';         
                        $rootScope.error = "Passwords don't match";
                        $rootScope.success = '';*/
                    }


        	} else {

                if(confirm("Passwords don't match.") == true){
                  return false;
                }
                /*$rootScope.invalid = 'regcpwd';         
                $rootScope.error = "Passwords don't match";
                $rootScope.success = '';*/
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
                                                       
                                                        if (confirm("Your Company Logo Picture updated successfully.") == true) {
                                                            
                                                          } else {
                                                            return false;
                                                          }
                                                       }, function(error) {
                                                        // The Promise was rejected.
                                                        console.error(error);
                                                        
                                                      });
                                                  } 
                                    }
                               
                                });
                            }else{
                                alert("File Type is Invalid.");
                                return false;
                            }
        } 
     /*   vm.profilestore = function(){
           var landLordID = localStorage.getItem('userID');
          vm.error = 0;
            //alert("hfgjdfg");
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

          var appfiles = $('#appfiles').val();
          var filename = $('#filename').val() === '' ? '' : $('#filename').val();
            filename = moment().format('YYYYMMDDHHmmss')+filename.replace(/\s/g,''); 

            
            console.log(filepath);
            if(filename != ''){
             vm.upload(appfiles, filename);
               var user = firebase.auth().currentUser;
                  if (user) { 
                      firebase.database().ref('users/' + landLordID).update({'profilepic':filepath}).then(function(){
                         vm.success = "Your profile updated successfully.";
                       }, function(error) {
                        // The Promise was rejected.
                        console.error(error);
                        $rootScope.error = "May Be your session is expire please login again."
                      });
                  } else {
                     $rootScope.error = "May Be your session is expire please login again."
                  }
            }

            console.log(filename, filepath, appfiles);
        } */

       
         vm.newuserSubmit = function(newuser){

          // alert(JSON.stringify(newuser));
            var landLordID = localStorage.getItem('userID');
            var firstname = newuser.firstname;
            var lastname = newuser.lastname;
            var email = newuser.email;
            var refId = landLordID;
            var custome =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            var reguserdbObj = firebase.database();
           /* reguserdbObj.ref('users/' + firebaseUser.uid).set({
            firstname: firstname,
            lastname: lastname,
            refId : refId,
            email : email,
            });   */  
            var userarray = { firstname: firstname,
            lastname: lastname,
            refId : refId,
            email : email};
            reguserdbObj.ref('employee/' + custome).set(userarray, function(error){
                  if(error != null ){
                    console.log(error);
                    confirm("User Not added Please Try again.");
                    $rootScope.invalid = 'regcpwd';         
                    $rootScope.error = 'User Not added Please Try again.';
                    $rootScope.success = '';
                  }else{
                    console.log('Done');
                    confirm("User Added successfully!");
                    $rootScope.invalid = 'regcpwd';         
                    $rootScope.error = '';
                    $rootScope.success = 'User Added successfully!';
                                    
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
                       // confirm("Your Information updated!");
                         vm.success = "Your notification updated successfully.";
                      }, function(error) {
                        // The Promise was rejected.
                        console.error(error);
                        $rootScope.error = "May Be your session is expire please login again."
                      });
                  } else {
                     $rootScope.error = "May Be your session is expire please login again."
                  }
              }else{
                  $rootScope.error = "Please Select Atleast one option."
              }
              
          }else{
                  $rootScope.error = "Please Select Atleast one option."
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
          //$log.info('Modal dismissed at: ' + new Date());
        });
      };

}]);

vcancyApp.controller('ModalInstanceCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window','Upload','config','$http','$modal', '$uibModalInstance', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window,Upload,config,$http,$modal,$uibModalInstance){

           AWS.config.update({
                      accessKeyId : 'AKIAI6FJLQDDJXI4LORA',
                      secretAccessKey : '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'
            });
            AWS.config.region = 'us-west-2';

        $scope.ok = function () {
        
                  var bucket = new AWS.S3({params: {Bucket: 'sagar-vcancy-test/profile-images'}});
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
                                            firebase.database().ref('users/' + landLordID).update({'profilepic':data.Location}).then(function(){
                                             
                                              if (confirm("Your profile Picture updated successfully.") == true) {
                                                  $uibModalInstance.close();
                                                } else {
                                                  return false;
                                                }
                                             }, function(error) {
                                              // The Promise was rejected.
                                              console.error(error);
                                              
                                            });
                                        } 
                          }
                     
                      });
                  }else{
                      alert("File Type is Invalid.");
                      return false;
                  }
                  
              
        };  

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };

}]);
