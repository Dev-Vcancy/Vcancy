'use strict';

//=================================================
// Landlord Schedule
//=================================================

vcancyApp
    .controller('scheduleCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce,NgTableParams) {
		
		var vm = this;
		var landlordID = localStorage.getItem('userID');
	
		vm.propcheck = [];
		vm.schedulepropaddress = [];
		vm.loader = 1;
		vm.tablefilterdata = function(propID = '') {
			if(propID !=''){
				vm.propcheck[propID] = !vm.propcheck[propID];
			}
			
			vm.showCal = false;
			firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
				// console.log(snapshot.val())
				$scope.$apply(function(){
					if(snapshot.val() !== null) {
						$.map(snapshot.val(), function(value, index) {							
							 if(vm.schedulepropaddress.findIndex(x => x.propID == value.propID) == -1 && value.schedulestatus !== "removed" && value.schedulestatus !== "submitted") {
								  vm.schedulepropaddress.push({propID: value.propID, address: value.address}); 
								  vm.propcheck[value.propID] = true;
							 } 	
						});
						
						
						vm.calendardata = $.map(snapshot.val(), function(value, index) {
							if(value.schedulestatus == "confirmed" && (vm.propcheck[value.propID] == true || propID == '')) {
								return [{scheduleID:index, className: 'bgm-cyan', title:value.address, start: value.dateslot}];
							}
						});						
						
						// vm.calendardata = [{scheduleID:"-KvaDdFDac3A_apLY-ce",className:"bgm-cyan",title:"Active kl",start:"24-September-2017"}]
						$scope.calendardata = vm.calendardata;
						
						console.log($scope.calendardata);
						
						
						//to map the object to array
						vm.tabledata = $.map(snapshot.val(), function(value, index) {
							if(vm.propcheck[value.propID] == true || propID == ''){
								if(value.schedulestatus !== "removed" && value.schedulestatus !== "submitted") {
									return [{scheduleID:index, name:value.name, tenantlocation: value.tenantlocation, jobtitle: value.jobtitle, age: value.age, dateslot: value.dateslot, address:value.address, timerange: value.timerange, description: value.description, schedulestatus: value.schedulestatus}];
								}
							}
						});
						vm.extracols = [
							{ field: "", title: "", show: true}
						];
						vm.schedulesavail = 1;
					} else {
						vm.tabledata = [{scheduleID:'', name:'', tenantlocation: '', jobtitle: '', age: '', dateslot: '', address:'', timerange: '', description: '', schedulestatus: ''}];						
						vm.calendardata = [{scheduleID:'', className: 'bgm-cyan', title:'', start: ''}]						
						$scope.calendardata = vm.calendardata;
						
						vm.schedulesavail = 0;
					}
					
					vm.cols = [
						  { field: "name", title: "Name", sortable: "name", show: true },
						  { field: "tenantlocation", title: "Location", sortable: "tenantlocation", show: true },
						  { field: "jobtitle", title: "Profession", sortable: "jobtitle", show: true },
						  { field: "age", title: "Age", sortable: "age", show: true },
						  { field: "dateslot", title: "Date", sortable: "dateslot", show: true },						  
						  { field: "timerange", title: "Time", sortable: "timerange", show: true },
						  { field: "description", title: "About", sortable: "description", show: true }
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
		}
		vm.tablefilterdata();
		
		vm.confirmschedule = function(index){
			// console.log(index);
			firebase.database().ref('applyprop/'+index).update({	
				schedulestatus: "confirmed"
			})
			$state.reload();
		}
		
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