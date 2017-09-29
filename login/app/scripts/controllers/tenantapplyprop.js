'use strict';

//=================================================
// Apply Property
//=================================================

vcancyApp.controller('applypropCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','slotsBuildService',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window,$filter,slotsBuildService) {
	
	var vm = this;
	
	// Fetching property Data
	var ref = firebase.database().ref("/properties/"+$stateParams.propId).once('value').then(function(snapshot) {
		var propData = snapshot.val();
		vm.timeSlot = [];
		vm.slots = [];
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
			  
			  vm.slots.push(slotsBuildService.maketimeslots(vm.applyprop.date[key],new Date(vm.applyprop.fromtime[key]),new Date(vm.applyprop.to[key])));
			});
			
			// If property is inactive tenant can't apply for the application
			if(vm.applyprop.propstatus == false){
				$state.go('tenantdashboard');
			}
			
		});
	});
	
	firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snapshot) {	
		$scope.$apply(function(){
			vm.appliedslots = [];
			console.log(snapshot.val());
			vm.appliedslots = $.map(snapshot.val(), function(value, index) {							
					return [{date:value.dateslot, fromtime:value.fromtimeslot, to:value.toslot}];
				});	 	
			});	console.log(vm.appliedslots);
	
	console.log(vm.appliedslots.length);
		});	
	
	
	// Property Application form - Data of tenant save		
	vm.tenantapply = function(applyprop){
		// console.log(vm.applyprop);
		var tenantID = localStorage.getItem('userID');
		var propID = vm.applyprop.propID;
		var address = vm.applyprop.address;
		var name = vm.applyprop.name;
		var tenantlocation = vm.applyprop.tenantlocation;
		var age = vm.applyprop.age; 
		var jobtitle = vm.applyprop.jobtitle; 
		var landlordID =  vm.applyprop.landlordID;
		var description = vm.applyprop.description; 
		var datetimeslot = vm.applyprop.datetimeslot;
		var dateslot = moment(vm.applyprop.date[datetimeslot]).format('DD-MMMM-YYYY');
		var fromtimeslot = vm.applyprop.fromtime[datetimeslot];
		var toslot = vm.applyprop.to[datetimeslot];
		var timerange = moment(vm.applyprop.fromtime[datetimeslot]).format('hh:mm A')+" - "+moment(vm.applyprop.to[datetimeslot]).format('hh:mm A');
		
		console.log(dateslot,fromtimeslot,toslot);
		
		
		var applypropObj = $firebaseAuth();			
		var applypropdbObj = firebase.database();
		
		applypropdbObj.ref('applyprop/').push().set({
			tenantID: tenantID,
			propID : propID,
			address: address,
			schedulestatus: "pending",
			name : name,
			tenantlocation : tenantlocation,
			age : age, 
			jobtitle : jobtitle, 
			landlordID :  landlordID,
			description : description, 
			datetimeslot : datetimeslot,
			dateslot: dateslot,
			fromtimeslot: fromtimeslot,
			toslot: toslot,
			timerange: timerange
		}).then(function(){
			$state.go('applicationThanks');
			// $rootScope.success = 'Application for property successfully sent!';	
			console.log('Application for property successfully sent!');
		})	
	}

}])