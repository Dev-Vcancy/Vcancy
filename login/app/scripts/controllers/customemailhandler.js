'use strict';

//=================================================
// Custom Email Handler
//=================================================

vcancyApp.controller('emailhandlerCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window) {
	
	var mode = $stateParams.mode;
	var oobCode = $stateParams.oobCode;
	// localStorage.setItem('emailHandled',"");
	$rootScope.emailhandler = '';
	$rootScope.success = '';
	$rootScope.error = '';
	this.mode = mode;
	
	console.log($stateParams);
	if(mode == 'verifyEmail') {
		firebase.auth().applyActionCode(oobCode).then(function(resp) {
			localStorage.setItem('emailHandled', "Thanks for verifying your email.");
			localStorage.setItem('userEmailVerified', "true");
			$scope.$apply(function(){
				$rootScope.emailhandler = localStorage.getItem('emailHandled');	
			});			
		}).catch(function(error) {
			localStorage.setItem('emailHandled', error.message);
			$scope.$apply(function(){
				$rootScope.emailhandler = localStorage.getItem('emailHandled');	
			});			
			console.log(error.message, error.reason);
        })	
				
		
		// $rootScope.emailhandler = localStorage.getItem('emailHandled');	
		
	} else if(mode == 'resetPassword'){
		  var accountEmail;
		  
		  firebase.auth().verifyPasswordResetCode(oobCode).then(function(email) {
			var accountEmail = email;
			console.log(accountEmail);
			
			$scope.$apply(function(){
				$rootScope.useremail = email;
			});
			
			// TODO: Show the reset screen with the user's email and ask the user for
			// the new password.
			// Save the new password.
						
			// firebase.auth().confirmPasswordReset(oobCode, newPassword).then(function(resp) {
			  // Password reset has been confirmed and new password updated.			  
			// }).catch(function(error) {
			  // Error occurred during confirmation. The code might have expired or the
			  // password is too weak.
			// });
		  }).catch(function(error) {
			  $state.go('login');
			  // $scope.$apply(function(){
				// $rootScope.error = "Invalid or expired action code. Ask user to try to reset the password again.";
			  // });
			  console.log("Invalid or expired action code. Ask user to try to reset the password again.");		
		  });
		  
		  
			this.resetpasswordsubmit = function(){
				// console.log(this.newpassword);
				if(this.cpassword == this.newpassword){
					firebase.auth().confirmPasswordReset(oobCode, this.newpassword).then(function(resp) {
					  console.log("Password reset has been confirmed and new password updated.");
						$scope.$apply(function(){
							$rootScope.success = "Password reset has been confirmed and new password updated.";	
						});				  
					}).catch(function(error) {
					  console.log("Error occurred during confirmation. The code might have expired or the password is too weak.");
					  $scope.$apply(function(){
						$rootScope.error = "Error occurred during confirmation. The code might have expired or the password is too weak.";
					  });
					});
				} else {
					console.log("Passwords don’t match.");
					  $scope.$apply(function(){
						$rootScope.error = "Passwords don’t match.";
					  });
				}				
			}
			
	}
	
	
}])