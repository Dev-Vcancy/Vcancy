'use strict';

//=================================================
// PROPERTY
//=================================================

vcancyApp.controller('propertyCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$sce',function($scope,$firebaseAuth,$state,$rootScope,$sce) {
	
	this.timeSlot = [0];
	// $scope.today = function() {
            // $scope.dt = new Date();
        // };
        // $scope.today();


        // $scope.toggleMin = function() {
            // $scope.minDate = $scope.minDate ? null : new Date();
        // };
        // $scope.toggleMin();

        // $scope.open = function($event, opened) {
            // $event.preventDefault();
            // $event.stopPropagation();

            // $scope[opened] = true;
        // };

        // $scope.dateOptions = {
            // formatYear: 'yy',
            // startingDay: 1
        // };

        // $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        // $scope.format = $scope.formats[0];
	
	
	
	this.addTimeSlot = function(slotlen){
		this.timeSlot.push(slotlen+1);
	}
	this.propForm = function(){
		// var propimg = '';
		// var onoff = '';
		// var proptype = '';
		// var units = '';
		// var shared = ''; 
		// var address = ''; 
		// var date = '';
		// var time = '';
		// var limit = '';
	}
	
	
	this.submitProp = function($property){
			// console.log($property);
			// var propimg = $property.propimg;	
			// var onoff = $property.onoff;
			// var proptype = $property.proptype;
			// var units = $property.units;
			// var shared = $property.shared; 
			// var address = $property.address; 
			// var date = $property.date;
			// var time = $property.time;
			// var limit = $property.limit;			
			
			// $rootScope.invalid = '';
			// $rootScope.success = '';
			// $rootScope.error = '';
			
			// var propertyObj = $firebaseAuth();
			
			// var propdbObj = firebase.database();
				// propdbObj.ref('property/').set({
					// onoff: onoff,
					// propimg: propimg,
					// proptype: proptype,
					// units: units,
					// shared: shared, 
					// address: address, 
					// date: date,
					// time: time
			// });	
		}
	
}])
	
	