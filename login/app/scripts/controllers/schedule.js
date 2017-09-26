'use strict';

//=================================================
// Landlord Schedule
//=================================================

vcancyApp
    .controller('scheduleCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','ngTableParams','$sce',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, ngTableParams, $sce) {
		
		var vm = this;
		var landlordID = localStorage.getItem('userID');
		
		var propdbObj = firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val()) {					
					vm.tabledata = $.map(snapshot.val(), function(value, index) {
						return [value];
					});
					
					// console.log(Array.isArray(vm.tabledata));
		
					//Sorting
					vm.tableSorting = new ngTableParams({
						page: 1,            // show first page
						count: 10,           // count per page
						sorting: {
							name: 'asc'     // initial sorting
						}
					}, {
						total: vm.tabledata.length, // length of data
						getData: function($defer, params) {
							// use build-in angular filter
							var orderedData = params.sorting() ? $filter('orderBy')(vm.tabledata, params.orderBy()) : vm.tabledata;
				
							$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
						}
					})
				} else {
				}
			});
		   
		});
		
}])