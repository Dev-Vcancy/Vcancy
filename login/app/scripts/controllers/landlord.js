'use strict';

//=================================================
// Landlord Dashboard
//=================================================

vcancyApp.controller('dboardCtrl', ['$scope','$firebaseAuth','$state',function($scope,$firebaseAuth,$state) {
	var authObj = $firebaseAuth();
		 
	 console.log(firebase.auth().currentUser);
	
	 console.log("Signed in as:", firebase.auth().uid);
			
}]);
