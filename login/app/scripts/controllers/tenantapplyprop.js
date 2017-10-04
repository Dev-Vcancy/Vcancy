'use strict';

//=================================================
// Apply Property
//=================================================

vcancyApp.controller('applypropCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','slotsBuildService',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window,$filter,slotsBuildService) {
	
	var vm = this;
	
	
	
	console.log(localStorage.getItem('userEmailVerified'));
	if(localStorage.getItem('userEmailVerified') == "false" || !$rootScope.emailVerified ){
		vm.isEmailVerified = 1;
	} else {
		vm.isEmailVerified = 0;
	}
	console.log(vm.isEmailVerified);
	
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
				multiple: [],
				propertylink: propData.propertylink
			}
			angular.forEach(propData.date, function(value, key) {
			  vm.applyprop.date.push(value);
			  vm.applyprop.fromtime.push(propData.fromtime[key]);
			  vm.applyprop.to.push(propData.to[key]);
			  vm.applyprop.limit.push(propData.limit[key]);
			  vm.applyprop.multiple.push(propData.multiple[key]);
			});
			
			vm.applyprop.slots = slotsBuildService.maketimeslots(vm.applyprop.date,vm.applyprop.fromtime,vm.applyprop.to,vm.applyprop.limit,vm.applyprop.multiple);
			
			// If property is inactive tenant can't apply for the application
			if(vm.applyprop.propstatus == false){
				$state.go('tenantdashboard');
			}
		});
		
		firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snapshot) {	
			$scope.$apply(function(){
				// console.log(snapshot.val());
				vm.appliedslots = [];
				if(snapshot.val() != undefined){
					vm.appliedslots = $.map(snapshot.val(), function(value, index) {			
						if(value.schedulestatus !== "cancelled"){
							return [{date:value.dateslot, fromtime:moment(value.fromtimeslot).format('HH:mm'), to:moment(value.toslot), person:1}];
						}						
					});
				}
					 
				// console.log(vm.applyprop.slots);
				// console.log(vm.appliedslots);	
				// console.log(vm.appliedslots.length);	

				vm.applyprop.availableslots = [];
				vm.timeslotavail = 0;
					
				for (var i = 0; i < vm.applyprop.slots.length; i++) {
					for (var j = 0; j < vm.appliedslots.length; j++) {
						if (moment(vm.applyprop.slots[i].date).format('DD-MMMM-YYYY') == vm.appliedslots[j].date &&  moment(vm.applyprop.slots[i].fromtime).format('HH:mm') == vm.appliedslots[j].fromtime && moment(vm.applyprop.slots[i].to).format('HH:mm') == vm.appliedslots[j].to && vm.applyprop.slots[i].multiple == false) {					
							vm.applyprop.slots[i].person = 0;
							// break;
						}
						
						if (moment(vm.applyprop.slots[i].date).format('DD-MMMM-YYYY') == vm.appliedslots[j].date &&  moment(vm.applyprop.slots[i].fromtime).format('HH:mm') == vm.appliedslots[j].fromtime && moment(vm.applyprop.slots[i].to).format('HH:mm') == vm.appliedslots[j].to && vm.applyprop.slots[i].multiple == true ) {
							for (var l = 0; l < vm.applyprop.slots.length; l++) {
								if(vm.applyprop.slots[l].dateslotindex ==  vm.applyprop.slots[i].dateslotindex){
									vm.applyprop.slots[l].person -= 1;
								}
							}
							// break;
						}
					// console.log(vm.applyprop.slots);
					}
				}
				
				
				for (var i = 0; i< vm.applyprop.slots.length; i++) {					
					if (vm.applyprop.slots[i].person > 0) {
						vm.applyprop.availableslots.push(vm.applyprop.slots[i]);
					}
					vm.timeslotavail = 1;
				}
				
				if(vm.appliedslots == null){
					vm.applyprop.availableslots = vm.applyprop.slots;
					vm.timeslotavail = 1;
				}
				// console.log(vm.applyprop.availableslots);
				
			});	
		});	
		
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
		var dateslot = moment(vm.applyprop.availableslots[datetimeslot].date).format('DD-MMMM-YYYY');
		var fslot = vm.applyprop.availableslots[datetimeslot].fromtime.toString();
		var tslot = vm.applyprop.availableslots[datetimeslot].to.toString();
		var timerange = moment(vm.applyprop.availableslots[datetimeslot].fromtime).format('hh:mm A')+" - "+moment(vm.applyprop.availableslots[datetimeslot].to).format('hh:mm A');
		
		// console.log(dateslot,fslot,tslot);
		
		
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
			datetimeslot : datetimeslot,
			dateslot : dateslot,
			fromtimeslot : fslot,
			toslot : tslot,
			jobtitle : jobtitle, 
			landlordID :  landlordID,
			description : description, 
			timerange: timerange
		}).then(function(){
			$state.go('applicationThanks');
			// $rootScope.success = 'Application for property successfully sent!';	
			console.log('Application for property successfully sent!');
		})	
	}

}])