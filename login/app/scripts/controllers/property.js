'use strict';

//=================================================
// PROPERTY
//=================================================

vcancyApp.controller('propertyCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','slotsBuildService',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window,slotsBuildService) {
	$rootScope.invalid = '';
	$rootScope.success = '';
	$rootScope.error = '';	
	
	var todaydate = new Date();
	var vm = this;
	vm.propsavail = 1;
	vm.timeslotmodified = "false";
	
	$scope.$on('gmPlacesAutocomplete::placeChanged', function(){
      var address = vm.prop.address.getPlace();
	  vm.prop.address = address.formatted_address;
	  $scope.$apply();
	});
	
	vm.copy = "Copy link";		
	$scope.copySuccess = function(e) {
		console.info('Action:', e.action);
		console.info('Text:', e.text);
		console.info('Trigger:', e.trigger);
		vm.copy = "Copied";	
		$scope.$apply();
	};
		
	// timeSlot for Date and Timepicker
	vm.addTimeSlot = function(slotlen){
		console.log(slotlen);
		vm.timeSlot.push({date:todaydate});
		vm.prop.multiple[slotlen] = true;
	}
	
	// to remove timeslots
	vm.removeTimeSlot = function(slotindex){
		if($state.current.name == 'editprop') {
			if ($window.confirm("Are you sure you want to delete this viewing slot? "))  {	
				vm.timeslotmodified = "true";
				vm.timeSlot.splice(slotindex,1);
				vm.prop.date.splice(slotindex,1);
				vm.prop.fromtime.splice(slotindex,1);
				vm.prop.to.splice(slotindex,1);
				vm.prop.limit.splice(slotindex,1);	
				vm.prop.multiple.splice(slotindex,1);
			}			
		} else {
			vm.timeSlot.splice(slotindex,1);
			vm.prop.date.splice(slotindex,1);
			vm.prop.fromtime.splice(slotindex,1);
			vm.prop.to.splice(slotindex,1);
			vm.prop.limit.splice(slotindex,1);	
			vm.prop.multiple.splice(slotindex,1);
		}			
	}
	
	// DATEPICKER
	vm.today = function() {
		vm.dt = new Date();
	};
	vm.today();

	vm.toggleMin = function() {
		vm.minDate = vm.minDate ? null : new Date();
	};
	vm.toggleMin();

	vm.open = function($event, opened) {
		$event.preventDefault();
		$event.stopPropagation();
		angular.forEach(vm.timeSlot, function(value, key) {
		  value.opened = false;;
		});
		opened.opened = true;
	};

	vm.dateOptions = {
		formatYear: 'yy',
		startingDay: 1
	};

	vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	vm.format = vm.formats[0];
		
	vm.timeopen = function($event,opened) {
		$event.preventDefault();
		$event.stopPropagation();
		angular.forEach(vm.timeSlot, function(value, key) {
		  value.opened = false;;
		});
		vm.opened = true;
	  }; 
	
	//  TIMEPICKER
	vm.mytime = new Date();

	vm.hstep = 1;
	vm.mstep = 5;
		
	// vm.prop.fromtime = new Date();
	// vm.prop.time = new Date();	  
	// vm.prop.time.setMinutes(vm.prop.time.getMinutes() + 30);

	// vm.changed = function() {
	  // console.log("SAda"+vm.prop.fromtime)
	// if (vm.prop.to <= vm.prop.fromtime) {
	  // vm.prop.to = new Date(vm.prop.fromtime.getTime() + 1 * 60000)
	// }
	// }

	  
	vm.options = {
		hstep: [1, 2, 3],
		mstep: [1, 5, 10, 15, 25, 30]
	};

	vm.ismeridian = true;
	vm.toggleMode = function() {
		vm.ismeridian = ! vm.ismeridian;
	};

	vm.update = function() {
		var d = new Date();
		d.setHours( 14 );
		d.setMinutes( 0 );
		vm.mytime = d;
	};

	vm.datetimeslotchanged = function (key) {
		console.log("Date time SLot");
		vm.timeslotmodified = "true";
		if(vm.prop.fromtime[key] === undefined){
			var fromtime  =  new Date();			
		} else {
			var fromtime= vm.prop.fromtime[key];	
		}
		
		if(vm.prop.to[key] === undefined){
			var to = new Date();	
		} else {
			var to = vm.prop.to[key];	
		}
		// if (vm.prop.to <= vm.prop.fromtime) {
		  // vm.prop.to = new Date(vm.prop.fromtime.getTime() + 1 * 60000)
		// }
				
		console.log(vm.prop.multiple[key],fromtime,to);
		
		if(vm.prop.multiple[key] === false || vm.prop.multiple[key] === undefined){
			var minutestimediff = (to - fromtime)/ 60000;
			var subslots = Math.floor(Math.ceil(minutestimediff)/30);				
			console.log(minutestimediff,subslots);
			
			if(vm.prop.limit[key] > subslots){
				vm.prop.invalid[key] = 1;
				vm.isDisabled = 1;
			} else {
				vm.prop.invalid[key] = 0;
				vm.isDisabled = 0;
			}
		} else {
			vm.prop.invalid[key] = 0;
			vm.isDisabled = 0;
		}
	}

	vm.clear = function() {
		vm.mytime = null;
	};
		
	// Go Back To View Property
	vm.backtoviewprop = function(){
		$state.go('viewprop');
	}	
	
	// Add/Edit Property		
	vm.submitProp = function(property){
			console.log(property);
			
			var propID = property.propID;
			var propimg = $('#propimg').val();	
			var propstatus = property.propstatus  == '' ? false : property.propstatus ; 
			var proptype = property.proptype;
			var units = property.units;
			var shared = property.shared  == '' ? false : property.shared ; 
			var address = property.address; 
			var rent = property.rent; 
			var landlordID = localStorage.getItem('userID');
			var date = [];
			var fromtime = [];
			var to = [];
			var limit = [];	
			var multiple = [];		
			angular.forEach(property.limit, function(lval, key) {
				date[key] = property.date[key].toString();
				if(property.fromtime[key] === undefined){
					fromtime[key]  =  new Date().toString();				
				} else {
					fromtime[key] = property.fromtime[key].toString();					
				}
				
				if(property.to[key] === undefined){
					to[key] = new Date().toString();	
				} else {
					to[key] = property.to[key].toString();	
				}			
				multiple[key] = property.multiple[key]   == '' ? false : property.multiple[key];
				limit[key] = lval;
			});
						
			$rootScope.invalid = '';
			$rootScope.success = '';
			$rootScope.error = '';
			
			var propertyObj = $firebaseAuth();
			
			var propdbObj = firebase.database();
		if(propID == ''){	
			propdbObj.ref('properties/').push().set({	
				landlordID: landlordID,
				propimg: propimg,
				propstatus: propstatus,
				proptype: proptype,
				units: units,
				rent: rent,
				shared: shared, 
				address: address, 
				date: date,
				fromtime: fromtime,
				to: to,
				multiple: multiple,
				limit: limit
			}).then(function(){
			  //Generate the property link
			  propdbObj.ref('properties/').limitToLast(1).once("child_added", function (snapshot) {
				
				if(snapshot.key != "undefined"){
					var propertylink = "http://35.182.211.61/login/dist/#/applyproperty/"+snapshot.key;
					vm.prop.propertylink = propertylink;	
					
					// link generated and property added message
					localStorage.setItem('propertysuccessmsg','Property added successfully. Property Link is also generated.');
					$window.scrollTo(0, 0);
					
					vm.prop.propertylink = propertylink;				
					$('#propertylink').val(propertylink);	
					
					// update the property link to property table
					propdbObj.ref('properties/'+snapshot.key).update({	
						propertylink: propertylink
					})
					
					$state.go('viewprop');
					
				// reset the add property form
				vm.timeSlot = [{date:todaydate}];
				$scope.$apply(function(){
					vm.prop = {
						propID: '',
						landlordID: '',
						propimg : ' ',
						propstatus : '',
						proptype : '',
						units : '',
						multiple: [],
						rent: '',
						shared : '',	
						address : '',
						date : [],
						fromtime : [],
						to : [],
						limit : [],
						propertylink: ''
					}
					$('#propertylink').val('');
				});
				}				
			  })
			});
		} else {
			/*if(vm.timeslotmodified == "true"){
				var confirmText = "Are you sure you want to update these viewing slots? All schedules will be cancelled those will not belong to these viewing slots";
			} else {
				var confirmText = "Are you sure you want to update the property?";
			}*/
			
			
				propdbObj.ref('properties/'+propID).update({
						propimg: propimg,
						propstatus: propstatus,
						proptype: proptype,
						units: units,
						rent: rent,
						shared: shared, 
						multiple: multiple,
						address: address, 
						date: date,
						fromtime: fromtime,
						to: to,
						limit: limit
				}).then(function(){
					firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snap) {
						if(snap.val() != null) {								
							$.map(snap.val(), function(v, k) {
								firebase.database().ref('applyprop/'+k).update({
									address: address,
									units: units
								});
							});
						}
					});
					
					vm.slots = slotsBuildService.maketimeslots(date,fromtime,to,limit,multiple);
					
					firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snapshot) {	
						$scope.$apply(function(){
							vm.appliedslots = [];
							vm.scheduleIDs = [];
							
							if(snapshot.val() != undefined){
								vm.appliedslots = $.map(snapshot.val(), function(value, index) {							
									if(value.schedulestatus !== "cancelled"){	
										vm.scheduleIDs.push(index);
										return [{date:value.dateslot, fromtime:moment(value.fromtimeslot).format('HH:mm'), to:moment(value.toslot).format('HH:mm'),scheduleID:index}];				
									}
								});
							}
							
							console.log(vm.slots);
							console.log(vm.appliedslots);	
														
							for (var i = 0; i < vm.slots.length; i++) {
								for (var j = 0; j < vm.appliedslots.length; j++) {
									if (moment(vm.slots[i].date).format('DD-MMMM-YYYY') == vm.appliedslots[j].date &&  moment(vm.slots[i].fromtime).format('HH:mm') == vm.appliedslots[j].fromtime && moment(vm.slots[i].to).format('HH:mm') == vm.appliedslots[j].to) {					
										var index = vm.scheduleIDs.indexOf(vm.appliedslots[j].scheduleID);
										if (index > -1) {
										   vm.scheduleIDs.splice(index, 1);
										}
									} 				
								}
							}		
							
							// link generated and property added message
							localStorage.setItem('propertysuccessmsg','Property updated successfully.');
							angular.forEach(vm.scheduleIDs, function(value, key) {
								firebase.database().ref('applyprop/'+value).update({	
									schedulestatus: "cancelled"
								})
								console.log(value);
							});			
							$state.go('viewprop');
						});	
					});	
					
					$window.scrollTo(0, 0);
				})
		}
	}
	
	
	// View Property
	// vm.viewprops = {};
	if($state.current.name == 'viewprop') {
		vm.loader = 1;
		var landlordID = localStorage.getItem('userID');
		var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
			$scope.$apply(function(){
				vm.success = 0;
				if(snapshot.val()) {
			 		vm.viewprops = snapshot.val();
			 		vm.propsavail = 1;
					vm.propsuccess = localStorage.getItem('propertysuccessmsg');
				}
			 	else {
			 		vm.propsavail = 0;
					vm.propsuccess = localStorage.getItem('propertysuccessmsg');
			 	}
				vm.loader = 0;
				console.log($rootScope.$previousState.name);
				if(($rootScope.$previousState.name == "editprop" || $rootScope.$previousState.name == "addprop") && vm.propsuccess != ''){
					vm.success = 1;
				}
				localStorage.setItem('propertysuccessmsg','')
			});
		   
		});
			
	
		vm.toggleSwitch = function(key){
			console.log(key);
			var propstatus = !vm.viewprops[key].propstatus;
			console.log(propstatus);	
			
			// update the property status to property table
			firebase.database().ref('properties/'+key).update({	
				propstatus: propstatus
			})
			
		}
	
	
	}

	// Edit Property
	if($state.current.name == 'editprop') {
		vm.mode = 'Edit';
		vm.submitaction = "Update";
		vm.otheraction = "Delete";
		// console.log('here'+$stateParams.propId)
		var ref = firebase.database().ref("/properties/"+$stateParams.propId).once('value').then(function(snapshot) {
		  var propData = snapshot.val();
		  vm.timeSlot = [];
		  $scope.$apply(function(){
				vm.prop = {
					propID: snapshot.key,
					landlordID: propData.landlordID,
					propimg : propData.propimg,
					propstatus : propData.propstatus,
					proptype : propData.proptype,
					units : propData.units,
					rent: propData.rent,
					shared : propData.shared,
					address : propData.address,
					multiple: [],
					date : [],
					fromtime : [],
					to : [],
					limit : [],
					propertylink: propData.propertylink,
					invalid: [0]
				}
				angular.forEach(propData.date, function(value, key) {
				  vm.timeSlot.push({date: new Date(value)});
				  vm.prop.date.push(new Date(value));
				  vm.prop.fromtime.push(new Date(propData.fromtime[key]));
				  vm.prop.to.push(new Date(propData.to[key]));
				  vm.prop.limit.push(propData.limit[key]);
				  vm.prop.multiple.push(propData.multiple[key]);				  
				});
			});
		});
	} else {
		vm.mode = 'Add';
		vm.submitaction = "Save";		
		vm.otheraction = "Cancel";
		vm.timeSlot = [{date:todaydate}];
		vm.prop = {
			propID: '',
			landlordID: '',
			propimg : '',
			propstatus : true,
			proptype : '',
			units : '',
			multiple: [true],
			rent: '',
			shared : '',
			address : '',
			date : [],
			fromtime : [],
			to : [],
			limit : [],
			propertylink: '',
			invalid: [0]
		}
		
	}
	
	// Delete Property Permanently
	this.delprop = function(propID){
		var propertyObj = $firebaseAuth();
		var propdbObj = firebase.database();
		if ($window.confirm("Do you want to continue?"))  {
			propdbObj.ref('properties/'+propID).remove();
			firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snapshot) {	
				$scope.$apply(function(){
					vm.scheduleIDs = [];
					
					if(snapshot.val() != undefined){
						$.map(snapshot.val(), function(value, index) {	
							vm.scheduleIDs.push(index);	
						});
					}
					angular.forEach(vm.scheduleIDs, function(value, key) {
						firebase.database().ref('applyprop/'+value).update({	
							schedulestatus: "removed"
						})
					});	
				})
				$state.go('viewprop');
			})
		}
	}
}])
	
	