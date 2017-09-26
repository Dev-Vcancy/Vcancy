'use strict';

//=================================================
// PROPERTY
//=================================================

vcancyApp.controller('propertyCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window) {
	$rootScope.invalid = '';
	$rootScope.success = '';
	$rootScope.error = '';		
		
	var todaydate = new Date();
	var vm = this;
	vm.propsavail = 1;
	
	$scope.$on('gmPlacesAutocomplete::placeChanged', function(){
      var address = vm.prop.address.getPlace();
	  vm.prop.address = address.formatted_address;
	  $scope.$apply();
	});
	
	
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

	  vm.changed = function () {

	  };

	  vm.clear = function() {
		vm.mytime = null;
	  };
	
	// timeSlot for Date and Timepicker
	vm.addTimeSlot = function(slotlen){
		vm.timeSlot.push({date:todaydate});
	}
	
	// to remove timeslots
	vm.removeTimeSlot = function(slotindex){
		console.log(slotindex);
		console.log(vm.prop.limit[slotindex]);
		vm.timeSlot.splice(slotindex,1);
		vm.prop.date.splice(slotindex,1);
		vm.prop.fromtime.splice(slotindex,1);
		vm.prop.to.splice(slotindex,1);
		vm.prop.limit.splice(slotindex,1);		
	}
	
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
			var landlordID = localStorage.getItem('userID');
			var date = [];
			var fromtime = [];
			var to = [];
			var limit = [];			
			angular.forEach(property.limit, function(lval, key) {
				date[key] = property.date[key].toString();
				fromtime[key] = property.fromtime[key].toString();
				to[key] = property.to[key].toString();
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
				shared: shared, 
				address: address, 
				date: date,
				fromtime: fromtime,
				to: to,
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
					$window.scrollTo(0, 0);
					
					vm.prop.propertylink = propertylink;				
					$('#propertylink').val(propertylink);	
					
					// update the property link to property table
					propdbObj.ref('properties/'+snapshot.key).update({	
						propertylink: propertylink
					})
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
					shared: shared, 
					address: address, 
					date: date,
					fromtime: fromtime,
					to: to,
					limit: limit
			}).then(function(){
				// link generated and property added message
				$scope.$apply(function(){
					$rootScope.success = 'Property edited successfully.';
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
				}
			 	else {
			 		vm.propsavail = 0;
			 	}
			});
		   
		});
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
				  vm.prop.date.push(new Date(value));
				  vm.prop.fromtime.push(new Date(propData.fromtime[key]));
				  vm.prop.to.push(new Date(propData.to[key]));
				  vm.prop.limit.push(propData.limit[key]);
				});
				
				console.log(vm.timeSlot)
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
			propstatus : '',
			proptype : '',
			units : '',
			shared : '',
			address : '',
			date : [],
			fromtime : [],
			to : [],
			limit : [],
			propertylink: ''
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
	
	