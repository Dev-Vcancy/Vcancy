'use strict';

//=================================================
// CUSTOM EMAIL HANDLE
//=================================================

vcancyApp.controller('emailhandlerCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams) {
	
	var mode = $stateParams.mode;
	var oobCode = $stateParams.oobCode;	
	this.mode = mode;	
	
	// console.log($stateParams);
	if(mode == 'verifyEmail'){
		firebase.auth().applyActionCode(oobCode).then(function(resp) {
			console.log("Thanks for verifying your email.");
			$rootScope.emailhandler = "Thanks for verifying your email.";
		}).catch(function(error) {	
			console.log(error.message, error.reason);
			if(error.message != "undefined"){
				$rootScope.emailhandler = error.message;
			}
        })			
		
	} else if(mode == 'resetPassword'){
		  var accountEmail;
		  
		  auth.verifyPasswordResetCode(actionCode).then(function(email) {
			var accountEmail = email;
			// TODO: Show the reset screen with the user's email and ask the user for
			// the new password.
			// Save the new password.
			
			auth.confirmPasswordReset(actionCode, newPassword).then(function(resp) {
			  // Password reset has been confirmed and new password updated.			  
			}).catch(function(error) {
			  // Error occurred during confirmation. The code might have expired or the
			  // password is too weak.
			});
		  }).catch(function(error) {
			// Invalid or expired action code. Ask user to try to reset the password
			// again.
		  });
	}
	
}])