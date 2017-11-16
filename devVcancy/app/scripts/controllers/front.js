'use strict';

//=================================================
// LOGIN, REGISTER
//=================================================

vcancyApp.controller('loginCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$location',function($scope,$firebaseAuth,$state,$rootScope,$location) {
		var vm = this;
        //Status
        vm.login = 1;
        vm.register = 0;
        vm.forgot = 0;
		$rootScope.invalid = '';
		$rootScope.error = '';
		$rootScope.success = '';
		
		vm.loginUser = function($user){
			var email = $user.email;
			var password = $user.password;
			
			var authObj = $firebaseAuth();
			authObj.$signInWithEmailAndPassword(email, password).then(function(firebaseUser) {			 
				 //alert(JSON.stringify(firebase.auth().currentUser));
				 if(firebase.auth().currentUser != null){
					 localStorage.setItem('userID', firebase.auth().currentUser.uid);
					 localStorage.setItem('userEmail', firebase.auth().currentUser.email);
					 localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
					 localStorage.setItem('password', password);
					 
				 } 

				 if(firebase.auth().currentUser != null){
					 $rootScope.uid = firebase.auth().currentUser.uid;
					 $rootScope.userEmail = firebase.auth().currentUser.email;
					 $rootScope.emailVerified = firebase.auth().currentUser.emailVerified;
					 $rootScope.password = firebase.auth().currentUser.password;

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
                                                
							if(localStorage.getItem('applyhiturl') != undefined && localStorage.getItem('applyhiturl').indexOf("applyproperty") !== -1){
								window.location.href = localStorage.getItem('applyhiturl');
								localStorage.setItem('applyhiturl','');
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
			});
			 
		}
		
		vm.registerUser = function(reguser){
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
					// $scope.$apply(function(){
						firebaseUser.sendEmailVerification().then(function() {
							// console.log("Email Sent");
						}).catch(function(error) {
							// console.log("Error in sending email"+error);
						});
												
						var reguserdbObj = firebase.database();
						reguserdbObj.ref('users/' + firebaseUser.uid).set({
						firstname: first,
						lastname: last,
						usertype : usertype,
						email : email
					  });				  
					$rootScope.success = 'Your account has been created and an email has been sent. Please verify your email to Log In!';
					$rootScope.error = '';			
					reguser.first = '';
					reguser.last = '';
					reguser.email = '';
					reguser.pass = ''; 
					reguser.cpass = ''; 
					reguser.usertype = -1;
					vm.reguser = reguser;
					
					// When apply property url hit direct login and redirect to apply link url on signup successful
					if(localStorage.getItem('applyhiturl') != undefined && localStorage.getItem('applyhiturl').indexOf("applyproperty") !== -1 && usertype === 0 ){
						var authObj = $firebaseAuth();
						authObj.$signInWithEmailAndPassword(email, pass).then(function(firebaseUser) {
							 if(firebase.auth().currentUser != null){
								 localStorage.setItem('userID', firebase.auth().currentUser.uid);
								 localStorage.setItem('userEmail', firebase.auth().currentUser.email);
								 localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
							 } 

							 if(firebase.auth().currentUser != null){
								 $rootScope.uid = firebase.auth().currentUser.uid;
								 $rootScope.userEmail = firebase.auth().currentUser.email;
								 $rootScope.emailVerified = firebase.auth().currentUser.emailVerified;
							 } 
							
							firebase.database().ref('/users/' + firebaseUser.uid).once('value').then(function(userdata) {
							   if(userdata.val().usertype === 0){
									$rootScope.usertype = 0;
									localStorage.setItem('usertype', 0);
									console.log("Signed in as tenant:", firebaseUser.uid);
									
									window.location.href = localStorage.getItem('applyhiturl');
									localStorage.setItem('applyhiturl','');
							   } 
							 });
						});
					}		
					// Ends Here
					// });
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
				  });
			} else {
				$rootScope.invalid = 'regcpwd';			
				$rootScope.error = 'Passwords don’t match.';
				$rootScope.success = '';
			}
			
			vm.reguser = reguser;
		}
		
		vm.forgotpwdmail = function(forgot){
			var email = forgot.email;
			$rootScope.invalid = '';
			$rootScope.success = '';
			$rootScope.error = '';
			
			var forgotuserObj = $firebaseAuth();
			forgotuserObj.$sendPasswordResetEmail(email).then(function() {
				$rootScope.success = 'Password reset email sent in your inbox. Please check your email.';
				$rootScope.error = '';
				vm.forgotuser.email = '';		
			}).catch(function(error) {
				console.error("Error: ", error);
				if(error.message){
					$rootScope.error = error.message;
					$rootScope.success = '';
				} 
			});
				
		}
		
}]);
