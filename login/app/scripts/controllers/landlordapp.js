'use strict';

//=================================================
// Landlord Applications
//=================================================

vcancyApp
    .controller('landlordappCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {
		
		var vm = this;
		var landlordID = localStorage.getItem('userID');
		vm.propcheck = [];
		vm.apppropaddress = [];
		vm.loader = 1;
		
		vm.tablefilterdata = function(propID = '') {
			if(propID !=''){
				vm.propcheck[propID] = !vm.propcheck[propID];
			}
			
			firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val() != null) {										
					$.map(snapshot.val(), function(value, index) {							
						 if(vm.apppropaddress.findIndex(x => x.propID == value.propID) == -1 && value.schedulestatus == "submitted") {
							  vm.apppropaddress.push({propID: value.propID, address: value.address}); 
							  vm.propcheck[value.propID] = true;
						 } 	
					});
				}
					vm.submitappsdata = [];
				
				if(snapshot.val() != null) {	
					//to map the object to array
					vm.submitappsdata = $.map(snapshot.val(), function(value, index) {
						if(vm.propcheck[value.propID] == true || propID == ''){					
							if(value.schedulestatus == "submitted" ){
								return [{scheduleID:index, name:value.name, age: value.age, profession: value.jobtitle,  schedulestatus: value.schedulestatus}];
							}
						}
					});	
					
					angular.forEach(vm.submitappsdata, function(schedule, key) {		
						firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(schedule.scheduleID).once("value", function(snapshot) {	
							$scope.$apply(function(){
								if(snapshot.val()) {
									$.map(snapshot.val(), function(value, index) {	
										vm.submitappsdata[key].applicationID = index;
										vm.submitappsdata[key].pets = value.pets;
										vm.submitappsdata[key].maritalstatus = value.maritalstatus;
										vm.submitappsdata[key].appno = value.applicantsno ;
										firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(index).once("value", function(snap) {	
											$scope.$apply(function(){
												if(snap.val()) {
													$.map(snap.val(), function(v, k) {
														// console.log(v);
														vm.submitappsdata[key].salary = v.mainapplicant.appgrossmonthlyincome;
													});
												}
											});
										});
									});
								}
							});
						});
					});
					
					vm.submitappsextracols = [
					  { field: "applicationID", title: "Credit Score", show: true }
					];
					
					vm.submittedappsavail = 1;
				} else {
					vm.submitappsdata = [{scheduleID:'', name:'', age: '', profession: '',salary: '', pets: '', maritalstatus:'', appno:'',  schedulestatus: ''}];
					
					vm.submittedappsavail = 0;
				}
	
						
				vm.submitappscols = [
					  { field: "name", title: "Name", sortable: "name", show: true },
					  { field: "age", title: "Age", sortable: "age", show: true },
					  { field: "profession", title: "Job Title", sortable: "profession", show: true },
					  { field: "salary", title: "Salary", sortable: "salary", show: true },
					  { field: "pets", title: "Pets", sortable: "pets", show: true },
					  { field: "maritalstatus", title: "Marital Status", sortable: "maritalstatus", show: true },
					  { field: "appno", title: "No of Appointment", sortable: "appno", show: true },
					];
					
				vm.loader = 0;
					
				//Sorting
				vm.submitappsSorting = new NgTableParams({
					// page: 1,            // show first page
					// count: 10,           // count per page
					sorting: {
						name: 'asc'     // initial sorting
					}
				}, {
					total: vm.submitappsdata.length, // length of data
					getData: function($defer, params) {
						// console.log(params);
						// use build-in angular filter
						var orderedData = params.sorting() ? $filter('orderBy')(vm.submitappsdata, params.orderBy()) : vm.submitappsdata;
			
						$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
					}
					 // dataset: vm.submitappsdata
				})
			});
		});
		
		}
		vm.tablefilterdata();
		
}])