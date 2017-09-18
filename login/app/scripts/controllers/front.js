'use strict';

//=================================================
// LOGIN, REGISTER
//=================================================

vcancyApp.controller('loginCtrl', ['$scope','$firebaseAuth','$state',function($scope,$firebaseAuth,$state) {
	
        //Status
		this.head = 1;
        this.login = 1;
        this.register = 0;
        this.forgot = 0;
		
		this.loginUser = function($user){
			var email = $user.email;
			var password = $user.password;
			//var firebaseObj = new Firebase("https://vcancy-5e3b4.firebaseio.com"); 
			
			var authObj = $firebaseAuth();
			authObj.$signInWithEmailAndPassword(email, password).then(function(firebaseUser) {
			 
				 console.log(firebase.auth().currentUser);
				 // if(!firebaseUser.emailVerified){				 
					// firebase.auth().signOut()
					// $('.loginmsgvalidate').html('<div class="alert alert-danger alert-dismissable fade in">Please verify your email.</div>');
				 // } 

				 $state.go("landlorddashboard");
				 console.log("Signed in as:", firebaseUser.uid);
				 
			}).catch(function(error) {
				if(error.message){
					$('.loginmsgvalidate').html('<div class="alert alert-danger alert-dismissable fade in">'+error.message+'</div>');
				} 
				
				$('form input').removeClass('invalidField');		
				
				if(error.code === "auth/invalid-email"){
					$('#loginemail').addClass('invalidField');
				} else if(error.code === "auth/wrong-password"){
					$('#loginpwd').addClass('invalidField');					
				} else if(error.code === "auth/user-not-found"){
					$('#loginpwd,#loginemail').addClass('invalidField');					
				} else {
					$('#loginpwd,#loginemail').removeClass('invalidField');					
				}
			 console.error("Authentication failed:", error);
			});
			
		}
		
		this.registerUser = function($reguser){
			var first = $reguser.first;
			var last = $reguser.last;
			var email = $reguser.email;
			var pass = $reguser.pass; 
			var cpass = $reguser.cpass; 
			var usertype = $reguser.usertype;
			
			var reguserObj = $firebaseAuth();
			
			if(cpass === pass){
				reguserObj.$createUserWithEmailAndPassword(email, pass)
					.then(function(firebaseUser) {
						
						console.log(firebaseUser);
						firebaseUser.sendEmailVerification().then(function() {
							console.log("Email Sent");
						}).catch(function(error) {
							console.log("Error in sending email"+error);
						});
												
						var reguserdbObj = firebase.database();
						reguserdbObj.ref('users/' + firebaseUser.uid).set({
						firstname: first,
						lastname: last,
						usertype : usertype
					  });				  
					$('.regmsgvalidate').html('<div class="alert alert-success alert-dismissable fade in">User created successfully!</div>');
					//console.log("User " + firebaseUser.uid + " created successfully!");
				  }).catch(function(error) {
					if(error.message){
						$('.regmsgvalidate').html('<div class="alert alert-danger alert-dismissable fade in">'+error.message+'</div>');
					} 		

					$('form input').removeClass('invalidField');	
					
					if(error.code === "auth/invalid-email"){
						$('#regemail').addClass('invalidField');
					} else if(error.code === "auth/weak-password"){
						$('#regpwd').addClass('invalidField');					
					} else {
						$('#regemail,#regpwd').removeClass('invalidField');					
					}  
					// console.error("Error: ", error);
				  });
			} else {
				$('form input').removeClass('invalidField');	
				$('#regcpwd').addClass('invalidField');		
				$('.regmsgvalidate').html('<div class="alert alert-danger alert-dismissable fade in">Confirm password doesnot match password.</div>');
				//console.error("Error: ","Confirm password doesnot match password");
			}
			
			
		}
}]);
