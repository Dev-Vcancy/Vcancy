'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
    .controller('tenantappCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {
		
		var vm = this;
		var tenantID = localStorage.getItem('userID');
		
		var propdbObj = firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val()) {
					//to map the object to array
					vm.tabledata = $.map(snapshot.val(), function(value, index) {
						if(value.schedulestatus == "confirmed" && moment(value.date).format('DD-MMMM-YYYY') <= moment(new Date()).format('DD-MMMM-YYYY') &&   moment(value.fromtime).format('HH:mm') <= moment(new Date()).format('HH:mm') &&  moment(value.to).format('HH:mm') <= moment(new Date()).format('HH:mm') ) {
							return [{scheduleID:index, address:value.address, dateslot: value.dateslot, timerange: value.timerange,  schedulestatus: value.schedulestatus}];
						}
					});	
				} else {
					
				}
				
				console.log(vm.tabledata);
			});
		});
}])