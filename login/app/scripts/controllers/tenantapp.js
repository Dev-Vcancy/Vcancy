'use strict';

//=================================================
// Tenant Applications
//=================================================

vcancyApp
    .controller('tenantappCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {
		
		var vm = this;
		var tenantID = localStorage.getItem('userID');
		vm.loader = 1;
		vm.submittedappsavail = 0;
		vm.submitappsdata = [];		
		
		firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val() != null) {					
					vm.pendingappsavail = 0;
					
					//to map the object to array
					vm.tabledata = $.map(snapshot.val(), function(value, index) {						
						if(value.schedulestatus == "confirmed" ) { // && moment(value.dateslot).isBefore(new Date())
							vm.pendingappsavail = 1;
							return [{scheduleID:index, address:value.address, dateslot: value.dateslot, timerange: value.timerange,  schedulestatus: value.schedulestatus}];
						} 
					});	
					
					// console.log(vm.tabledata);
					vm.extracols = [
						  { field: "scheduleID", title: "", show: true }
						];
						
					
				} else {
					vm.tabledata = [{scheduleID:'', address:'', dateslot: '', timerange: '',  schedulestatus: ''}];
					
					vm.pendingappsavail = 0;
				}
				
				vm.cols = [
					  { field: "address", title: "Address", sortable: "address", show: true },
					  { field: "dateslot", title: "Viewed On", sortable: "dateslot", show: true }
					];
					
				vm.loader = 0;
					
				//Sorting
				vm.tableSorting = new NgTableParams({
					sorting: {address: 'asc'}}, 
					
					{dataset: vm.tabledata

					/*, {
					total: vm.tabledata.length, // length of data
					getData: function($defer, params) {
						// console.log(params);
						// use build-in angular filter
						var orderedData = params.sorting() ? $filter('orderBy')(vm.tabledata, params.orderBy()) : vm.tabledata;
			
						$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
					}*/
					 // dataset: vm.tabledata
				})
				
				
				
				if(snapshot.val() != null){
					$.map(snapshot.val(), function(val, key) {		
						firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(key).once("value", function(snap) {	
							$scope.$apply(function() {
								if(snap.val() !== null) {					
									//to map the object to array
									$.map(snap.val(), function(value, index) {	
										if(val.schedulestatus == "submitted" ){
											vm.submittedappsavail = 1;
											vm.submitappsdata.push({appID:index, address:value.address, dated: value.dated, rentalstatus: value.rentalstatus});
										}
										
										
									});	
								}
							});
						});
					});	
					
					vm.submitappscols = [
					  { field: "address", title: "Address", sortable: "address", show: true },
					  { field: "dated", title: "Submitted On", sortable: "dated", show: true },
					  { field: "rentalstatus", title: "Status", sortable: "rentalstatus", show: true }
					];
					
					//Sorting
					vm.submitappsSorting = new NgTableParams({
						sorting: {address: 'asc'}}, 
					
					{dataset: vm.submitappsdata
					/*}, {
						total: vm.submitappsdata.length, // length of data
						getData: function($defer, params) {
							// console.log(params);
							// use build-in angular filter
							var orderedData = params.sorting() ? $filter('orderBy')(vm.submitappsdata, params.orderBy()) : vm.submitappsdata;
				
							$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
						}*/
						 // dataset: vm.submitappsdata
					})	
				}
			});		
		});	
		
		
		firebase.database().ref('submitapps/').orderByChild("tenantID").equalTo(tenantID).once("value", function(snapshot) {	
			$scope.$apply(function(){
				if(snapshot.val() != null){
					$.map(snapshot.val(), function(value, key) {		
						if(value.scheduleID == 0){
							vm.submittedappsavail = 1;
							vm.submitappsdata.push({appID:key, address:value.address, dated: value.dated, rentalstatus: value.rentalstatus});
						}
					});
					
					vm.submitappscols = [
					  { field: "address", title: "Address", sortable: "address", show: true },
					  { field: "dated", title: "Submitted On", sortable: "dated", show: true },
					  { field: "rentalstatus", title: "Status", sortable: "rentalstatus", show: true }
					];

					//Sorting
					vm.submitappsSorting = new NgTableParams({
						sorting: {address: 'asc'}}, 
					
					{dataset: vm.submitappsdata
					/*}, {
						total: vm.submitappsdata.length, // length of data
						getData: function($defer, params) {
							// console.log(params);
							// use build-in angular filter
							var orderedData = params.sorting() ? $filter('orderBy')(vm.submitappsdata, params.orderBy()) : vm.submitappsdata;
				
							$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
						}*/
						 // dataset: vm.submitappsdata
					})	
				}			
					
			});
		});
		
		if(vm.submittedappsavail == 0) {
			vm.submitappsdata.push({scheduleID:'', name:'', age: '', profession: '',salary: '', pets: '', maritalstatus:'', appno:'',  schedulestatus: ''});
		} else {			
			vm.loader = 0;				
		}
				
				
		vm.email = '';
		vm.disablebutton = 1;
		vm.emailrequired = function(event){
			if(vm.email == '' || !vm.email.match(/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/)){
				vm.disablebutton = 1;
			} else {
				vm.disablebutton = 0;
			}
		}
		
		
		vm.gotoRental = function(event){
			if(vm.disablebutton == 0){
				window.location.href = "#/rentalform/0";
			}
		}
		
			
}])