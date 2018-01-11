'use strict';

//=================================================
// PROPERTY
//=================================================

vcancyApp.controller('propertyCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', 'slotsBuildService', 'emailSendingService', '$http', '$location', '$log', '$uibModal', function($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, slotsBuildService, emailSendingService, $http, $location, $log, $uibModal) {
    $rootScope.invalid = '';
    $rootScope.success = '';
    $rootScope.error = '';
    $rootScope.message = '';

    var todaydate = new Date();
    var dateconfig = new Date(new Date().setMinutes(0));
    var url = $location.absUrl();
    var oldtimeSlotLen = 0;

    console.log(dateconfig, todaydate);

    var vm = this;
    vm.propsavail = 1;
    vm.timeslotmodified = "false";
    vm.isDisabled = false;
    vm.googleAddress = 0;

    vm.city = '';
    vm.province = '';
    vm.postcode = ''; 
    vm.country = '';
    vm.noofunits = 0;

    vm.table = 1;
    vm.csv = 0;
    vm.localpropID = '';

    if (url.endsWith('addunits') == true) {

        if (localStorage.getItem("propID") != null) {
            vm.localpropID = localStorage.getItem("propID");

        } else {
            $state.go('viewprop');
        }
    }

    firebase.database().ref('users/' + localStorage.getItem('userID')).once("value", function(snap) {
        vm.landlordname = snap.val().firstname + " " + snap.val().lastname;
    });

    $scope.$on('gmPlacesAutocomplete::placeChanged', function() {
        var address = vm.prop.address.getPlace();
        var arrAddress = address.address_components;
        vm.googleAddress = 1;
        vm.prop.address = address.formatted_address;

        var itemRoute = '';
        var itemLocality = '';
        var itemCountry = '';
        var itemPc = '';
        var itemSnumber = '';
        var street_number = '';

        $.each(arrAddress, function(i, address_component) {
            if (address_component.types[0] == "street_number") {
                itemSnumber = address_component.long_name;
                street_number += address_component.long_name + ",";
            }

            if (address_component.types[0] == "route") {
                itemRoute = address_component.long_name;
                var route = address_component.long_name;
                vm.prop.address = street_number + address_component.long_name;
            }

            if (address_component.types[0] == "administrative_area_level_1") {
                itemRoute = address_component.short_name;
                vm.prop.province = address_component.short_name;
            }

            if (address_component.types[0] == "locality") {
                itemLocality = address_component.long_name;
                vm.prop.city = address_component.long_name;
            }

            if (address_component.types[0] == "country") {
                itemCountry = address_component.long_name;
                vm.prop.country = address_component.long_name;
            }

            if (address_component.types[0] == "postal_code_prefix") {
                itemPc = address_component.long_name;
            }


            if (address_component.types[0] == "postal_code") {
                itemSnumber = address_component.long_name;

                vm.prop.postcode = address_component.long_name;
            }

            if (address_component.types[0] == "sublocality_level_1") {
                itemRoute = address_component.long_name;
                vm.prop.address = address_component.long_name;

            }

        });


        vm.addresschange();
        $scope.$apply();
    });

    vm.copy = "Copy Link";
    $scope.copySuccess = function(e) {
        vm.copy = "Copied";
        $scope.$apply();
    };

    vm.csvform = function() {
        vm.table = 0;
        vm.csv = 1;

    }

    // timeSlot for Date and Timepicker
    vm.addTimeSlot = function(slotlen) {

        for (var i = 0; i < slotlen; i++) {
            vm.newTime = false;
        }

        vm.timeSlot.push({
            date: dateconfig
        });
        vm.prop.multiple[slotlen] = true;
        vm.newTime = true;

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
        if (moment(to).format('HH:mm') < moment(temp).format('HH:mm') && vm.prop.timeoverlapinvalid[key] == 0) {
            vm.prop.timeinvalid[key] = 1;
            vm.isDisabled = true;
        } else {
            vm.prop.timeinvalid[key] = 0;
        }

        if ((vm.prop.multiple[key] === false || vm.prop.multiple[key] === undefined) && vm.prop.timeinvalid[key] == 0) {
            var minutestimediff = (to - fromtime) / 60000;
            var subslots = Math.floor(Math.ceil(minutestimediff) / 30);

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
        var propimg = '';


        var propertyObj = $firebaseAuth();

        var propdbObj = firebase.database();

        var propID = property.propID;
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

        if (file != undefined) {
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
                if (data.Location != '') {
                    propimg = data.Location;
                    // Start Of property Add
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
                            noofunits:multiple,
                            country: country,
                            postcode: postcode,
                            date: moment().format('YYYY-MM-DD:HH:mm:ss'),
                            multiple: multiple,
                            name: name
                        }).then(function() {
                            console.log("Insert Data successfully!");

                            propdbObj.ref('properties/').limitToLast(1).once("child_added", function(snapshot) {
                                localStorage.setItem("propID", snapshot.key);
                            });

                            $rootScope.$apply(function() {
                                console.log(units);
                                if (units === 'multiple') {
                                    $rootScope.message = "multiple";
                                    $rootScope.success = "Your Property Added successfully!";
                                } else {
                                    localStorage.removeItem("propID");
                                    $rootScope.success = "Your Property Added successfully!";
                                    setTimeout(function(){ $state.go('viewprop'); }, 2000);
                                    
                                }


                            });


                        });
                    }else{
                            propdbObj.ref('properties/'+propID).update({
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
                                noofunits:multiple,
                                date: moment().format('YYYY-MM-DD:HH:mm:ss'),
                                multiple: multiple,
                                name: name
                        }).then(function(){
                              $rootScope.$apply(function() {
                                console.log(units);
                                if (units === 'multiple') {
                                     localStorage.setItem("propID",propID);
                                    $rootScope.success = "Your Property Updated successfully!";
                                     $rootScope.message = "Add units";
                                } else {
                                    localStorage.removeItem("propID");
                                    $rootScope.success = "Your Property Updated successfully!";
                                    setTimeout(function(){ $state.go('viewprop'); }, 2000);
                                    
                                }


                            });
                        });
                    } // End OF property Add - Edit
                }
            });

        } else {
            
            // Start Of property Add
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
                    noofunits:multiple,
                    postcode: postcode,
                    date: moment().format('YYYY-MM-DD:HH:mm:ss'),
                    multiple: multiple,
                    name: name
                }).then(function() {
                    console.log("Insert Data successfully!");

                    propdbObj.ref('properties/').limitToLast(1).once("child_added", function(snapshot) {
                        localStorage.setItem("propID", snapshot.key);
                    });

                       $rootScope.$apply(function() {
                            console.log(units);
                            if (units === 'multiple') {
                                $rootScope.message = "multiple";
                                $rootScope.success = "Your Property Added successfully!";
                            } else {
                                localStorage.removeItem("propID");
                                $rootScope.success = "Your Property Added successfully!";
                                setTimeout(function(){ $state.go('viewprop'); }, 2000);
                                
                            }


                        });



                });
            }else{
                            propdbObj.ref('properties/'+propID).update({
                                landlordID: landlordID,
                                propstatus: propstatus,
                                proptype: proptype,
                                units: units,
                                shared: shared,
                                address: address,
                                city: city,
                                province: province,
                                country: country,
                                noofunits:multiple,
                                postcode: postcode,
                                date: moment().format('YYYY-MM-DD:HH:mm:ss'),
                                multiple: multiple,
                                name: name
                        }).then(function(){
                              $rootScope.$apply(function() {
                                console.log(units);
                                if (units === 'multiple') {
                                     localStorage.setItem("propID",propID);
                                    $rootScope.success = "Your Property Updated successfully!";
                                    $rootScope.message = "Add units";
                                } else {
                                    localStorage.removeItem("propID");
                                    $rootScope.success = "Your Property Updated successfully!";
                                    setTimeout(function(){ $state.go('viewprop'); }, 2000);
                                    
                                }


                            });
                        });
                    } // End OF property Add-edit
        }




    }

    vm.csvadd = function() {
        console.log(vm.localpropID);
        var fileUpload = document.getElementById("file");
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv)$/;
        if (regex.test(fileUpload.value.toLowerCase())) {
            if (typeof(FileReader) != "undefined") {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var rows = e.target.result.split("\n");
                    var result = [];
                    var headers = rows[0].split(",");
                    var totalunits = 0;
                    for (var i = 1; i < parseInt(rows.length - 1); i++) {
                        totalunits = i;
                        var obj = {};
                        var currentline = rows[i].split(",");

                        for (var j = 0; j < headers.length; j++) {

                            var headerkey = headers[j];
                            headerkey = headerkey.replace(/[^a-zA-Z ]/g, "")
                            obj[headerkey] = currentline[j];
                        }
                        result.push(obj);
                    }
                    console.log(result);
                    firebase.database().ref('properties/' + vm.localpropID).update({
                        unitlists: result,
                        totalunits: totalunits
                    }).then(function() {
                        $rootScope.success = "Your Units added successfully!";
                        setTimeout(function(){ $state.go('viewprop'); }, 2000);
                    }, function(error) {
                       $rootScope.error = "Please Check your CSV file Having issue with the data!";
                    });
                }

                reader.readAsText(fileUpload.files[0]);



            } else {
                alert("This browser does not support HTML5.");
            }
        } else {
            alert("Please upload a valid CSV file.");
        }

    }

    if($state.current.name == 'addunits'){

         var ref = firebase.database().ref("/properties/" +localStorage.getItem("propID")).once('value').then(function(snapshot) {

            var propData = snapshot.val();
            console.log(propData);
             vm.timeSlot = [];
            $scope.$apply(function() {
                vm.units = {
                    propID: snapshot.key,
                    landlordID: propData.landlordID,
                    propimg: propData.propimg,
                    propstatus: propData.propstatus,
                    proptype: propData.proptype,
                    units: propData.units,
                    rent: propData.rent,
                    shared: propData.shared,
                    address: propData.address,
                    noofunits: propData.multiple,
                    city: propData.city,
                    province: propData.province,
                    postcode: propData.postcode,
                    country: propData.country,
                    propimage: propData.propimg,
                    unitlists: propData.unitlists,
                    name: propData.name,
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
            });
        });
    }


    if ($state.current.name == 'viewunits') {

        var ref = firebase.database().ref("/properties/" + $stateParams.propId).once('value').then(function(snapshot) {
            var propertiesData = snapshot.val();
            $scope.$apply(function() {
                vm.units = {
                    mode: 'View',
                    propID: snapshot.key,
                    address: propertiesData.address,
                    city: propertiesData.city,
                    country: propertiesData.country,
                    date: propertiesData.date,
                    landlordID: propertiesData.landlordID,
                    name: propertiesData.name,
                    postcode: propertiesData.postcode,
                    propimg: propertiesData.propimg,
                    propstatus: propertiesData.propstatus,
                    proptype: propertiesData.proptype,
                    province: propertiesData.province,
                    shared: propertiesData.shared,
                    totalunits: propertiesData.totalunits,
                    units: propertiesData.units,
                    unitlists: propertiesData.unitlists,
                }
            });
        });

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
                    noofunits: propData.totalunits,
                    city: propData.city,
                    province: propData.province,
                    postcode: propData.postcode,
                    country: propData.country,
                    propimage: propData.propimg,
                    unitlists: propData.unitlists,
                    noofunits: propData.noofunits,
                    name: propData.name,
                    multiple: [],
                    mode: 'Edit',
                    date: [],
                    fromtime: [],
                    to: [],
                    limit: [],
                    propertylink: propData.propertylink,
                    invalid: [0],
                    timeinvalid: [0],
                    timeoverlapinvalid: [0]
                }
                /*   angular.forEach(propData.date, function(value, key) {
                       vm.timeSlot.push({
                           date: new Date(value)
                       });
                       vm.prop.date.push(new Date(value));
                       vm.prop.fromtime.push(new Date(propData.fromtime[key]));
                       vm.prop.to.push(new Date(propData.to[key]));
                       vm.prop.limit.push(propData.limit[key]);
                       vm.prop.multiple.push(propData.multiple[key]);
                   });*/
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
            mode: 'Add',
            propimage: 'http://www.placehold.it/200x150/EFEFEF/AAAAAA&amp;text=no+image',
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

    vm.deleteproperty = function(propID) {
        var propertyObj = $firebaseAuth();
        var propdbObj = firebase.database();
        firebase.database().ref('properties/' + propID).once("value", function(snap) {

            vm.property_address = snap.val().address;
            if ($window.confirm("Do you want to continue?")) {
                propdbObj.ref('properties/' + propID).remove();
                firebase.database().ref('applyprop/').orderByChild("propID").equalTo(propID).once("value", function(snapshot) {
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
                    //$state.go('viewprop');
                    $state.reload();
                });
            }

        });
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

    vm.moreaction = function(val){
       
            var arr = [];
            var selectedCountry = new Array();
                var n = $("#ts_checkbox:checked").length;

                if (n > 0){
                    $("#ts_checkbox:checked").each(function(){
                         if(val === 'DAll'){
                            $('#'+$(this).val()).remove();
                         }
                         if(val === 'Mavailable'){
                                vm.units.status  = 'Available';
                         }
                         if(val === 'Mranted'){
                                vm.units.status  = 'rented';
                         }
                    });
                }else{
                        alert("Select Atleast one row");
                }
       
       
    }

    vm.addmorerow = function(val){
        vm.units.noofunits = parseInt(val + 1);
    }
    vm.addmorerowedit = function(val){
        vm.prop.noofunits = parseInt(val + 1);
    }

    vm.submiteditunits = function(unitlists,prop){
        //console.log(unitlists); return false;
        var fullformarary = [];
        var propID = prop.propID;
        var address = prop.address;
        var name  = prop.name;
        var type  = prop.proptype;
        var city  = prop.city;
        var state  = prop.province;
        var postalcode  = prop.postcode;
        var location  = prop.address;

        var totalunits = 0;
        for(var i = 0; i < unitlists.length; i++) {
                var obj = unitlists[i];
               
                fullformarary.push({
                    unit: obj.unit,
                    name : name,
                    type : type,
                    address : obj.address,
                    city : city,
                    state : state,
                    postalcode : postalcode,
                    location : obj.address,
                    sqft : obj.sqft,
                    bedroom  :obj.bathroom,
                    bathroom : obj.bathroom,
                    rent : obj.rent,
                    description : '',
                    status : obj.status,
                    epirydate : '',
                    Aminities : obj.Aminities,
                    cats : '',
                    dogs : '',
                    smoking : '',
                    furnished : '',
                    wheelchair : ''
                });
                totalunits++;
            }

            firebase.database().ref('properties/' + propID).update({
                unitlists: fullformarary,
                totalunits: totalunits,
                noofunits : totalunits
            }).then(function() {
                if (confirm("Units Updated successfully!") == true) {
                    localStorage.removeItem('propID');
                    localStorage.removeItem('units');
                    localStorage.removeItem('propName');
                    $state.go('viewprop');
                } else {
                    return false;
                }
            }, function(error) {
                if (confirm("Units Not added Please Try again!") == true) {
                    return false;
                }
            });
    }


    vm.submitunits = function(units) {
      
        var num = units.number;
        var rent = units.rent;
        var sqft = units.sqft;
        var status = units.status;
        var bath = units.bath;
        var bed = units.bed;
        var aminities1 = units.Aminities;
        var fullformarary = [];

        
        var address = units.address;
        var name  = units.name;
        var type  = units.proptype;
        var city  = units.city;
        var state  = units.province;
        var postalcode  = units.postcode;
        var location  = units.address;
        var bedroom   = [];
        var bathroom  = [];
        var description  = [];
        var status  = units.status;
        var epirydate  = [];
        var cats  = [];
        var dogs  = [];
        var smoking  = [];
        var furnished  = [];
        var wheelchair  = [];


        var number = [];
        var rentarray = [];
        var sqftarray = [];
        var statusarray = [];
        var textarray = [];
        var batharray = [];
        var bedarray = [];
        var Aminitiesarray = [];

        for (var prop in num) {
            if (num.hasOwnProperty(prop)) {
                number.push(num[prop]);
            }
        }

 

        for (var prop in rent) {
            if (rent.hasOwnProperty(prop)) {
                rentarray.push(rent[prop]);
            }
        }
 
        for (var prop in sqft) {
            if (sqft.hasOwnProperty(prop)) {
                sqftarray.push(sqft[prop]);
            }
        }

        for (var prop in status) {
            if (status.hasOwnProperty(prop)) {
                statusarray.push(status[prop]);
            }
        }

        /*for (var prop in text) {
            if (text.hasOwnProperty(prop)) {
                textarray.push(text[prop]);
            }
        }*/

        for (var prop in bath) {
            if (bath.hasOwnProperty(prop)) {
                batharray.push(bath[prop]);
            }
        }

        for (var prop in bed) {
            if (bed.hasOwnProperty(prop)) {
                bedarray.push(bed[prop]);
            }
        }

        for (var prop in aminities1) {
            if (aminities1.hasOwnProperty(prop)) {
                Aminitiesarray.push(aminities1[prop]);
            }
        }
       
        var totalunits = 0;
        for (var i = 0; i < number.length; i++) {

            fullformarary.push({
                unit: number[i],
                name : name,
                type : type,
                address : units.address,
                city : city,
                state : state,
                postalcode : postalcode,
                location : address,
                sqft : sqftarray[i],
                bedroom  :bedarray[i],
                bathroom : batharray[i],
                rent : rentarray[i],
                description : '',
                status : statusarray[i],
                epirydate : '',
                Aminities : Aminitiesarray[i],
                cats : '',
                dogs : '',
                smoking : '',
                furnished : '',
                wheelchair : ''
            });
            totalunits++;
        }


 
        firebase.database().ref('properties/' + vm.localpropID).update({
            unitlists: fullformarary,
            totalunits: totalunits,
             noofunits : totalunits
        }).then(function() {
            if (confirm("Units added successfully!") == true) {
                localStorage.removeItem('propID');
                localStorage.removeItem('units');
                localStorage.removeItem('propName');
                $state.go('viewprop');
            } else {
                return false;
            }
        }, function(error) {
            if (confirm("Units Not added Please Try again!") == true) {
                return false;
            }
        });

    }


    $scope.items = [
        'The first choice!',
        'And another choice for you.',
        'but wait! A third!'
    ];

    $scope.status = {
        isopen: false
    };

    $scope.toggled = function(open) {
        $log.log('Dropdown is now: ', open);
    };

    $scope.toggleDropdown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };

    $scope.appendToEl = angular.element(document.querySelector('#dropdown-long-content'));

  
   
}]);

