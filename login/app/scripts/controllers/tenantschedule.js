'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
    .controller('tenantscheduleCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {
		
		var vm = this;
		vm.showCal = false;
		var tenantID = localStorage.getItem('userID');
		vm.loader = 1;
		
		var propdbObj = firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val() !== null) {
					vm.calendardata = $.map(snapshot.val(), function(value, index) {
						if(value.schedulestatus == "confirmed") {
							return [{scheduleID:index, className: 'bgm-cyan', title:value.address, start: value.dateslot}];
						}
					});						
					
					// vm.calendardata = [{scheduleID:"-KvaDdFDac3A_apLY-ce",className:"bgm-cyan",title:"Active kl",start:"24-September-2017"}]
					$scope.calendardata = vm.calendardata;
					
					console.log($scope.calendardata);
					
					//to map the object to array
					vm.tabledata = $.map(snapshot.val(), function(value, index) {
						if(value.schedulestatus !== "removed"  && value.schedulestatus !== "submitted") {
							return [{scheduleID:index, address:value.address, dateslot: value.dateslot, timerange: value.timerange,  schedulestatus: value.schedulestatus}];
						}
					});	
					
					vm.extracols = [
							{ field: "", title: "", show: true}
						];	
					vm.schedulesavail = 1;
				} else {
					vm.tabledata = [{scheduleID:'', address:'', dateslot: '', timerange: '',  schedulestatus: ''}];						
					vm.calendardata = [{scheduleID:'', className: 'bgm-cyan', title:'', start: ''}]						
					$scope.calendardata = vm.calendardata;					
					vm.schedulesavail = 0;
				}
					
				vm.cols = [
					  { field: "address", title: "Address", sortable: "address", show: true },
					  { field: "dateslot", title: "Date", sortable: "dateslot", show: true },					  
					  { field: "timerange", title: "Time", sortable: "timerange", show: true },
					  { field: "schedulestatus", title: "Status", sortable: "schedulestatus", show: true }
					];
					
				
				vm.loader = 0;
				
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
				
				vm.showCal = true;
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
