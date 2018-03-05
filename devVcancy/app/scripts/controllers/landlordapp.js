'use strict';

//=================================================
// Landlord Applications
//=================================================

vcancyApp
	.controller('landlordappCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', '$uibModal', '_', '$q', 'emailSendingService',
		function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams, $uibModal, _, $q, emailSendingService) {
			$scope.oneAtATime = true;
			var vm = this;
			vm.moment = moment;
			var landlordID = ''
			if (localStorage.getItem('refId')) {
				landlordID = localStorage.getItem('refId')
			} else {
				landlordID = localStorage.getItem('userID');
			}
			vm.landLordID = landlordID;
			var userData = JSON.parse(localStorage.getItem('userData'));
			var userEmail = localStorage.getItem('userEmail');
			vm.userData = userData;
			vm.propcheck = [];
			vm.applyPropUsers = {};
			vm.apppropaddress = [];
			vm.originalPropAddress = [];
			vm.loader = 1;
			vm.creditCheck = {
				reportType: "Both of the above $45/Report",
				forTenant: ''
			}
			// Function to generate Random Id
			function generateToken() {
				var result = '',
					length = 6,
					chars = 'ABCEDFGHIJKLMNOPQRSTUVWXYZ0123456789';

				for (var i = 0; i < length; i++)
					result += chars[Math.floor(Math.random() * chars.length)];

				return result;
			}

			vm.questionDropDown = [
				{ id: 'WKRX6Q', label: 'Job title', isChecked: false },
				{ id: 'MV5SML', label: 'Do you have Pets? Provide details', isChecked: true },
				{ id: 'N1F5MO', label: 'Are you able to provide references', isChecked: false },
				{ id: 'OU489L', label: 'Why are you moving', isChecked: false },
				{ id: 'U0G6V8', label: 'Tell me a bit about yourself', isChecked: true },
				{ id: 'A9OG32', label: 'No. of Applicants', isChecked: true },
				{ id: 'UH7JZS', label: 'Do you smoke?', isChecked: true },
				{ id: 'ZGJQ60', label: 'Move-in date', isChecked: true },
			];

			vm.filters = {
				options: [],
			};

			vm.defaultRentalApplicationCheck = {
				'PAPPD': true,
				'CADDR': true,
				'PADDR': false,
				'AAPPD': false,
				'AAPP1': false,
				'AAPP2': false,
				'ESIV': true,
				'ESIV1': true,
				'V1': false,
				'EC': false,
				'EC1': false,
				'REF': true,
				'REF1': true,
				'REF2': false,
				'UD': true,
				'UDAAPP': false,
				'TC': true
			}

			function refreshCustomRentalApplicationCheck() {
				userData = JSON.parse(localStorage.getItem('userData'));
				vm.userData = userData;
				if (userData && userData.customRentalApplicationCheck) {
					vm.customRentalApplicationCheck = userData.customRentalApplicationCheck;
				} else {
					vm.customRentalApplicationCheck = angular.copy(vm.defaultRentalApplicationCheck);
				}
			}
			refreshCustomRentalApplicationCheck();

			function refreshScreeningQuestions() {
				userData = JSON.parse(localStorage.getItem('userData'));
				vm.userData = userData;
				if (userData && userData.screeningQuestions && userData.screeningQuestions.length !== 0) {
					vm.screeningQuestions = userData.screeningQuestions;
				} else {
					vm.screeningQuestions = angular.copy(vm.questionDropDown);
				}
			}
			refreshScreeningQuestions();

			vm.getUsers = function () {
				if (vm.apppropaddressList) {
					vm.loader = 1;
					var promises = [];
					_.map(vm.apppropaddressList, function (value, key) {
						var promiseObj = firebase.database().ref('users/' + value.tenantID).once("value");
						promises.push(promiseObj);
					});
					$q.all(promises).then(function (data) {
						var usersData = {};
						data.forEach(function (dataObj) {
							usersData[dataObj.key] = dataObj.val();
						});
						vm.applyPropUsers = usersData;
						vm.apppropaddress = vm.apppropaddressList;
						vm.loader = 0;
					});
				}
			}

			vm.getProperty = function () {
				vm.loader = 1;
				var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
					if (snapshot.val()) {
						vm.properties = snapshot.val();
					}
					vm.loader = 0;
				});
			};

			vm.getApplyProp = function () {
				vm.loader = 1;
				vm.apppropaddress = {};
				var propdbObj = firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
					if (snapshot.val()) {
						$scope.$apply(function () {
							vm.apppropaddressList = snapshot.val();
							vm.getUsers();
							vm.originalPropAddress = angular.copy(snapshot.val());
							console.log(vm.apppropaddressList);
						});
					}
					$scope.$apply(function () {
						vm.loader = 0;
					});
				});
			};

			vm.companyDetail = function () {
				return vm.userData.companyname + ' ' + (',' + vm.userData.contact || '')
			}

			vm.getUserName = function (id, value) {
				if (!vm.applyPropUsers[id]) {
					return value.name || '-';
				}
				return vm.applyPropUsers[id].firstname + ' ' + vm.applyPropUsers[id].lastname;
			}

			$scope.formatDay = function (key) {
				return moment(key, 'MM/DD/YYYY').format('ddd')
			};

			$scope.formatDate = function (key) {
				return moment(key, 'MM/DD/YYYY').format('MMM DD')
			};

			vm.init = function () {
				vm.getProperty();
				vm.getApplyProp();
			};

			vm.init();

			vm.openPrescremingQuestions = function () {
				vm.prescremingQuestion = $uibModal.open({
					templateUrl: 'prescremingquestions.html',
					backdrop: 'static',
					size: 'lg',
					scope: $scope
				});
			};
			vm.filterData = function (forProperty) {
				var properties = angular.copy(vm.originalPropAddress);
				vm.apppropaddress = properties;
				if (vm.filters.property) {
					var obj = {};
					_.filter(properties, function (value, key) {
						if (value.propID == vm.filters.property) {
							obj[key] = value;
						}
					});
					vm.apppropaddress = obj;
				}
				if (vm.filters.unit && vm.filters.unit.length > 0) {
					var unitItems = {};
					var unitIds = _.reduce(vm.filters.unit, function (previousValue, currentValue, key) {
						if (currentValue.unit) {
							previousValue.push(parseInt(currentValue.unit));
						}
						return previousValue;
					}, []);
					_.filter(properties, function (value, key) {
						if (value.propID == vm.filters.property && unitIds.includes(parseInt(value.unitID))) {
							unitItems[key] = value;
						}
					});
					vm.apppropaddress = unitItems;
					return
				}

				vm.apppropaddress = obj;
			}

			vm.customQuestion = null;
			vm.addCustomQuestion = function () {
				if (!vm.customQuestion) {
					return;
				}
				var data = {
					label: vm.customQuestion,
					id: generateToken(),
					isChecked: false
				}

				vm.screeningQuestions.push(data);
				vm.customQuestion = null;
			}

			vm.saveScreeningQuestions = function () {
				vm.loader = 1;
				var ques = angular.copy(vm.screeningQuestions);
				_.omit(ques, '$$hashKey');
				firebase.database().ref('users/' + this.landLordID).update({
					screeningQuestions: ques
				}).then(function () {
					userData.screeningQuestions = ques;
					localStorage.setItem('userData', JSON.stringify(userData));
					refreshScreeningQuestions();
					vm.loader = 0;
					vm.prescremingQuestion.close();
				}, function (error) {
					vm.loader = 0;
					return false;
				});
			}

			vm.saveCustomRentalApplicationCheck = function () {
				vm.loader = 1;
				var customChecks = angular.copy(vm.customRentalApplicationCheck);
				_.omit(customChecks, '$$hashKey');
				firebase.database().ref('users/' + this.landLordID).update({
					customRentalApplicationCheck: customChecks
				}).then(function () {
					userData.customRentalApplicationCheck = customChecks;
					localStorage.setItem('userData', JSON.stringify(userData));
					refreshCustomRentalApplicationCheck();
					vm.loader = 0;
					vm.customrentalapp.close();
				}, function (error) {
					vm.loader = 0;
					return false;
				});
			}

			vm.opencustomrentalapp = function () {
				vm.customrentalapp = $uibModal.open({
					templateUrl: 'customrentalapp.html',
					backdrop: 'static',
					size: 'lg',
					scope: $scope
				});
			};

			vm.deleteQuestionById = function (id) {
				var index = vm.screeningQuestions.findIndex(function (ques) {
					if (ques.id == id) return true;
				});
				vm.screeningQuestions.splice(index, 1);
			};


			vm.openruncreditcriminalcheck = function () {
				vm.runcreditcriminalcheck = $uibModal.open({
					templateUrl: 'runcreditcriminalcheck.html',
					backdrop: 'static',
					size: 'lg',
					scope: $scope
				});
			};

			$scope.closePrescreeningModal = function () {
				vm.prescremingQuestion.close();
			}

			$scope.closecustomrentalappModal = function () {
				vm.customrentalapp.close();
			}

			$scope.closeruncreditcriminalcheckModal = function () {
				vm.runcreditcriminalcheck.close();
				vm.creditCheck = {
					reportType: "Both of the above $45/Report",
					forTenant: ''
				}
			}

			$scope.submitCreditCheck = function () {
				var tenantData = vm.applyPropUsers[vm.creditCheck.forTenant];
				if (!tenantData) {
					return;
				}
				swal({
					title: "Are you sure?",
					text: "Your account will be charged with the amount specified.",
					type: "info",
					showCancelButton: true,
					confirmButtonClass: "bgm-teal",
					confirmButtonText: "Yes",
					closeOnConfirm: false
				},
					function () {
						var userName = '';
						if (userData) {
							userName = userData.firstname + ' ' + (userData.lastname || '');
						}
						var tenantUserName = tenantData.firstname + ' ' + (tenantData.lastname || '');
						var emailData = '<p>Hello, </p><p>Landlord - ' + userName + ' (' + userEmail + ') has requested credit report of tenant - ' + tenantUserName + ' (' + tenantData.email + ') for type - ' + vm.creditCheck.reportType + '</p>';
						var toEmail = 'creditrequest@vcancy.com';
						emailSendingService.sendEmailViaNodeMailer(toEmail, 'Landlord request for Credit/Criminal Report', 'Request Credit?criminal Check Report', emailData);
						swal("", "Your request has been submitted successfully!", "success");
						var requestData = {
							tenantID: vm.creditCheck.forTenant,
							tenantEmail: tenantData.email,
							landlordID: landlordID,
							landlordEmail: userEmail,
							requestType: vm.creditCheck.reportType,
							requestedOn: moment().format('x'),
							status: 'PENDING'
						}
						firebase.database().ref('credit_report_request/').push().set(requestData);
						$scope.closeruncreditcriminalcheckModal();
					});

			}

			vm.tablefilterdata = function (propID = '') {
				if (propID != '') {
					vm.propcheck[propID] = !vm.propcheck[propID];
				}
				vm.loader = 1;
				firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
					// console.log(snapshot.val())
					$scope.$apply(function () {
						if (snapshot.val() != null) {
							$.map(snapshot.val(), function (value, index) {
								if (vm.apppropaddress.findIndex(x => x.propID == value.propID) == -1 && value.schedulestatus == "submitted") {
									vm.apppropaddress.push({ propID: value.propID, address: value.address, units: value.units });
									vm.propcheck[value.propID] = true;
								}
							});
						}
						vm.submitappsdata = [];

						if (snapshot.val() != null) {
							vm.submittedappsavail = 0;
							//to map the object to array
							vm.submitappsdata = $.map(snapshot.val(), function (value, index) {
								if (vm.propcheck[value.propID] == true || propID == '') {
									if (value.schedulestatus == "submitted") {
										vm.submittedappsavail = 1;
										return [{ scheduleID: index, name: value.name, age: value.age, profession: value.jobtitle, schedulestatus: value.schedulestatus }];
									}
								}
							});

							angular.forEach(vm.submitappsdata, function (schedule, key) {
								firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(schedule.scheduleID).once("value", function (snapshot) {
									$scope.$apply(function () {
										if (snapshot.val()) {
											$.map(snapshot.val(), function (value, index) {
												vm.submitappsdata[key].applicationID = index;
												vm.submitappsdata[key].pets = value.pets;
												vm.submitappsdata[key].maritalstatus = value.maritalstatus;
												vm.submitappsdata[key].appno = value.applicantsno;
												firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(index).once("value", function (snap) {
													$scope.$apply(function () {
														if (snap.val()) {
															$.map(snap.val(), function (v, k) {
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


						} else {
							vm.submitappsdata = [{ scheduleID: '', name: '', age: '', profession: '', salary: '', pets: '', maritalstatus: '', appno: '', schedulestatus: '' }];

							vm.submittedappsavail = 0;
						}

						console.log(vm.submittedappsavail);
						vm.submitappscols = [
							{ field: "name", title: "Name", sortable: "name", show: true },
							{ field: "age", title: "Age", sortable: "age", show: true },
							{ field: "profession", title: "Job Title", sortable: "profession", show: true },
							{ field: "salary", title: "Salary", sortable: "salary", show: true },
							{ field: "pets", title: "Pets", sortable: "pets", show: true },
							{ field: "maritalstatus", title: "Marital Status", sortable: "maritalstatus", show: true },
							{ field: "appno", title: "No of Applicants", sortable: "appno", show: true },
						];

						vm.loader = 0;

						//Sorting
						vm.submitappsSorting = new NgTableParams({
							sorting: { name: 'asc' }
						},

							{
								dataset: vm.submitappsdata
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
					});
				});

			}
			// vm.tablefilterdata();

			vm.deleteApplyProp = function (key) {
				swal({
					title: "Are you sure?",
					text: "This will delete the schedule from the system.",
					type: "warning",
					showCancelButton: true,
					confirmButtonClass: "btn-danger",
					confirmButtonText: "Delete",
					closeOnConfirm: true
				}, function () {
					firebase.database().ref('applyprop/' + key).update({
						schedulestatus: "cancelled"
					}).then(function () {
						vm.getApplyProp();
					})
						.catch(function (err) {
							console.error('ERROR', err);
							swal("", "There was error deleteing the schedule.", "error");
						});

				});
			}
		}])