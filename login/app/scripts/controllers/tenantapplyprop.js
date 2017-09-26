'use strict';

//=================================================
// Apply Property
//=================================================

vcancyApp.controller('applypropCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window) {
	
	var vm = this;
	// Fetching property Data
	var ref = firebase.database().ref("/properties/"+$stateParams.propId).once('value').then(function(snapshot) {
	var propData = snapshot.val();
	vm.timeSlot = [];
	$scope.$apply(function(){
		vm.applyprop = {
			propID: snapshot.key,
			landlordID: propData.landlordID,
			propimg : propData.propimg,
			propstatus : propData.propstatus,
			proptype : propData.proptype,
			units : propData.units,
			shared : propData.shared,
			address : propData.address,
			date : [],
			fromtime : [],
			to : [],
			limit : [],
			propertylink: propData.propertylink
		}
		angular.forEach(propData.date, function(value, key) {
			// console.log(value);
		  vm.applyprop.date.push(value);
		  vm.applyprop.fromtime.push(propData.fromtime[key]);
		  vm.applyprop.to.push(propData.to[key]);
		  vm.applyprop.limit.push(propData.limit[key]);
		});
		
		// If property is inactive tenant can't apply for the application
		if(vm.applyprop.propstatus == false){
			$state.go('tenantdashboard');
		}
		
	});
	});
	
	
	// Property Application form - Data of tenant save		
	vm.tenantapply = function(applyprop){
		// console.log(vm.applyprop);
		var tenantID = localStorage.getItem('userID');
		var propID = vm.applyprop.propID;
		var name = vm.applyprop.name;
		var tenantlocation = vm.applyprop.tenantlocation;
		var age = vm.applyprop.age; 
		var jobtitle = vm.applyprop.jobtitle; 
		var landlordID =  vm.applyprop.landlordID;
		var description = vm.applyprop.description; 
		var datetimeslot = vm.applyprop.datetimeslot;
		
		var applypropObj = $firebaseAuth();			
		var applypropdbObj = firebase.database();
		
		applypropdbObj.ref('applyprop/').push().set({
			tenantID: tenantID,
			propID : propID,
			name : name,
			tenantlocation : tenantlocation,
			age : age, 
			jobtitle : jobtitle, 
			landlordID :  landlordID,
			description : description, 
			datetimeslot : datetimeslot	
		}).then(function(){
			$state.go('applicationThanks');
			// $rootScope.success = 'Application for property successfully sent!';	
			console.log('Application for property successfully sent!');
		})	
	}

}])