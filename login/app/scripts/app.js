'use strict';

/**
 * @ngdoc overview
 * @name vcancyApp
 * @description
 * # vcancyApp
 *
 * Main module of the application.
 */
var vcancyApp = angular
  .module('vcancyApp', [
    //'ngRoute'
    'ngResource',
    'ui.router',
    'ui.bootstrap',
    'angular-loading-bar',
    'oc.lazyLoad',
    'nouislider',
    'ngTable',
	// 'ngTableDemos',
	'firebase',
	'ng-clipboard',
	'angularMoment',
	'gm',
	'unsavedChanges',
	'AngularPrint',
	'ngFileUpload'
  ]); 
 
	
vcancyApp.constant('config', {
   "sailsBaseUrl": 'http://35.182.211.61/nodeapi/api/v1/',
});

vcancyApp.service('emailSendingService',function($http,config){
	this.sendEmailViaNodeMailer = function(to,subject,mode,emailData){
		var req = {
			 method: 'POST',
			// url: 'http://localhost:1337/email/sendemail',
			 url: config.sailsBaseUrl+'email/sendemail',
			 headers: {
			    'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				"Access-Control-Allow-Headers": "Content-Type,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
			 },
			 data: { 
				to: to,
				subject: subject,
				mode: mode,
				emailData: emailData
				}
			}

		$http(req).then(function successCallback(response) {	
			console.log("Done");
		}, function errorCallback(response) {
			console.log("Fail");
		});
	}
});  
  
vcancyApp
.service('slotsBuildService', function(){
   this.maketimeslots = function(date,ftime,totime,limit,multiple) {
	   	   
		var slots = [];
	   
		angular.forEach(date, function(value, key) { 
			var fromtime = new Date(ftime[key]);
			var to = new Date(totime[key]);
			
			var minutestimediff = (to - fromtime)/ 60000;
			var subslots = Math.floor(Math.ceil(minutestimediff)/30);
			
		    var temp = 0;
			for(var i=0; i<subslots; i++){
			   if(temp == 0){
				   temp = fromtime;
			   } 		   
			   var f = temp;
			   var t = new Date(f.getTime() + (30 * 60 * 1000)); // 30 minutes add to from time 
			   var temp = t;
			   slots.push({date:value, fromtime:f, to:t, person: limit[key], multiple: multiple[key], dateslotindex: key});
			   
			   // temp = new Date(t.getTime() + (1 * 60 * 1000)); // 1 minute add to TO time
			}  
		});
	   
	  // console.log(slots);
      return slots;
   }	
});
  
  
vcancyApp  
 .directive('loginHeader', function() {
  return {
    controller: 'headerCtrl',
	controllerAs: 'hctrl',
	templateUrl: 'views/template/header-top.html',
  };
}); 

vcancyApp  
 .directive('loginSidebar', function() {
  return {
    controller: 'maCtrl',
	controllerAs: 'mactrl',
	templateUrl: 'views/template/sidebar-left.html',
  };
}); 

vcancyApp 
.directive('autoSize', function(){
        return {
            restrict: 'A',
            link: function(scope, element){
                if (element[0]) {
                   autosize(element);
                }
            }
        }
    })
 // vcancyApp
 // .directive('fullCalendar', function(){
        // return {
            // restrict: 'A',
            // link: function(scope, element) {
                // element.fullCalendar({
                    // contentHeight: 'auto',
                    // theme: true,
                    // header: {
                        // right: '',
                        // center: 'prev, title, next',
                        // left: ''
                    // },
                    // defaultDate: '2014-06-12',
                    // editable: true,
                    // events: [
                        // {
                            // title: 'All Day',
                            // start: '2014-06-01',
                            // className: 'bgm-cyan'
                        // },
                        // {
                            // title: 'Long Event',
                            // start: '2014-06-07',
                            // end: '2014-06-10',
                            // className: 'bgm-orange'
                        // },
                        // {
                            // id: 999,
                            // title: 'Repeat',
                            // start: '2014-06-09',
                            // className: 'bgm-lightgreen'
                        // },
                        // {
                            // id: 999,
                            // title: 'Repeat',
                            // start: '2014-06-16',
                            // className: 'bgm-blue'
                        // },
                        // {
                            // title: 'Meet',
                            // start: '2014-06-12',
                            // end: '2014-06-12',
                            // className: 'bgm-teal'
                        // },
                        // {
                            // title: 'Lunch',
                            // start: '2014-06-12',
                            // className: 'bgm-gray'
                        // },
                        // {
                            // title: 'Birthday',
                            // start: '2014-06-13',
                            // className: 'bgm-pink'
                        // },
                        // {
                            // title: 'Google',
                            // url: 'http://google.com/',
                            // start: '2014-06-28',
                            // className: 'bgm-bluegray'
                        // }
                    // ]
                // });
            // }
        // }
    // }) 
	

 vcancyApp
 .directive('fullCalendar', function(){
        return {
            restrict: 'A',
			scope: {
				calendardata: '=' //Two-way data binding
			},
            link: function(scope, element) {
				console.log(scope.calendardata);
                element.fullCalendar({
                    contentHeight: 'auto',
                    theme: true,
                    header: {
                        right: '',
                        center: 'prev, title, next',
                        left: ''
                    },
                    defaultDate: new Date(),
                    editable: true,
					
                    events: scope.calendardata
                });
            }
        }
    }) 	

	
vcancyApp 
 .config(function ($stateProvider, $urlRouterProvider){	
	  // Initialize Firebase
	  var config = {
		apiKey: "AIzaSyAM5ga-meRv9xYWKsCjDj-qYv3TD1ivLCA",
		authDomain: "vcancy-5e3b4.firebaseapp.com",
		databaseURL: "https://vcancy-5e3b4.firebaseio.com",
		projectId: "vcancy-5e3b4",
		storageBucket: "vcancy-5e3b4.appspot.com",
		messagingSenderId: "330892868858"
	  };
	  var app = firebase.initializeApp(config);	 
	  
	  // var sailsBaseUrl = 'http://35.182.211.61/api/v1/';
	
	$urlRouterProvider.otherwise("/");
	$stateProvider	
		// Public Routes
	   .state ('login', {
			url: '/',
			controller: 'loginCtrl',
			controllerAs: 'lctrl',
			templateUrl: 'views/login.html',	
		}) 
		
		.state ('termsofuse', {
			url: '/termsofuse',
			templateUrl: 'views/termspublic.html',	
		}) 
		
		.state ('viewexternalapplication', {
			url: '/viewexternalapp/{appID}',
			controller: 'viewappCtrl',
			controllerAs: 'vappctrl',
			templateUrl: 'views/view_rental_app_form.html',
		})
		
		// Landlord Routes
		.state ('landlorddashboard', {
			url: '/landlorddboard',
			controller: 'landlorddboardlCtrl',
			controllerAs: 'ldboardctrl',
			templateUrl: 'views/landlord.html',
			resolve: { authenticate: authenticate }
		})
		
		.state ('viewprop', {
			url: '/myprop',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/viewproperties.html',
			resolve: { authenticate: authenticate }
		}) 
		
		.state ('editprop', {
			url: '/editprop/{propId}',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/addproperties.html',
			resolve: { authenticate: authenticate }
		})
		
		.state ('customemailhandler', {
			url: '/auth?{mode}&{oobCode}&{apiKey}',
			controller: 'emailhandlerCtrl',
			controllerAs: 'ehandlectrl',
			templateUrl: 'views/customhandler.html',
		})
		
		 .state ('addprop', {
			url: '/addprop',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/addproperties.html',
			resolve: { authenticate: authenticate }
		})
		
		.state ('schedule', {
			url: '/schedule',
			controller: 'scheduleCtrl',
			controllerAs: 'schedulectrl',
			templateUrl: 'views/schedule.html',
			resolve: { authenticate: authenticate }
		})
		
		.state ('app', {
			url: '/app',
			controller: 'landlordappCtrl',
			controllerAs: 'lappctrl',
			templateUrl: 'views/app.html',
			resolve: { authenticate: authenticate }
		})  
		
		.state ('faq', {
			url: '/faq',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/faq.html',
			resolve: { authenticate: authenticate }
		}) 
		
		.state ('contact', {
			url: '/contact',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/contact.html',
			resolve: { authenticate: authenticate }
		}) 
		
		.state ('security', {
			url: '/security',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/security.html',
			resolve: { authenticate: authenticate }
		}) 
		
		.state ('terms', {
			url: '/terms',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/terms.html',
			resolve: { authenticate: authenticate }
		})
		
		.state ('viewtenantapplication', {
			url: '/viewapplication/{appID}',
			controller: 'viewappCtrl',
			controllerAs: 'vappctrl',
			templateUrl: 'views/view_rental_app_form.html',
			resolve: { authenticate: authenticate }
		})
		
		// Tenant Routes
		.state ('tenantdashboard', {
			url: '/tenantdashboard',
			controller: 'tenantdboardlCtrl',
			controllerAs: 'tdboardctrl',
			templateUrl: 'views/tenant.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
		
		.state ('tenantapply', {
			url: '/applyproperty/{propId}',
			controller: 'applypropCtrl',
			controllerAs: 'applyctrl',
			templateUrl: 'views/applyproperty.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
		
		.state ('applicationThanks', {
			url: '/applicationThanks',
			templateUrl: 'views/applypropsuccess.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
		
		.state ('tenantschedule', {
			url: '/tenantschedule',
			controller: 'tenantscheduleCtrl',
			controllerAs: 'tschedulectrl',
			templateUrl: 'views/tenant_schedule.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
		
		.state ('tenantapplications', {
			url: '/tenantapplications',
			controller: 'tenantappCtrl',
			controllerAs: 'tappctrl',
			templateUrl: 'views/tenant_app.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
		
		.state ('rentalform', {
			url: '/rentalform/{scheduleId}/{applicationId}',
			controller: 'rentalformCtrl',
			controllerAs: 'rctrl',
			templateUrl: 'views/rental_app_form.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
				
		.state ('viewapplication1', {
			url: '/viewapp/{appID}',
			controller: 'viewappCtrl',
			controllerAs: 'vappctrl',
			templateUrl: 'views/view_rental_app_form.html',
			resolve: { tenantauthenticate: tenantauthenticate }
		})
		
		
		function authenticate($q,$state, $timeout, $rootScope) {
			// console.log($rootScope.user.emailVerified);
			
			if(localStorage.getItem('userID') !== "null" && localStorage.getItem('userEmailVerified')!== "null" && localStorage.getItem('usertype') != "null" ){
				 $rootScope.uid  = localStorage.getItem('userID');
				 $rootScope.emailVerified  = localStorage.getItem('userEmailVerified');
				 $rootScope.usertype = localStorage.getItem('usertype');
			 } 
			  
			if ($rootScope.uid && $rootScope.emailVerified && $rootScope.usertype == "1" ) {				
				// Resolve the promise successfully
				return $q.when()			
				
			} else {
				  // The next bit of code is asynchronously tricky.

				  $timeout(function() {
				  // This code runs after the authentication promise has been rejected.
				  // Go to the log-in page
				  $state.go('login')
				})

				// Reject the authentication promise to prevent the state from loading
				return $q.reject()
			}
		}
		
		function tenantauthenticate($q,$state, $timeout, $rootScope) {
			// console.log($rootScope.user.emailVerified);
			
			if(localStorage.getItem('userID') !== "null" && localStorage.getItem('userEmailVerified')!== "null" && localStorage.getItem('usertype') != "null"){
				 $rootScope.uid  = localStorage.getItem('userID');
				 $rootScope.emailVerified  = localStorage.getItem('userEmailVerified');
				 $rootScope.usertype = localStorage.getItem('usertype');
			 } 
			  
			if ($rootScope.uid && $rootScope.emailVerified && $rootScope.usertype == "0" ) {			
				// Resolve the promise successfully
				return $q.when()			
				
			} else {
				  // The next bit of code is asynchronously tricky.

				 console.log(window.location);
				 // $rootScope.applyhiturl = window.location.href;
				 localStorage.setItem('applyhiturl',window.location.href) 
				 
				 
				 $timeout(function() {
				  // This code runs after the authentication promise has been rejected.
				  // Go to the log-in page
				  $state.go('login')
				})

				 
				// Reject the authentication promise to prevent the state from loading
				return $q.reject()
			}
		}
		
		
  })
  .run( [ '$rootScope', function ($rootScope) {
        $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
            $rootScope.$previousState = from;
        });
      }]);
