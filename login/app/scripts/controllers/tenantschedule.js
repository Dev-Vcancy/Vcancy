'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
    .controller('tenantscheduleCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {
		
		var vm = this;
		var tenantID = localStorage.getItem('userID');
		
		var propdbObj = firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val()) {
					//to map the object to array
					vm.tabledata = $.map(snapshot.val(), function(value, index) {
						if(value.schedulestatus !== "removed") {
							return [{scheduleID:index, address:value.address, dateslot: value.dateslot, timerange: value.timerange,  schedulestatus: value.schedulestatus}];
						}
					});			
						
		
					vm.cols = [
						  { field: "address", title: "Address", sortable: "address", show: true },
						  { field: "dateslot", title: "Date", sortable: "dateslot", show: true },					  
						  { field: "timerange", title: "Time", sortable: "timerange", show: true },
						  { field: "schedulestatus", title: "Status", sortable: "schedulestatus", show: true }
						];
						
					vm.extracols = [
							{ field: "", title: "", show: true}
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
		
		vm.cancelschedule = function(index){
			// console.log(index);
			if ($window.confirm("Do you want to continue cancelling of schedule?"))  {
				firebase.database().ref('applyprop/'+index).update({	
					schedulestatus: "cancelled"
				})
				$state.reload();
			}
		}
}])