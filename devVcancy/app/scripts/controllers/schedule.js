'use strict';

//=================================================
// Landlord Schedule
//=================================================

vcancyApp
    .controller('scheduleCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams','emailSendingService',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce,NgTableParams,emailSendingService) {
		
		var vm = this;
		var landlordID = localStorage.getItem('userID');
		vm.loader = 1;
		
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
							 if(vm.schedulepropaddress.findIndex(x => x.propID == value.propID) == -1 && value.schedulestatus !== "removed"  ) {
							 		console.log(value);
								  vm.schedulepropaddress.push({propID: value.propID, address: value.address, units: value.units}); 
								  vm.propcheck[value.propID] = true;
							 } 	
						});
						
						
						vm.calendardata = $.map(snapshot.val(), function(value, index) {
							if(value.schedulestatus == "confirmed" && (vm.propcheck[value.propID] == true || propID == '')) {
								return [{scheduleID:index, className: 'bgm-cyan', title:value.units+" - "+value.address, start: new Date(value.dateslot)}];
							}
						});						
						
						// vm.calendardata = [{scheduleID:"-KvaDdFDac3A_apLY-ce",className:"bgm-cyan",title:"Active kl",start:"24-September-2017"}]
						$scope.calendardata = vm.calendardata;
						
						console.log($scope.calendardata);
						
						vm.schedulesavail = 0;
						//to map the object to array
						vm.tabledata = $.map(snapshot.val(), function(value, index) {
							if(vm.propcheck[value.propID] == true || propID == ''){
								if(value.schedulestatus !== "removed" ) {
									vm.schedulesavail = 1;
									return [{scheduleID:index, name:value.name, tenantlocation: value.tenantlocation, jobtitle: value.jobtitle, age: value.age, dateslot: value.dateslot, address:value.address, timerange: value.timerange, description: value.description.substr(0, 15),desctooltip: value.description, schedulestatus: value.schedulestatus}];
								} 
							} 
						});
			
						vm.cols = [
							  { field: "name", title: "Name", sortable: "name", show: true },
							  { field: "tenantlocation", title: "City", sortable: "tenantlocation", show: true },
							  { field: "jobtitle", title: "Profession", sortable: "jobtitle", show: true },
							  { field: "age", title: "Age", sortable: "age", show: true },
							  { field: "dateslot", title: "Date", sortable: "dateslot", show: true },						  
							  { field: "timerange", title: "Time", sortable: "timerange", show: true },
							  { field: "description", title: "About Me", sortable: "description", show: true }
							];

						
						
						vm.extracols = [
							{ field: "", title: "", show: true}
						];
						
						if(vm.schedulesavail == 1){
							//Sorting
							vm.tableSorting = new NgTableParams({
						      // initial sort order
						      sorting: { name: "asc" } 
						    }, {
						      dataset: vm.tabledata
						    });
						}
						
					} else {
						vm.tabledata = [{scheduleID:'', name:'', tenantlocation: '', jobtitle: '', age: '', dateslot: '', address:'', timerange: '', description: '', schedulestatus: ''}];						
						vm.calendardata = [{scheduleID:'', className: 'bgm-cyan', title:'', start: ''}]						
						$scope.calendardata = vm.calendardata;
						
						vm.schedulesavail = 0;
					}
					
					vm.loader = 0;
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
			
			firebase.database().ref('applyprop/'+index).once("value", function(snapshot) {
				firebase.database().ref('users/'+snapshot.val().tenantID).once("value", function(snap) {
					var emailData = '<p>Hello '+snapshot.val().name+', </p><p>Your viewing request for '+snapshot.val().address+' at '+snapshot.val().dateslot+', '+snapshot.val().timerange+' has been accepted.</p><p>If you wish you complete your rental application beforehand, please log in  http://www.vcancy.ca/login/#/ and go to “Applications”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
					
					emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Viewing request for '+snapshot.val().address, 'confirmstatus', emailData);
				});
			});
			$state.reload();
		}
		
		vm.cancelschedule = function(index){
			// console.log(index);
			if ($window.confirm("Are you sure you want to cancel this viewing appointment?"))  {
				firebase.database().ref('applyprop/'+index).update({	
					schedulestatus: "cancelled"
				})
				firebase.database().ref('applyprop/'+index).once("value", function(snapshot) {
					firebase.database().ref('users/'+snapshot.val().tenantID).once("value", function(snap) {
						var emailData = '<p>Hello '+snapshot.val().name+', </p><p>Your viewing time '+snapshot.val().dateslot+', '+snapshot.val().timerange+' has been been <strong>cancelled</strong> by the landlord of '+snapshot.val().address+'.</p><p>Please book another time using the link initially provided or contact the landlord directly.</p><p>To view details, please log in  http://www.vcancy.ca/login/#/ and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
						
						emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your viewing has been cancelled for '+snapshot.val().address, 'cancelstatus', emailData);
					});
				});
				$state.reload();
			}
		}
}])