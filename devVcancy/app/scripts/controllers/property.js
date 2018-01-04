'use strict';

//=================================================
// PROPERTY
//=================================================

vcancyApp.controller('propertyCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', 'slotsBuildService', 'emailSendingService', '$http',  function($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, slotsBuildService, emailSendingService, $http) {
    $rootScope.invalid = '';
    $rootScope.success = '';
    $rootScope.error = '';

    var todaydate = new Date();
    var dateconfig = new Date(new Date().setMinutes(0));
    console.log(dateconfig, todaydate);
    console.log($stateParams.units);
    var vm = this;
    vm.propsavail = 1;
    vm.timeslotmodified = "false";
    vm.isDisabled = false;
    vm.googleAddress = 0;
    var oldtimeSlotLen = 0;
    vm.city = '';
    vm.province = '';
    vm.postcode = '';
    vm.country = '';
    vm.noofunits = 2;
    $rootScope.noofunits = 5;
    $rootScope.propname = "Sagar";
    if($stateParams.units > 0){
        $rootScope.noofunits = $stateParams.units;
        localStorage.setItem("noofunits",$rootScope.noofunits)
        localStorage.setItem("propname",$rootScope.name)
    }


    alert(localStorage.getItem("propID"));
    alert(localStorage.getItem("units"));
    alert(localStorage.getItem("propName"));
    // console.log(vm.isDisabled);	

    firebase.database().ref('users/' + localStorage.getItem('userID')).once("value", function(snap) {
        vm.landlordname = snap.val().firstname + " " + snap.val().lastname;
    });

    $scope.$on('gmPlacesAutocomplete::placeChanged', function() {
        var address = vm.prop.address.getPlace();
        var arrAddress = address.address_components;
        // console.log("address");
        // console.log(address);
        vm.googleAddress = 1;
        vm.prop.address = address.formatted_address;

        var itemRoute = '';
        var itemLocality = '';
        var itemCountry = '';
        var itemPc = '';
        var itemSnumber = '';
        var street_number = '';
        // iterate through address_component array
        $.each(arrAddress, function(i, address_component) {
            console.log('address_component:' + i);
            if (address_component.types[0] == "street_number") {
                console.log("street_number:" + address_component.long_name);
                itemSnumber = address_component.long_name;
                street_number += address_component.long_name + ",";
            }

            if (address_component.types[0] == "route") {
                console.log(i + ": route:" + address_component.long_name);
                itemRoute = address_component.long_name;
                var route = address_component.long_name;
                vm.prop.address = street_number + address_component.long_name;
            }

            if (address_component.types[0] == "administrative_area_level_1") {
                console.log(i + ": administrative_area_level_1:" + address_component.short_name);
                itemRoute = address_component.short_name;
                vm.prop.province = address_component.short_name;
            }

            if (address_component.types[0] == "locality") {
                console.log("town:" + address_component.long_name);
                itemLocality = address_component.long_name;
                vm.prop.city = address_component.long_name;
            }

            if (address_component.types[0] == "country") {
                console.log("country:" + address_component.long_name);
                itemCountry = address_component.long_name;
                vm.prop.country = address_component.long_name;
            }

            if (address_component.types[0] == "postal_code_prefix") {
                console.log("pc:" + address_component.long_name);
                itemPc = address_component.long_name;
            }


            if (address_component.types[0] == "postal_code") {
                console.log("postal_code:" + address_component.long_name);
                itemSnumber = address_component.long_name;

                vm.prop.postcode = address_component.long_name;
            }

            if (address_component.types[0] == "sublocality_level_1") {
                console.log(i + ": sublocality_level_1:" + address_component.long_name);
                itemRoute = address_component.long_name;
                vm.prop.address = address_component.long_name;
                //  var route = address_component.long_name;
            }
            ///return false; // break the loop   
        });


        vm.addresschange();
        $scope.$apply();
    });

    vm.copy = "Copy Link";
    $scope.copySuccess = function(e) {
        console.info('Action:', e.action);
        console.info('Text:', e.text);
        console.info('Trigger:', e.trigger);
        vm.copy = "Copied";
        $scope.$apply();
    };

    // timeSlot for Date and Timepicker
    vm.addTimeSlot = function(slotlen) {
        // console.log(slotlen);
        for (var i = 0; i < slotlen; i++) {
            vm.newTime = false;
        }

        vm.timeSlot.push({
            date: dateconfig
        });
        vm.prop.multiple[slotlen] = true;
        vm.newTime = true;
        console.log(vm.newTime);
    }

    // to remove timeslots
    vm.removeTimeSlot = function(slotindex) {
        if (vm.timeSlot.length == 1) {

        } else {
            if ($state.current.name == 'editprop') {
                if ($window.confirm("Are you sure you want to delete this viewing slot? ")) {
                    if (slotindex < oldtimeSlotLen) {
                        vm.timeslotmodified = "true";
                    }
                    vm.timeSlot.splice(slotindex, 1);
                    vm.prop.date.splice(slotindex, 1);
                    vm.prop.fromtime.splice(slotindex, 1);
                    vm.prop.to.splice(slotindex, 1);
                    vm.prop.limit.splice(slotindex, 1);
                    vm.prop.multiple.splice(slotindex, 1);
                }
            } else {
                vm.timeSlot.splice(slotindex, 1);
                vm.prop.date.splice(slotindex, 1);
                vm.prop.fromtime.splice(slotindex, 1);
                vm.prop.to.splice(slotindex, 1);
                vm.prop.limit.splice(slotindex, 1);
                vm.prop.multiple.splice(slotindex, 1);
            }
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

    vm.timeopen = function($event, opened) {
        $event.preventDefault();
        $event.stopPropagation();
        angular.forEach(vm.timeSlot, function(value, key) {
            value.opened = false;
        });
        vm.opened = true;
    };

    //  TIMEPICKER
    vm.mytime = new Date();

    vm.getNumber = function(num) {
        return new Array(num);   
    }

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
        vm.ismeridian = !vm.ismeridian;
    };

    vm.update = function() {
        var d = new Date();
        d.setHours(14);
        d.setMinutes(0);
        vm.mytime = d;
    };


    vm.addresschange = function() {
        console.log(vm.prop.address);
        if (vm.prop.address != undefined && (typeof vm.prop.address == "string" || vm.googleAddress == 1)) {
            vm.isDisabled = false;
        } else {
            vm.isDisabled = true;
        }

        vm.datetimeslotchanged(0);
    }

    vm.datetimeslotchanged = function(key) {
        if (key < oldtimeSlotLen) {
            vm.timeslotmodified = "true";
        }
        if (vm.prop.fromtime[key] === undefined) {
            var fromtime = dateconfig;
        } else {
            var fromtime = vm.prop.fromtime[key];
        }

        if (vm.prop.to[key] === undefined) {
            var to = dateconfig;
        } else {
            var to = vm.prop.to[key];
        }

        vm.overlap = 0;

        for (var i = 0; i < vm.prop.date.length; i++) {
            // console.log(i,key);
            if (i != key) {
                if (vm.prop.fromtime[i] === undefined) {
                    var ftime = dateconfig;
                } else {
                    var ftime = vm.prop.fromtime[i];
                }

                if (vm.prop.to[i] === undefined) {
                    var totime = dateconfig;
                } else {
                    var totime = vm.prop.to[i];
                }

                console.log(fromtime > ftime, to > ftime, fromtime > totime, to > totime);

                if ((moment(fromtime).format('HH:mm') <= moment(ftime).format('HH:mm') && moment(to).format('HH:mm') <= moment(ftime).format('HH:mm') && moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isSame(moment(vm.prop.date[i]).format('DD-MMMM-YYYY'))) || (moment(fromtime).format('HH:mm') >= moment(totime).format('HH:mm') && moment(to).format('HH:mm') >= moment(totime).format('HH:mm') && moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isSame(moment(vm.prop.date[i]).format('DD-MMMM-YYYY'))) || moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isBefore(moment(vm.prop.date[i]).format('DD-MMMM-YYYY')) || moment(moment(vm.prop.date[key]).format('DD-MMMM-YYYY')).isAfter(moment(vm.prop.date[i]).format('DD-MMMM-YYYY'))) {

                } else {
                    vm.overlap = 1;
                }
            }
        }
        console.log(vm.overlap);

        if (vm.overlap == 1) {
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

        if ((vm.prop.multiple[key] === false || vm.prop.multiple[key] === undefined) && vm.prop.timeinvalid[key] == 0) {
            var minutestimediff = (to - fromtime) / 60000;
            var subslots = Math.floor(Math.ceil(minutestimediff) / 30);
            // console.log(minutestimediff,subslots);

            if (vm.prop.limit[key] > subslots) {
                vm.prop.invalid[key] = 1;
                vm.isDisabled = true;
            } else {
                vm.prop.invalid[key] = 0;
                if (vm.prop.address != undefined && (typeof vm.prop.address == "string" || vm.googleAddress == 1)) {
                    vm.isDisabled = false;
                } else {
                    vm.isDisabled = true;
                }
            }
        } else if ((vm.prop.multiple[key] === true) && vm.prop.timeinvalid[key] == 0) {
            vm.prop.invalid[key] = 0;
            vm.isDisabled = false;
        }
    }

    vm.clear = function() {
        vm.mytime = null;
    };

    // Go Back To View Property
    vm.backtoviewprop = function() {
        $state.go('viewprop');
    }

    // Add/Edit Property		
    vm.submitProp = function(property) {
       
        AWS.config.update({
            accessKeyId: 'AKIAI6FJLQDDJXI4LORA',
            secretAccessKey: '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'
        });
        AWS.config.region = 'us-west-2';

        var bucket = new AWS.S3({
            params: {
                Bucket: 'sagar-vcancy-test/property-images'
            }
        });
        var fileChooser = document.getElementById('file');
        var file = fileChooser.files[0];
        var filename = moment().format('YYYYMMDDHHmmss') + file.name;
        filename = filename.replace(/\s/g, '');

        if (file.size > 3145728) {
            alert('File size should be 3 MB or less.');
            return false;
        } else if (!(filename.endsWith('.png')) &&
            !(filename.endsWith('.jpg')) &&
            !(filename.endsWith('.jpeg'))) {
            alert('Invalid file type.');
            return false;
        }


        if (file) {
            var params = {
                Key: filename,
                ContentType: file.type,
                Body: file,
                StorageClass: "STANDARD_IA",
                ACL: 'public-read'
            };
            bucket.upload(params).on('httpUploadProgress', function(evt) {
                //  console.log("Uploaded :: " + parseInt((evt.loaded * 100) / evt.total)+'%');
            }).send(function(err, data) {
                //console.log(data.Location); return false;
                if (data.Location != '') {

                    $rootScope.invalid = '';
                    $rootScope.success = '';
                    $rootScope.error = '';
                    
                    var propertyObj = $firebaseAuth();
                    
                    var propdbObj = firebase.database();

                    var propID = property.propID;
                    var propimg = data.Location;
                    var propstatus = property.propstatus == '' ? false : property.propstatus;
                    var proptype = property.proptype;
                    var units = property.units;
                    var multiple = property.units == 'single' ? '' : property.noofunits;
                    var shared = property.shared == '' ? false : property.shared;
                    var address = property.address;
                    var city = property.city;
                    var province = property.province;
                    var country = property.country;
                    var postcode = property.postcode;
                    var name = property.name;
                    var landlordID = localStorage.getItem('userID');

                    // Satrt Of property Add
                    if (propID == '') {
                        propdbObj.ref('properties/').push().set({
                            landlordID: landlordID,
                            propimg: propimg,
                            propstatus: propstatus,
                            proptype: proptype,
                            units: units,
                            shared: shared,
                            address: address,
                            city: city,
                            province: province,
                            country: country,
                            postcode: postcode,
                            date: moment().format('YYYY-MM-DD:HH:mm:ss'),
                            multiple: multiple,
                            name: name
                        }).then(function() {
                            
                                propdbObj.ref('properties/').limitToLast(1).once("child_added", function (snapshot) {
                                     localStorage.setItem("propID",snapshot.key);
                                });
                                
                                if (propstatus === false) {
                                    var emailData = '<p>Hello, </p><p>' + address + ' been successfully <strong>deactivated</strong>.</p><p>You will no longer receive viewing requests and rental applications.</p><p>To make changes or reactivate, please log in at http://vcancy.ca/login/ and go to “My Properties”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

                                    // Send Email
                                    emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), address + ' has been deactivated', 'deactivateproperty', emailData);

                                    angular.forEach(vm.tenants, function(tenantID, key) {
                                        firebase.database().ref('users/' + tenantID).once("value", function(snap) {
                                            var emailData = '<p>Hello ' + snap.val().firstname + ' ' + snap.val().lastname + ', </p><p>Your viewing request on property <em>' + address + '</em> has been cancelled as landlord has deactivated this property.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

                                            // Send Email
                                            emailSendingService.sendEmailViaNodeMailer("sagar@riverdeltaindia.com", 'Your generated viewing request cancelled on Vcancy', 'delproperty', emailData);
                                        });
                                    });
                                } else {
                                    var emailData = '<p>Hello, </p><p>Your property <em>' + address + '</em>   has been successfully updated and all your property viewings affected by the updated time slots are cancelled. </p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

                                    // Send Email
                                    emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Property Time Slots updated on Vcancy', 'updateproperty', emailData);

                                    angular.forEach(vm.tenants, function(tenantID, key) {
                                        firebase.database().ref('users/' + tenantID).once("value", function(snap) {
                                            var emailData = '<p>Hello ' + snap.val().firstname + ' ' + snap.val().lastname + ', </p><p>Your viewing request on property <em>' + address + '</em> has been cancelled as landlord has made some changes in time slots for this property.</p><p>To reschedule the viewing and book some another available time, please log in at http://vcancy.ca/login/ and use the link initially provided to schedule the viewing or follow the link http://www.vcancy.ca/login/#/applyproperty/' + $stateParams.propId + '.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

                                            // Send Email
                                            emailSendingService.sendEmailViaNodeMailer("sagar@riverdeltaindia.com", 'Your generated viewing request cancelled on Vcancy', 'updateproperty', emailData);
                                        });
                                    });
                                }
                           
                            if(units == 'multiple'){
                                localStorage.setItem("units",multiple);
                                localStorage.setItem("propName",name);

                                $state.go('addunits',{units: multiple,name:name});
                            }else{
                                $state.go('viewprop');
                            }
                            
                        });
                    } // End OF property Add
                }

            }); // Send Data to AWS End 
        } else {
            alert("File Type is Invalid.");
            return false;
        }

    }


    // View Property
    if ($state.current.name == 'viewprop') {
        vm.loader = 1;
        var landlordID = localStorage.getItem('userID');
        var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function(snapshot) {
            $scope.$apply(function() {
                vm.success = 0;
                if (snapshot.val()) {
                    vm.viewprops = snapshot.val();
                    vm.propsavail = 1;
                    vm.propsuccess = localStorage.getItem('propertysuccessmsg');
                } else {
                    vm.propsavail = 0;
                    vm.propsuccess = localStorage.getItem('propertysuccessmsg');
                }
                vm.loader = 0;
                // console.log($rootScope.$previousState.name);
                if (($rootScope.$previousState.name == "editprop" || $rootScope.$previousState.name == "addprop") && vm.propsuccess != '') {
                    vm.success = 1;
                }
                localStorage.setItem('propertysuccessmsg', '')
            });

        });

        vm.toggleSwitch = function(key) {
            // console.log(key);
            console.log(vm.viewprops[key].propstatus);
            var propstatus = !vm.viewprops[key].propstatus;
            console.log(!vm.viewprops[key].propstatus);

            firebase.database().ref('properties/' + key).once("value", function(snap) {
                vm.property_address = snap.val().address;
            });

            // update the property status to property table
            firebase.database().ref('properties/' + key).update({
                propstatus: propstatus
            })

            if (!vm.viewprops[key].propstatus == false) {
                firebase.database().ref('applyprop/').orderByChild("propID").equalTo(key).once("value", function(snapshot) {
                    $scope.$apply(function() {
                        vm.scheduleIDs = [];
                        vm.tenants = [];

                        if (snapshot.val() != null) {
                            $.map(snapshot.val(), function(value, index) {
                                if (value.schedulestatus !== "cancelled" && value.schedulestatus !== "submitted") {
                                    vm.scheduleIDs.push(index);
                                    vm.tenants.push(value.tenantID);
                                }
                            });
                        }

                        angular.forEach(vm.scheduleIDs, function(value, key) {
                            firebase.database().ref('applyprop/' + value).update({
                                schedulestatus: "cancelled"
                            })
                            // console.log(value);
                        });

                        var emailData = '<p>Hello, </p><p>' + vm.property_address + ' been successfully <strong>deactivated</strong>.</p><p>You will no longer receive viewing requests and rental applications.</p><p>To make changes or reactivate, please log in at http://vcancy.ca/login/ and go to “My Properties”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

                        // Send Email
                        emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), vm.property_address + ' has been deactivated', 'deactivateproperty', emailData);

                        angular.forEach(vm.tenants, function(tenantID, key) {
                            firebase.database().ref('users/' + tenantID).once("value", function(snap) {
                                var emailData = '<p>Hello ' + snap.val().firstname + ' ' + snap.val().lastname + ', </p><p>Your viewing request on property <em>' + address + '</em> has been cancelled as landlord has deactivated this property.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

                                // Send Email
                                emailSendingService.sendEmailViaNodeMailer(snap.val().email, 'Your generated viewing request cancelled on Vcancy', 'delproperty', emailData);
                            });
                        });
                        $state.reload();
                    });
                });
            } else {
                $state.reload();
            }
        }
    }

    // Edit Property
    if ($state.current.name == 'editprop') {
        vm.mode = 'Edit';
        vm.submitaction = "Update";
        vm.otheraction = "Delete";
        var ref = firebase.database().ref("/properties/" + $stateParams.propId).once('value').then(function(snapshot) {
            var propData = snapshot.val();
            vm.timeSlot = [];
            $scope.$apply(function() {
                vm.prop = {
                    propID: snapshot.key,
                    landlordID: propData.landlordID,
                    propimg: propData.propimg,
                    propstatus: propData.propstatus,
                    proptype: propData.proptype,
                    units: propData.units,
                    rent: propData.rent,
                    shared: propData.shared,
                    address: propData.address,
                    multiple: [],
                    date: [],
                    fromtime: [],
                    to: [],
                    limit: [],
                    propertylink: propData.propertylink,
                    invalid: [0],
                    timeinvalid: [0],
                    timeoverlapinvalid: [0]
                }
                angular.forEach(propData.date, function(value, key) {
                    vm.timeSlot.push({
                        date: new Date(value)
                    });
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
        vm.timeSlot = [{
            date: dateconfig
        }];
        vm.prop = {
            propID: '',
            landlordID: '',
            propimg: '',
            propstatus: true,
            proptype: '',
            units: '',
            multiple: [true],
            rent: '',
            shared: '',
            address: '',
            date: [],
            fromtime: [],
            to: [],
            limit: [],
            propertylink: '',
            invalid: [0],
            timeinvalid: [0],
            timeoverlapinvalid: [0]
        }

    }



    // Delete Property Permanently
    this.delprop = function(propID) {
        var propertyObj = $firebaseAuth();
        var propdbObj = firebase.database();

        firebase.database().ref('properties/' + propID).once("value", function(snap) {
            vm.property_address = snap.val().address;

            if ($window.confirm("Do you want to continue?")) {
                propdbObj.ref('properties/' + propID).remove();

                firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function(snapshot) {
                    $scope.$apply(function() {
                        vm.scheduleIDs = [];
                        vm.tenants = [];

                        if (snapshot.val() != null) {
                            $.map(snapshot.val(), function(value, index) {
                                vm.scheduleIDs.push(index);
                                vm.tenants.push(value.tenantID);
                            });
                        }
                        angular.forEach(vm.scheduleIDs, function(value, key) {
                            firebase.database().ref('applyprop/' + value).update({
                                schedulestatus: "removed"
                            })
                        });

                        var emailData = '<p style="margin: 10px auto;"><h2>Hi ' + vm.landlordname + ',</h2><br> Your property <em>' + vm.property_address + '</em> has been successfully deleted and all viewings related to this property are also removed.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

                        // Send Email
                        emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), vm.property_address + ' has been deleted', 'delproperty', emailData);

                        angular.forEach(vm.tenants, function(tenantID, key) {
                            firebase.database().ref('users/' + tenantID).once("value", function(snap) {
                                var emailData = '<p style="margin: 10px auto;"><h2>Hi ' + snap.val().firstname + ' ' + snap.val().lastname + ',</h2><br> Your viewing request on property <em>' + vm.property_address + '</em> has been removed as landlord has deleted his property.</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

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
    this.unitsOptional = function(proptype) {
        console.log(vm.prop.units);
        if (vm.prop.proptype == proptype && (vm.prop.units == '' || vm.prop.units == undefined)) {
            vm.prop.units = ' ';
        } else if (vm.prop.proptype != proptype && (vm.prop.units == '' || vm.prop.units == undefined)) {
            vm.prop.units = '';
        }
    }

    this.unitsClear = function(proptype) {
        console.log(vm.prop.units);
        if (vm.prop.proptype == proptype && (vm.prop.units == '' || vm.prop.units == undefined)) {
            vm.prop.units = ' ';
        }
    }


    vm.submitunits = function(units){
        console.log(units);
        var num = units.number;
        var rent = units.rent;
        var sqft = units.sqft;
        var status = units.status;
        var text = units.text;
        console.log(num);
    }
}])