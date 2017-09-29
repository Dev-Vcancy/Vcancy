'use strict';

//=================================================
// LOGIN, REGISTER
//=================================================

vcancyApp.controller('loginCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$location',function($scope,$firebaseAuth,$state,$rootScope,$location) {
	
        //Status
        this.login = 1;
        this.register = 0;
        this.forgot = 0;
		$rootScope.invalid = '';
		$rootScope.error = '';
		$rootScope.success = '';
		
		this.loginUser = function($user){
			var email = $user.email;
			var password = $user.password;
			//var firebaseObj = new Firebase("https://vcancy-5e3b4.firebaseio.com"); 
			
			var authObj = $firebaseAuth();
			authObj.$signInWithEmailAndPassword(email, password).then(function(firebaseUser) {
			 
				 // console.log(firebase.auth().currentUser);
				 if(firebase.auth().currentUser != null){
					 localStorage.setItem('userID', firebase.auth().currentUser.uid);
					 localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
				 } 
				 // console.log(localStorage.getItem('currentUser'));

				 if(firebase.auth().currentUser != null){
					 $rootScope.uid = firebase.auth().currentUser.uid;
					 $rootScope.emailVerified = firebase.auth().currentUser.emailVerified;
				 } 
				 
				 if(!firebase.auth().currentUser.emailVerified){
					$rootScope.error = 'Your new email is not verified. Please try again after verifying your email.';
					$rootScope.invalid = '';
					authObj.$signOut();
					$rootScope.user = null;
					localStorage.clear();
					$state.go('login');
				 } else {			 
					 firebase.database().ref('/users/' + firebaseUser.uid).once('value').then(function(userdata) {
					   if(userdata.val().usertype === 0){
							$rootScope.usertype = 0;
							localStorage.setItem('usertype', 0);
							console.log("Signed in as tenant:", firebaseUser.uid);
							if($rootScope.applyhiturl.indexOf("applyproperty") !== -1){
								console.log($rootScope.applyhiturl);
								window.location.href = $rootScope.applyhiturl;
							} else {
								$state.go("tenantdashboard");  
							} 
					   } else {    
							$rootScope.usertype = 1;
							localStorage.setItem('usertype', 1);
							console.log("Signed in as landlord:", firebaseUser.uid);
							$state.go("landlorddashboard");
					   }
					 });
				 }
				 
			}).catch(function(error) {
				if(error.message){
					$rootScope.error = error.message;
				} 
								
				if(error.code === "auth/invalid-email"){
					$rootScope.invalid = 'loginemail';
				} else if(error.code === "auth/wrong-password"){
					$rootScope.invalid = 'loginpwd';				
				} else if(error.code === "auth/user-not-found"){
					$rootScope.invalid = 'all';					
				} else {
					console.log('hre');
					$rootScope.invalid = '';
				}
			 // console.error("Authentication failed:", error);
			});
			 
			 // $scope.deliberatelyTrustDangerousSnippet = function() {
               // return $sce.trustAsHtml($rootScope.error);
             // };
		}
		
		this.registerUser = function(reguser){
			var first = reguser.first;
			var last = reguser.last;
			var email = reguser.email;
			var pass = reguser.pass; 
			var cpass = reguser.cpass; 
			var usertype = reguser.usertype;
			$rootScope.invalid = '';
			$rootScope.success = '';
			$rootScope.error = '';
			
			var reguserObj = $firebaseAuth();
			
			if(cpass === pass){
				reguserObj.$createUserWithEmailAndPassword(email, pass)
					.then(function(firebaseUser) {
						
						console.log(firebaseUser);
						firebaseUser.sendEmailVerification().then(function() {
							// console.log("Email Sent");
						}).catch(function(error) {
							// console.log("Error in sending email"+error);
						});
												
						var reguserdbObj = firebase.database();
						reguserdbObj.ref('users/' + firebaseUser.uid).set({
						firstname: first,
						lastname: last,
						usertype : usertype
					  });				  
					$rootScope.success = 'Your account has been created and an email has been sent. Please verify your email to Log In!';
					$rootScope.error = '';			
					//console.log("User " + firebaseUser.uid + " created successfully!");
				  }).catch(function(error) {
					if(error.message){
						$rootScope.error = error.message;
						$rootScope.success = '';
					} 		
					
					if(error.code === "auth/invalid-email"){
						$rootScope.invalid = 'regemail';
					} else if(error.code === "auth/weak-password"){
						$rootScope.invalid = 'regpwd';					
					}  else {
						$rootScope.invalid = '';
					}
					// console.error("Error: ", error);
				  });
			} else {
				$rootScope.invalid = 'regcpwd';			
				$rootScope.error = 'Confirm password doesnot match password.';
				$rootScope.success = '';
				//console.error("Error: ","Confirm password doesnot match password");
			}
			
		}
		
		this.forgotpwdmail = function(forgotuser){
			var email = forgotuser.email;
			$rootScope.invalid = '';
			$rootScope.success = '';
			$rootScope.error = '';
			
			var forgotuserObj = $firebaseAuth();
			forgotuserObj.$sendPasswordResetEmail(email).then(function() {
				// console.log("Password reset email sent successfully!");
				$rootScope.success = 'Password reset mail sent successfully.Please check your Inbox.';
				$rootScope.error = '';	
			}).catch(function(error) {
				// console.error("Error: ", error);
				if(error.message){
					$rootScope.error = error.message;
					$rootScope.success = '';
				} 
			});
			
		}
		
}]);
