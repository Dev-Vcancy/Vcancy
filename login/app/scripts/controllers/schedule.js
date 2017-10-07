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
		
		vm.tablefilterdata = function(propID = '') {
			if(propID !=''){
				vm.propcheck[propID] = !vm.propcheck[propID];
			}
			
			vm.showCal = false;
			firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
				// console.log(snapshot.val())
				$scope.$apply(function(){
					if(snapshot.val()) {						
						
						$.map(snapshot.val(), function(value, index) {							
							 if(vm.schedulepropaddress.findIndex(x => x.propID == value.propID) == -1 && value.schedulestatus !== "removed") {
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
								if(value.schedulestatus !== "removed") {
									return [{scheduleID:index, name:value.name, tenantlocation: value.tenantlocation, jobtitle: value.jobtitle, age: value.age, dateslot: value.dateslot, address:value.address, timerange: value.timerange, description: value.description, schedulestatus: value.schedulestatus}];
								}
							}
							
							
						});
			
						vm.cols = [
							  { field: "name", title: "Name", sortable: "name", show: true },
							  { field: "tenantlocation", title: "Location", sortable: "tenantlocation", show: true },
							  { field: "jobtitle", title: "Profession", sortable: "jobtitle", show: true },
							  { field: "age", title: "Age", sortable: "age", show: true },
							  { field: "dateslot", title: "Date", sortable: "dateslot", show: true },						  
							  { field: "timerange", title: "Time", sortable: "timerange", show: true },
							  { field: "description", title: "About", sortable: "description", show: true }
							];
							
						vm.extracols = [
							{ field: "", title: "", show: true}
						];	
						
						//Sorting
						vm.tableSorting = new NgTableParams({
						      // initial sort order
						      sorting: { name: "asc" } 
						    }, {
						      dataset: vm.tabledata
						    });
					}
					
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