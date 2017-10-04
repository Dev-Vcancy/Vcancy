'use strict';

//=================================================
// Tenant Dashboard
//=================================================

vcancyApp
    .controller('tenantdboardlCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window) {
		
		var vm = this;
		var tenantID = localStorage.getItem('userID');
		
		vm.viewingschedule = 0;
		vm.submitapps = 0;
		vm.propactive = 0;
		vm.applicantcompet = 0;
		
		var propdbObj = firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function(snapshot) {	
			console.log(snapshot.val())
			$scope.$apply(function(){
				$.map(snapshot.val(), function(value, index) {
					
					if(value.schedulestatus == "confirmed" && moment(value.dateslot).isAfter(new Date())  ) {
						vm.viewingschedule += 1;
					}
					if(value.schedulestatus == "confirmed" && moment(value.dateslot).isSame(new Date()) &&   moment(value.fromtimeslot).format('HH:mm') >= moment(new Date()).format('HH:mm') &&  moment(value.toslot).format('HH:mm') >= moment(new Date()).format('HH:mm')) {
						vm.viewingschedule += 1;
					}
					
				});	
			});
		   
		});
}])