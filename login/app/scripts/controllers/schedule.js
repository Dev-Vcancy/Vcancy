'use strict';

//=================================================
// Landlord Schedule
//=================================================

vcancyApp
    .controller('scheduleCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce,NgTableParams) {
		
		var vm = this;
		var landlordID = localStorage.getItem('userID');
		
		var propdbObj = firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val()) {
					//to map the object to array
					vm.tabledata = $.map(snapshot.val(), function(value, index) {
						return [value];
					});
		
					vm.cols = [
						  { field: "name", title: "Name", sortable: "name", show: true },
						  { field: "tenantlocation", title: "Location", sortable: "tenantlocation", show: true },
						  { field: "jobtitle", title: "Profession", sortable: "jobtitle", show: true },
						  { field: "age", title: "Age", sortable: "age", show: true },
						  { field: "datetimeslot", title: "Date/Time", sortable: "datetimeslot", show: true },
						  { field: "description", title: "About", sortable: "description", show: true }
						];
					
					//Sorting
					vm.tableSorting = new NgTableParams({
						// page: 1,            // show first page
						// count: 10,           // count per page
						sorting: {
							name: 'asc'     // initial sorting
						}
					}, {
						total: vm.tabledata.length, // length of data
						getData: function($defer, params) {
							// console.log(params);
							// use build-in angular filter
							var orderedData = params.sorting() ? $filter('orderBy')(vm.tabledata, params.orderBy()) : vm.tabledata;
				
							$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
						}
						 // dataset: vm.tabledata
					})
				} else {
					
				}
			});
		});
}])