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
	
	$scope.$on('gmPlacesAutocomplete::placeChanged', function(){
      var address = vm.prop.address.getPlace();
	  // console.log(address);
	  vm.prop.address = address.formatted_address;
	  $scope.$apply();
	});
	
	
	vm.copy = "Copy link";		
	$scope.copySuccess = function(e) {
		console.info('Action:', e.action);
		console.info('Text:', e.text);
		console.info('Trigger:', e.trigger);
		vm.copy = "Copied";
		// e.clearSelection();
	
		console.log(vm.copy);
		$scope.$apply();
	};
	
	console.log(vm.copy);
	
	// timeSlot for Date and Timepicker
	vm.addTimeSlot = function(slotlen){
		vm.timeSlot.push({date:todaydate});
	}
	
	// to remove timeslots
	vm.removeTimeSlot = function(slotindex){
		if($state.current.name == 'editprop') {
			if ($window.confirm("Are you sure you want to delete this viewing slot? All schedules will be cancelled"))  {			
				vm.slot = slotsBuildService.maketimeslotsingle(moment(vm.prop.date[slotindex]).format('DD-MMMM-YYYY'),vm.prop.fromtime[slotindex],vm.prop.to[slotindex]);
				
				firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snapshot) {	
					$scope.$apply(function(){
						// console.log(snapshot.val());
						vm.appliedslots = [];
						if(snapshot.val() != undefined){
							vm.appliedslots = $.map(snapshot.val(), function(value, index) {							
								return [{date:value.dateslot, fromtime:value.fromtimeslot, to:value.toslot, scheduleID: index}];
							});
						}
						
						console.log(vm.slot);
						console.log(vm.appliedslots);
						
						vm.scheduleIDs = [];
						for (var i = 0; i < vm.slot.length; i++) {
							for (var j = 0; j < vm.appliedslots.length; j++) {
								if (vm.slot[i].date == vm.appliedslots[j].date &&  vm.slot[i].fromtime == vm.appliedslots[j].fromtime && vm.slot[i].to == vm.appliedslots[j].to	) {					
									// firebase.database().ref('applyprop/'+(vm.slot[i].scheduleID)).remove();
									// console.log(vm.appliedslots[j].scheduleID);
									vm.scheduleIDs.push(vm.appliedslots[j].scheduleID);
								}							
							}
						}	
						console.log(vm.scheduleIDs);						
					});	
				});
				
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
			
		// angular.forEach(vm.prop.limit, function(lval, key) {
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
				// console.log("Date time SLot");
				
				if(vm.prop.limit[key] > subslots){
					// vm.prop.limit[key] = '';
					vm.prop.invalid[key] = 1;
				} else {
					vm.prop.invalid[key] = 0;
				}
			}
								
		// });
	  };

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
				// console.log(fromtime[key]);
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
				// console.log(snapshot.key);
				
				if(snapshot.key != "undefined"){
					var propertylink = "http://35.182.211.61/login/dist/#/applyproperty/"+snapshot.key;
					vm.prop.propertylink = propertylink;	
					
					// link generated and property added message
					console.log('Property added successfully. Property Link is also generated.');
					$rootScope.success = 'Property added successfully. Property Link is also generated.';
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
				// link generated and property added message
				$scope.$apply(function(){
					// $rootScope.success = 'Property edited successfully.';
					localStorage.setItem('propertysuccessmsg','Property edited successfully.');
					angular.forEach(vm.scheduleIDs, function(value, key) {
						firebase.database().ref('applyprop/'+value).update({	
							schedulestatus: "cancelled"
						})
						console.log(value);
					});			
					$state.go('viewprop');
				});
				$window.scrollTo(0, 0);
			})
		}
	}
	
	
	// View Property
	// vm.viewprops = {};
	if($state.current.name == 'viewprop') {
		var landlordID = localStorage.getItem('userID');
		var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val()) {
			 		vm.viewprops = snapshot.val();
			 		vm.propsavail = 1;
					vm.propsuccess = localStorage.getItem('propertysuccessmsg');
					vm.success = 1;
				}
			 	else {
			 		vm.propsavail = 0;
					vm.propsuccess = localStorage.getItem('propertysuccessmsg');
					vm.success = 1;
			 	}
				console.log("here:"+localStorage.getItem('propertysuccessmsg'));
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
					propertylink: propData.propertylink
				}
				angular.forEach(propData.date, function(value, key) {
					console.log(value);
				  vm.timeSlot.push({date: new Date(value)});
				  vm.prop.date.push(new Date(value));
				  vm.prop.fromtime.push(new Date(propData.fromtime[key]));
				  vm.prop.to.push(new Date(propData.to[key]));
				  vm.prop.limit.push(propData.limit[key]);
				  vm.prop.multiple.push(propData.multiple[key]);				  
				});
				
				console.log(vm.timeSlot)
			});
		});
	} else {
		vm.mode = 'Add';
		vm.submitaction = "Save";		
		vm.otheraction = "Cancel";
		vm.timeSlot = [{date:todaydate}];
		// vm.prop.invalid = [0];
		vm.prop = {
			propID: '',
			landlordID: '',
			propimg : '',
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
			propertylink: '',
			invalid: [0]
		}
		
	}
	
	// Delete Property Permanently
	this.delprop = function(propID){
		// console.log("delete action");
		var propertyObj = $firebaseAuth();
		var propdbObj = firebase.database();
		if ($window.confirm("Do you want to continue?"))  {
			propdbObj.ref('properties/'+propID).remove();
			$state.go('viewprop');
		}		
	}
}])
	
	