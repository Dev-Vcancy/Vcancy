'use strict';

//=================================================
// PROPERTY
//=================================================

vcancyApp.controller('propertyCtrl', ['$scope','$firebaseAuth','$state','$rootScope',function($scope,$firebaseAuth,$state,$rootScope) {
	var today = new Date();
	var vm = this;
	vm.timeSlot = [{date:today}];
	
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

	  vm.ismeridian = false;
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
	
	
	vm.addTimeSlot = function(slotlen){
		vm.timeSlot.push({date:today});
	}
	vm.propForm = function(){
		// var propimg = '';
		// var onoff = '';
		// var proptype = '';
		// var units = '';
		// var shared = ''; 
		// var address = ''; 
		// var date = '';
		// var from = '';
		// var to = '';
		// var limit = '';
	}
		
	vm.submitProp = function(property){
			console.log(property);
			var propimg = $('#propimg').val();	
			var onoff = property.onoff;
			var proptype = property.proptype;
			var units = property.units;
			var shared = property.shared; 
			var address = property.address; 
			// var d = property.date;
			// var date = d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear();
			// var f = property.fromtime;
			// var fromtime = f.getHours() + ":" + f.getMinutes();
			// var t = property.to	;		
			// var to = t.getHours() + ":" + t.getMinutes();
			// var limit = property.limit;		
			
			var date = [];
			var fromtime = [];
			var to = [];
			var limit = [];
			
			angular.forEach(property.date, function(d, key) {
				date[key] = d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear();
			});
			angular.forEach(property.fromtime, function(f, key) {
				fromtime[key] = f.getHours() + ":" + f.getMinutes();
			});
			angular.forEach(property.to, function(t, key) {
				to[key] = t.getHours() + ":" + t.getMinutes();
			});
			angular.forEach(property.limit, function(value, key) {
				limit[key] = value;
			});
				
			console.log(date,fromtime,to);
			
			$rootScope.invalid = '';
			$rootScope.success = '';
			$rootScope.error = '';
			
			var propertyObj = $firebaseAuth();
			
			var propdbObj = firebase.database();
			// var newPostRef = postListRef.push();
				
			propdbObj.ref('properties/').push().set({					
				propimg: propimg,
				onoff: onoff,
				proptype: proptype,
				units: units,
				shared: shared, 
				address: address, 
				date: date,
				fromtime: fromtime,
				to: to,
				limit: limit
		}).then(function onSuccess(res) {
			$state.go('viewprop');
		  })	;	
	}
	//vm.viewprops = {};
	if($state.current.name == 'viewprop') {
		
		var propdbObj = firebase.database().ref('properties/').on("value", function(snapshot) {
			
			console.log(snapshot.val())
			$scope.$apply(function(){
			  vm.viewprops = snapshot.val();
			});
		   
		});
	}
	
	
	
}])
	
	