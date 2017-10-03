'use strict';

//=================================================
// Landlord Dashboard
//=================================================

vcancyApp
    .controller('landlorddboardlCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window) {
		
		var vm = this;
		var landlordID = localStorage.getItem('userID');
		vm.proplive = 0;
		vm.viewingschedule = 0;
		vm.viewed = 0;
		vm.submitapps = 0;
		
		var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				snapshot.forEach(function(childSnapshot) {
					// console.log(childSnapshot.val().propstatus);
					
					if(childSnapshot.val().propstatus == true){
						vm.proplive += 1;
					}
					
				});
			});
		   
		});
		
		var propdbObj = firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				snapshot.forEach(function(childSnapshot) {
					// console.log(childSnapshot.val().propstatus);
					
					// if(childSnapshot.val().schedulestatus == "pending"){
						vm.viewingschedule += 1;
						vm.viewed += 1;
					// }
					
				});
			});
		   
		});
		
		
		
		
}])