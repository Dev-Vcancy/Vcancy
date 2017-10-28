'use strict';

//=================================================
// PROPERTY
//=================================================

vcancyApp.controller('propertyCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','slotsBuildService','emailSendingService','$http', function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, slotsBuildService, emailSendingService, $http) {
	$rootScope.invalid = '';
	$rootScope.success = '';
	$rootScope.error = '';	
	
	var todaydate = new Date();	
	var dateconfig = new Date(new Date().setMinutes( 0 ));
	console.log(dateconfig,todaydate);
	
	var vm = this;
	vm.propsavail = 1;
	vm.timeslotmodified = "false";
	vm.isDisabled = false;
	vm.googleAddress = 0;
	var oldtimeSlotLen = 0;
	// console.log(vm.isDisabled);	
	
	firebase.database().ref('users/'+localStorage.getItem('userID')).once("value", function(snap) {
		vm.landlordname = snap.val().firstname+" "+snap.val().lastname;			
	});
	
	$scope.$on('gmPlacesAutocomplete::placeChanged', function(){
      var address = vm.prop.address.getPlace();
	  vm.googleAddress = 1;
	  vm.prop.address = address.formatted_address;
	  vm.addresschange();
	  $scope.$apply();
	});
	
	vm.copy = "Copy link";		
	$scope.copySuccess = function(e) {
		console.info('Action:', e.action);
		console.info('Text:', e.text);
		console.info('Trigger:', e.trigger);
		vm.copy = "Copied";	
		$scope.$apply();
	};
		
	// timeSlot for Date and Timepicker
	vm.addTimeSlot = function(slotlen){
		// console.log(slotlen);
		for(var i=0; i<slotlen; i++){
			vm.newTime = false;		
		}
		
		vm.timeSlot.push({date:dateconfig});
		vm.prop.multiple[slotlen] = true;
		vm.newTime = true;
		console.log(vm.newTime);
	}
	
	// to remove timeslots
	vm.removeTimeSlot = function(slotindex){
		if($state.current.name == 'editprop') {
			if ($window.confirm("Are you sure you want to delete this viewing slot? "))  {	
				if(slotindex < oldtimeSlotLen){
					vm.timeslotmodified = "true";
				} 
				vm.timeSlot.splice(slotindex,1);
				vm.prop.date.splice(slotindex,1);
				vm.prop.fromtime.splice(slotindex,1);
				vm.prop.to.splice(slotindex,1);
				vm.prop.limit.splice(slotindex,1);	
				vm.prop.multiple.splice(slotindex,1);
			}			
		} else {
			vm.timeSlot.splice(slotindex,1);
			vm.prop.date.splice(slotindex,1);
			vm.prop.fromtime.splice(slotindex,1);
			vm.prop.to.splice(slotindex,1);
			vm.prop.limit.splice(slotindex,1);	
			vm.prop.multiple.splice(slotindex,1);
		}			
	}
	
	// DATEPICKER
	vm.today = function() {
		vm.dt = new Date();
	};
	vm.today();

	vm.toggleMin = function() {
		vm.minDate = vm.minDate ? null : new Date();
	};
	vm.toggleMin();

	vm.open = function($event, opened) {
		$event.preventDefault();
		$event.stopPropagation();
		angular.forEach(vm.timeSlot, function(value, key) {
		  value.opened = false;
		});
		opened.opened = true;
	};
	
	vm.dateOptions = {
		formatYear: 'yy',
		startingDay: 1
	};

	vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	vm.format = vm.formats[0];
		
	vm.timeopen = function($event,opened) {
		$event.preventDefault();
		$event.stopPropagation();
		angular.forEach(vm.timeSlot, function(value, key) {
		  value.opened = false;
		});
		vm.opened = true;
	  }; 
	
	//  TIMEPICKER
	vm.mytime = new Date();
	
	vm.hstep = 1;
	vm.mstep = 5;
	
	vm.options = {
		hstep: [1, 2, 3],
		mstep: [1, 5, 10, 15, 25, 30]
	};

	vm.minDate = new Date();
	
	vm.newTime = false;
	
	vm.ismeridian = true;
	
	vm.toggleMode = function() {
		vm.ismeridian = ! vm.ismeridian;
	};

	vm.update = function() {
		var d = new Date();
		d.setHours( 14 );
		d.setMinutes( 0 );
		vm.mytime = d;
	};
	
	
	vm.addresschange = function(){
		console.log(vm.prop.address);
		if(vm.prop.address != undefined && (typeof vm.prop.address == "string" || vm.googleAddress == 1)){
			vm.isDisabled = false;
		} else {
			vm.isDisabled = true;
		}
		
		vm.datetimeslotchanged(0);
	}
	
	vm.datetimeslotchanged = function (key) {		
		if(key < oldtimeSlotLen){
			vm.timeslotmodified = "true";
		} 
		if(vm.prop.fromtime[key] === undefined){
			var fromtime  =  dateconfig;			
		} else {
			var fromtime= vm.prop.fromtime[key];	
		}
		
		if(vm.prop.to[key] === undefined){
			var to = dateconfig;	
		} else {
			var to = vm.prop.to[key];	
		}		
		
		vm.overlap = 0;			
		
		for (var i = 0; i < vm.prop.date.length ; i++) {
			// console.log(i,key);
			if(i != key){
				if(vm.prop.fromtime[i] === undefined){
					var ftime  =  dateconfig;			
				} else {
					var ftime= vm.prop.fromtime[i];	
				}
				
				if(vm.prop.to[i] === undefined){
					var totime = dateconfig;	
				} else {
					var totime = vm.prop.to[i];	
				}
					
				if (((fromtime > ftime || to > ftime) && moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isSame(moment(vm.prop.date[i]).format('DD-MMMM-YYYY'))) || ((fromtime > totime || to > totime) && moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isSame(moment(vm.prop.date[i]).format('DD-MMMM-YYYY')))) {
					vm.overlap = 1;
				} 
			}
		}
	
		if(vm.overlap == 1) {
			vm.prop.timeoverlapinvalid[key] = 1;
			vm.isDisabled = true;
		} else {
			vm.prop.timeoverlapinvalid[key] = 0;
		}
		
		var temp = new Date(fromtime.getTime() + 30 * 60000)
		// console.log(moment(to).format('HH:mm'),moment(temp).format('HH:mm'));
		if (moment(to).format('HH:mm') < moment(temp).format('HH:mm') && vm.prop.timeoverlapinvalid[key] == 0) {
			vm.prop.timeinvalid[key] = 1;
			vm.isDisabled = true;
		} else {
			vm.prop.timeinvalid[key] = 0;
		}
				
		// console.log(vm.prop.multiple[key],fromtime,to);
		
		if((vm.prop.multiple[key] === false || vm.prop.multiple[key] === undefined) && vm.prop.timeinvalid[key] == 0){
			var minutestimediff = (to - fromtime)/ 60000;
			var subslots = Math.floor(Math.ceil(minutestimediff)/30);				
			// console.log(minutestimediff,subslots);
			
			if(vm.prop.limit[key] > subslots ){
				vm.prop.invalid[key] = 1;
				vm.isDisabled = true;
			} else {
				vm.prop.invalid[key] = 0;
				if(vm.prop.address != undefined && (typeof vm.prop.address == "string" || vm.googleAddress == 1)){
					vm.isDisabled = false;
				} else {
					vm.isDisabled = true;
				}
			}
		} else {
			vm.prop.invalid[key] = 0;
			// console.log(typeof vm.prop.address == "string", vm.googleAddress == 1);
			if(vm.prop.address != undefined && (typeof vm.prop.address == "string" || vm.googleAddress == 1)){
				vm.isDisabled = false;
			} else {
				vm.isDisabled = true;
			}
		}
	}

	vm.clear = function() {
		vm.mytime = null;
	};
		
	// Go Back To View Property
	vm.backtoviewprop = function(){
		$state.go('viewprop');
	}	
	
	// Add/Edit Property		
	vm.submitProp = function(property){				
			vm.loader = 1;
			var propID = property.propID;
			var propimg = $('#propimg').val();	
			var propstatus = property.propstatus  == '' ? false : property.propstatus ; 
			var proptype = property.proptype;
			var units = property.units;
			var shared = property.shared  == '' ? false : property.shared ; 
			var address = property.address; 
			var rent = property.rent; 
			var landlordID = localStorage.getItem('userID');
			var date = [];
			var fromtime = [];
			var to = [];
			var limit = [];	
			var multiple = [];		
			angular.forEach(property.limit, function(lval, key) {
				date[key] = property.date[key].toString();
				if(property.fromtime[key] === undefined){
					fromtime[key]  =  dateconfig.toString();				
				} else {
					fromtime[key] = property.fromtime[key].toString();					
				}
				
				if(property.to[key] === undefined){
					to[key] = dateconfig.toString();	
				} else {
					to[key] = property.to[key].toString();	
				}			
				multiple[key] = property.multiple[key]   == '' ? false : property.multiple[key];
				limit[key] = lval;
			});
						
			$rootScope.invalid = '';
			$rootScope.success = '';
			$rootScope.error = '';
			
			var propertyObj = $firebaseAuth();
			
			var propdbObj = firebase.database();
		if(propID == ''){	
			propdbObj.ref('properties/').push().set({	
				landlordID: landlordID,
				propimg: propimg,
				propstatus: propstatus,
				proptype: proptype,
				units: units,
				rent: rent,
				shared: shared, 
				address: address, 
				date: date,
				fromtime: fromtime,
				to: to,
				multiple: multiple,
				limit: limit
			}).then(function(){
			  //Generate the property link
			  propdbObj.ref('properties/').limitToLast(1).once("child_added", function (snapshot) {
				
				if(snapshot.key != "undefined"){
					var propertylink = "http://35.182.211.61/login/dist/#/applyproperty/"+snapshot.key;
					vm.prop.propertylink = propertylink;	
					
					// link generated and property added message
					localStorage.setItem('propertysuccessmsg','Property added successfully. Property Link is also generated.');
					$window.scrollTo(0, 0);
					
					vm.prop.propertylink = propertylink;				
					$('#propertylink').val(propertylink);	
					
					// update the property link to property table
					propdbObj.ref('properties/'+snapshot.key).update({	
						propertylink: propertylink
					})
					
					var emailData = '<p>Hello, </p><p>Thanks for adding your rental property '+address+',</p><p> Here’s your dedicated property link:</p><p>'+propertylink+'</p><p>Share this link on your online listing, social media, email and with any perspective tenant.</p><p>Please don’t delete this email for future use.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
					
					// Send Email
					emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Your rental property link', 'addproperty', emailData);
					
					$state.go('viewprop');
					
				// reset the add property form
				vm.timeSlot = [{date:dateconfig}];
				$scope.$apply(function(){
					vm.prop = {
						propID: '',
						landlordID: '',
						propimg : ' ',
						propstatus : '',
						proptype : '',
						units : '',
						multiple: [],
						rent: '',
						shared : '',	
						address : '',
						date : [],
						fromtime : [],
						to : [],
						limit : [],
						propertylink: ''
					}
					$('#propertylink').val('');
				});
				}				
			  })
			});
		} else {
			if(vm.timeslotmodified == "true"){
				 var confirmAns = $window.confirm("Are you sure you want to change timeslots? Any changes will result in time slots being canceled at the renters’ end.");
			} else {				
				var confirmAns = true;
			}
			if(confirmAns == true){
				propdbObj.ref('properties/'+propID).update({
						propimg: propimg,
						propstatus: propstatus,
						proptype: proptype,
						units: units,
						rent: rent,
						shared: shared, 
						multiple: multiple,
						address: address, 
						date: date,
						fromtime: fromtime,
						to: to,
						limit: limit
				}).then(function(){
					firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snap) {
						if(snap.val() != null) {								
							$.map(snap.val(), function(v, k) {
								firebase.database().ref('applyprop/'+k).update({
									address: address,
									units: units
								});
							});
						}
					});
					
					vm.slots = slotsBuildService.maketimeslots(date,fromtime,to,limit,multiple);
					
					firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snapshot) {	
						$scope.$apply(function(){
							vm.appliedslots = [];
							vm.scheduleIDs = [];
							vm.tenants = [];
							
							if(snapshot.val() != null){
								vm.appliedslots = $.map(snapshot.val(), function(value, index) {							
									if(value.schedulestatus !== "cancelled" && value.schedulestatus !== "submitted"){	
										vm.scheduleIDs.push(index);
										vm.tenants.push(index);
										return [{date:value.dateslot, fromtime:moment(value.fromtimeslot).format('HH:mm'), to:moment(value.toslot).format('HH:mm'),scheduleID:index}];				
									}
								});
							}
							
							console.log(vm.scheduleIDs);
							// console.log(vm.appliedslots);	
							
							if(propstatus != false)	{
								for (var i = 0; i < vm.slots.length; i++) {
									for (var j = 0; j < vm.appliedslots.length; j++) {
										if (moment(vm.slots[i].date).format('DD-MMMM-YYYY') == vm.appliedslots[j].date &&  moment(vm.slots[i].fromtime).format('HH:mm') == vm.appliedslots[j].fromtime && moment(vm.slots[i].to).format('HH:mm') == vm.appliedslots[j].to) {					
											var index = vm.scheduleIDs.indexOf(vm.appliedslots[j].scheduleID);
											if (index > -1) {
											   vm.scheduleIDs.splice(index, 1);
											   vm.tenants.splice(index, 1);
											}
										} 
									}
								}	
							} 				
							
							// link generated and property added message
							localStorage.setItem('propertysuccessmsg','Property updated successfully.');
							angular.forEach(vm.scheduleIDs, function(value, key) {
								firebase.database().ref('applyprop/'+value).update({	
									schedulestatus: "cancelled"
								})
								// console.log(value);
							});		

							if(propstatus === false){
								var emailData = '<p>Hello, </p><p>'+address+' been successfully <strong>deactivated</strong>.</p><p>You will no longer receive viewing requests and rental applications.</p><p>To make changes or reactivate, please log in http://35.182.211.61/login/dist/#/ and go to “My Properties”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
									
								// Send Email
								emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), address+' has been deactivated', 'deactivateproperty', emailData);
						 
								angular.forEach(vm.tenants, function(tenantID, key) {
									firebase.database().ref('users/'+tenantID).once("value", function(snap) {
										var emailData = '<p>Hello '+snap.val().firstname+' '+snap.val().lastname+', </p><p>Your viewing request on property <em>'+address+'</em> has been cancelled as landlord has deactivated this property.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
									
										// Send Email
										emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your generated viewing request cancelled on Vcancy', 'delproperty', emailData);
									});
								});
							} else {
								var emailData = '<p>Hello, </p><p>Your property <em>'+address+'</em>   has been successfully updated and all your property viewings affected by the updated time slots are cancelled. </p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
										
								// Send Email
								emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Property Time Slots updated on Vcancy', 'updateproperty', emailData);
						 
								angular.forEach(vm.tenants, function(tenantID, key) {
									firebase.database().ref('users/'+tenantID).once("value", function(snap) {
										var emailData = '<p>Hello '+snap.val().firstname+' '+snap.val().lastname+', </p><p>Your viewing request on property <em>'+address+'</em> has been cancelled as landlord has made some changes in time slots for this property.</p><p>To reschedule the viewing and book some another available time, please log in http://35.182.211.61/login/dist/#/ and use the link initially provided to schedule the viewing or follow the link http://35.182.211.61/login/dist/#/applyproperty/'+$stateParams.propId+'.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
									
										// Send Email
										emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your generated viewing request cancelled on Vcancy', 'updateproperty', emailData);
									});
								});
							}

								
							$state.go('viewprop');
						});	
					});	
					
					$window.scrollTo(0, 0);
				})
			} else {
				vm.loader = 0;				
				$state.reload();
			}
		}
	}
	
	
	// View Property
	if($state.current.name == 'viewprop') {
		vm.loader = 1;
		var landlordID = localStorage.getItem('userID');
		var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {	
			$scope.$apply(function(){
				vm.success = 0;
				if(snapshot.val()) {
			 		vm.viewprops = snapshot.val();
			 		vm.propsavail = 1;
					vm.propsuccess = localStorage.getItem('propertysuccessmsg');
				}
			 	else {
			 		vm.propsavail = 0;
					vm.propsuccess = localStorage.getItem('propertysuccessmsg');
			 	}
				vm.loader = 0;
				// console.log($rootScope.$previousState.name);
				if(($rootScope.$previousState.name == "editprop" || $rootScope.$previousState.name == "addprop") && vm.propsuccess != ''){
					vm.success = 1;
				}
				localStorage.setItem('propertysuccessmsg','')
			});
		   
		});
	
		vm.toggleSwitch = function(key){
			// console.log(key);
			var propstatus = !vm.viewprops[key].propstatus;
			// console.log(propstatus);	
			
			firebase.database().ref('properties/'+key).once("value", function(snap) {
				vm.property_address = snap.val().address;
			});
			
			// update the property status to property table
			firebase.database().ref('properties/'+key).update({	
				propstatus: propstatus
			})
			
			if(propstatus === false) {
				firebase.database().ref('applyprop/').orderByChild("propID").equalTo(key).once("value", function(snapshot) {	
					$scope.$apply(function(){
						vm.scheduleIDs = [];
						vm.tenants = [];
						
						if(snapshot.val() != null){
							$.map(snapshot.val(), function(value, index) {							
								if(value.schedulestatus !== "cancelled" && value.schedulestatus !== "submitted"){	
									vm.scheduleIDs.push(index);	
									vm.tenants.push(value.tenantID);
								}
							});
						}
						
						angular.forEach(vm.scheduleIDs, function(value, key) {
							firebase.database().ref('applyprop/'+value).update({	
								schedulestatus: "cancelled"
							})
							// console.log(value);
						});	

						var emailData = '<p>Hello, </p><p>'+vm.property_address+' been successfully <strong>deactivated</strong>.</p><p>You will no longer receive viewing requests and rental applications.</p><p>To make changes or reactivate, please log in http://35.182.211.61/login/dist/#/ and go to “My Properties”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
									
						// Send Email
						emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), vm.property_address+' has been deactivated', 'deactivateproperty', emailData);
				 
						angular.forEach(vm.tenants, function(tenantID, key) {
							firebase.database().ref('users/'+tenantID).once("value", function(snap) {
								var emailData = '<p>Hello '+snap.val().firstname+' '+snap.val().lastname+', </p><p>Your viewing request on property <em>'+address+'</em> has been cancelled as landlord has deactivated this property.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
							
								// Send Email
								emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your generated viewing request cancelled on Vcancy', 'delproperty', emailData);
							});
						});
						
					});	
				});	
			}
		}
	}

	// Edit Property
	if($state.current.name == 'editprop') {
		vm.mode = 'Edit';
		vm.submitaction = "Update";
		vm.otheraction = "Delete";
		var ref = firebase.database().ref("/properties/"+$stateParams.propId).once('value').then(function(snapshot) {
		  var propData = snapshot.val();
		  vm.timeSlot = [];
		  $scope.$apply(function(){
				vm.prop = {
					propID: snapshot.key,
					landlordID: propData.landlordID,
					propimg : propData.propimg,
					propstatus : propData.propstatus,
					proptype : propData.proptype,
					units : propData.units,
					rent: propData.rent,
					shared : propData.shared,
					address : propData.address,
					multiple: [],
					date : [],
					fromtime : [],
					to : [],
					limit : [],
					propertylink: propData.propertylink,
					invalid: [0],
					timeinvalid: [0],
					timeoverlapinvalid: [0]
				}
				angular.forEach(propData.date, function(value, key) {
				  vm.timeSlot.push({date: new Date(value)});
				  vm.prop.date.push(new Date(value));
				  vm.prop.fromtime.push(new Date(propData.fromtime[key]));
				  vm.prop.to.push(new Date(propData.to[key]));
				  vm.prop.limit.push(propData.limit[key]);
				  vm.prop.multiple.push(propData.multiple[key]);				  
				});
				vm.addresschange();		
				oldtimeSlotLen = vm.timeSlot.length;
				vm.unitsOptional();
			});
		});
	} else {
		vm.mode = 'Add';
		vm.submitaction = "Save";		
		vm.otheraction = "Cancel";
		vm.timeSlot = [{date:dateconfig}];
		vm.prop = {
			propID: '',
			landlordID: '',
			propimg : '',
			propstatus : true,
			proptype : '',
			units : '',
			multiple: [true],
			rent: '',
			shared : '',
			address : '',
			date : [],
			fromtime : [],
			to : [],
			limit : [],
			propertylink: '',
			invalid: [0],
			timeinvalid: [0],
			timeoverlapinvalid: [0]
		}

	}
	
	
	
	// Delete Property Permanently
	this.delprop = function(propID){
		var propertyObj = $firebaseAuth();
		var propdbObj = firebase.database();
		
		firebase.database().ref('properties/'+propID).once("value", function(snap) {
			vm.property_address = snap.val().address;
			
			if ($window.confirm("Do you want to continue?"))  {
				propdbObj.ref('properties/'+propID).remove();
				
				firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snapshot) {	
					$scope.$apply(function(){
						vm.scheduleIDs = [];
						vm.tenants = [];
						
						if(snapshot.val() != null){
							$.map(snapshot.val(), function(value, index) {	
								vm.scheduleIDs.push(index);	
								vm.tenants.push(value.tenantID);
							});
						}
						angular.forEach(vm.scheduleIDs, function(value, key) {
							firebase.database().ref('applyprop/'+value).update({	
								schedulestatus: "removed"
							})
						});	
						
						var emailData = '<p style="margin: 10px auto;"><h2>Hi '+vm.landlordname+',</h2><br> Your property <em>'+vm.property_address+'</em> has been successfully deleted and all viewings related to this property are also removed.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
									
						// Send Email
						emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), vm.property_address+' has been deleted', 'delproperty', emailData);
				 
						angular.forEach(vm.tenants, function(tenantID, key) {
							firebase.database().ref('users/'+tenantID).once("value", function(snap) {
								var emailData = '<p style="margin: 10px auto;"><h2>Hi '+snap.val().firstname+' '+snap.val().lastname+',</h2><br> Your viewing request on property <em>'+vm.property_address+'</em> has been removed as landlord has deleted his property.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
							
								// Send Email
								emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your generated viewing request removed from Vcancy', 'delproperty', emailData);
							});
						});
					})
					$state.go('viewprop');
				})
			}
		});
	}
	
	// Units to be optional when house is selected
	this.unitsOptional = function(proptype){
		console.log(vm.prop.units);
		if(vm.prop.proptype == proptype && (vm.prop.units == '' || vm.prop.units == undefined)){
			vm.prop.units = ' ';
		}
	}
}])
	
	