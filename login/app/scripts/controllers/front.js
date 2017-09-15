'use strict';

//=================================================
// LOGIN
//=================================================

vcancyApp.controller('loginCtrl', ['$scope','$firebaseAuth',function($scope,$firebaseAuth) {
        
		//console.log("1");
        //Status
        this.login = 1;
        this.register = 0;
        this.forgot = 0;
		//console.log(this.login);
		this.loginUser = function($user){
			var email = $user.email;
			var password = $user.password;
			//var firebaseObj = new Firebase("https://vcancy-5e3b4.firebaseio.com"); 
			
			var authObj = $firebaseAuth();
			authObj.$signInWithEmailAndPassword(email, password).then(function(firebaseUser) {
			  console.log("Signed in as:", firebaseUser.uid);
			}).catch(function(error) {
			  console.error("Authentication failed:", error.message);
			});
			
		}
		
		this.registerUser = function($reguser){
			console.log($reguser);
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
					var reguserdbObj = firebase.database();
					reguserdbObj.ref('users/' + firebaseUser.uid).set({
					firstname: first,
					lastname: last,
					usertype : usertype
				  });
				
				console.log("User " + firebaseUser.uid + " created successfully!");
			  }).catch(function(error) {
				console.error("Error: ", error);
			  });
			} else {
				console.error("Error: ","Confirm password doesnot match password");
			}
			
			
		}
}]);
