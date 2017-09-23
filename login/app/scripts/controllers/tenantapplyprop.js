'use strict';

//=================================================
// Apply Property
//=================================================

vcancyApp.controller('applypropCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window) {
	
	var vm = this;
	
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
			console.log(value);
		  vm.timeSlot.push({date: new Date(value)});
		  vm.applyprop.date.push(value);
		  vm.applyprop.fromtime.push(propData.fromtime[key]);
		  vm.applyprop.to.push(propData.to[key]);
		  vm.applyprop.limit.push(propData.limit[key]);
		});
		
		console.log(vm.timeSlot)
	});
	});
	
	
	// Property Apply form data save		
	vm.applyProp = function(applydata){
		// console.log(applydata);
		
		var propID = applydata.propID;
		var name = applydata.name;
		var location = applydata.location;
		var age = applydata.age; 
		var jobtitle = applydata.jobtitle; 
		var landlordID =  applydata.landlordID;
		var description = applydata.description; 
		var selectslot = applydata.selectslot;
		
		var applypropObj = $firebaseAuth();			
		var applypropdbObj = firebase.database();
		
		// applypropdbObj.ref('applyprop/').push().set({	
			// landlordID: landlordID,
			// propimg: propimg,
			// propstatus: propstatus,
			// proptype: proptype,
			// units: units,
			// shared: shared, 
			// address: address, 
			// date: date,
			// fromtime: fromtime,
			// to: to,
			// limit: limit
		// }).then(function(){
			// $rootScope.success = 'Property added successfully. Property Link is also generated.';			
		// })	
	}

}])