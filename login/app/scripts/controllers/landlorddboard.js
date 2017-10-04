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
			console.log(snapshot.val())
			$scope.$apply(function(){
				$.map(snapshot.val(), function(value, index) {
					
					if(value.schedulestatus == "confirmed" && moment(value.dateslot).isBefore(new Date()) ) {
						vm.viewed += 1;
					} 
					if(value.schedulestatus == "confirmed" && moment(value.dateslot).isAfter(new Date())) {
						vm.viewingschedule += 1;
					}
					if(value.schedulestatus == "confirmed" && moment(value.dateslot).isSame(new Date())  &&   moment(value.fromtimeslot).format('HH:mm') < moment(new Date()).format('HH:mm') &&  moment(value.toslot).format('HH:mm') < moment(new Date()).format('HH:mm')) {
						vm.viewed += 1;
					}
					if(value.schedulestatus == "confirmed" && moment(value.dateslot).isSame(new Date())  &&   moment(value.fromtimeslot).format('HH:mm') >= moment(new Date()).format('HH:mm') &&  moment(value.toslot).format('HH:mm') >= moment(new Date()).format('HH:mm')) {
						vm.viewingschedule += 1;
					}
					
				});	
			});
		   
		});
		
}])