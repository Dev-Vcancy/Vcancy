'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
    .controller('tenantscheduleCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams','emailSendingService',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams,emailSendingService) {
		
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
							if(value.units === ' '){
								var units = '';
							} else {
								var units = value.units+" - ";								
							}
							return [{scheduleID:index, className: 'bgm-cyan', title: units+value.address, start: new Date(value.dateslot)}];
						}
					});						
					
					// vm.calendardata = [{scheduleID:"-KvaDdFDac3A_apLY-ce",className:"bgm-cyan",title:"Active kl",start:"24-September-2017"}]
					$scope.calendardata = vm.calendardata;
					
					console.log($scope.calendardata);
					vm.schedulesavail = 0;
					
					//to map the object to array
					vm.tabledata = $.map(snapshot.val(), function(value, index) {
						if(value.schedulestatus !== "removed") {
							vm.schedulesavail = 1;
							if(value.units === ' '){
								var units = '';
							} else {
								var units = value.units+" - ";								
							}
							return [{scheduleID:index, address:units+value.address, dateslot: value.dateslot, timerange: value.timerange,  schedulestatus: value.schedulestatus}];
						} 
					});	
					
					vm.extracols = [
							{ field: "", title: "", show: true}
						];	
					
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
				
				vm.showCal = true;
			});
		});
		
		vm.cancelschedule = function(index){
			// console.log(index);
			if ($window.confirm("Are you sure you want to cancel this viewing appointment?"))  {
				firebase.database().ref('applyprop/'+index).update({	
					schedulestatus: "cancelled"
				})
				
				firebase.database().ref('applyprop/'+index).once("value", function(snapshot) {
					firebase.database().ref('users/'+snapshot.val().landlordID).once("value", function(snap) {
						var emailData = '<p>Hello, </p><p>'+snapshot.val().name+' has <strong>cancelled</strong> their viewing at '+snapshot.val().dateslot+', '+snapshot.val().timerange+' for '+snapshot.val().address+'.</p><p>The time slot is now open to other renters.</p><p>To view details, please log in  http://www.vcancy.ca/login/#/ and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
						
						emailSendingService.sendEmailViaNodeMailer(snap.val().email, snapshot.val().name+'has cancelled viewing for '+snapshot.val().address, 'cancelstatus', emailData);
					});
						
					var emailData = '<p>Hello '+snapshot.val().name+', </p><p>Your viewing time '+snapshot.val().dateslot+', '+snapshot.val().timerange+' has been been <strong>cancelled</strong> by the landlord of '+snapshot.val().address+'.</p><p>Please book another time using the link initially provided or contact the landlord directly.</p><p>To view details, please log in  http://www.vcancy.ca/login/#/ and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
						
					emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Your viewing has been cancelled for '+snapshot.val().address, 'cancelstatus', emailData);
				});
				
				
				$state.reload();
			}
		}
}])
