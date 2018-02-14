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
	'ngFileUpload',
	'ui.jq',
	'ui.bootstrap',
	'socialLogin'
  ]); 
 
	
vcancyApp.constant('config', {
   "sailsBaseUrl": 'https://www.vcancy.ca/nodeapi/api/v1/',
});

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
vcancyApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);
/*
vcancyApp.config(function(socialProvider){
//socialProvider.setGoogleKey("YOUR GOOGLE CLIENT ID");
  socialProvider.setLinkedInKey("78blzjlmkk6jbl");
  //socialProvider.setFbKey({appId: "YOUR FACEBOOK APP ID", apiVersion: "API VERSION"});
}); */

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

vcancyApp.directive('integer', function(){
    return {
        require: 'ngModel',
        link: function(scope, ele, attr, ctrl){
            ctrl.$parsers.unshift(function(viewValue){
                return parseInt(viewValue, 10);
            });
        }
    };
});
vcancyApp.directive("disableLink", function() {
	return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            $(elem).click(function() {
                $().JqueryFunction();
            });
        }
    }
});
vcancyApp.directive("disableLink1", function() {
	return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            $(elem).click(function() {
            	var test = $(this).find("input").attr( 'id' );
                $().JqueryFunction1(scope, elem, test);
            });
        }
    }
});
vcancyApp.directive("disableLink12", function() {
	return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            $(elem).click(function() {
            	var test = $(this).find("input").attr( 'id' );
                $().JqueryFunction12(scope, elem, test);
            });
        }
    }
});
vcancyApp.directive("disableLink123", function() {
	return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            $(elem).click(function() {
                $().JqueryFunction123();
            });
        }
    }
});

vcancyApp.directive("disableLink21", function() {
	return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            $(elem).click(function() {
            	var test = $(this).find("input").attr( 'id' );
            	$().JqueryFunctionprop(scope, elem, test);
            });
        }
    }
});


$(document).ready(function() {
  (function($){
     $.fn.JqueryFunction = function() {
     	  //alert("Come Here");
          $( "#datepicker-13" ).datepicker({format: 'dd-MM-yyyy',autoclose: true});
            $( "#datepicker-13" ).datepicker("show");
            
     }; 
  })( jQuery );

});
$(document).ready(function() {
  (function($){
     $.fn.JqueryFunction1 = function(scope, elem, test) {
     	  
     	   //event.preventDefault();
        $( "#"+test ).datepicker({format: 'dd-MM-yyyy',autoclose: true});
        $( "#"+test ).datepicker("show");
            
     }; 
  })( jQuery );

});
$(document).ready(function() {
  (function($){
     $.fn.JqueryFunction12 = function(scope, elem, test) {
          $( "#"+test ).datepicker({format: 'dd-MM-yyyy',autoclose: true});
            $( "#"+test ).datepicker("show");
            
     }; 
  })( jQuery );

});
$(document).ready(function() {
  (function($){
     $.fn.JqueryFunction123 = function() {
     	 
          $( "#datepicker123-13" ).datepicker({format: 'dd-MM-yyyy',autoclose: true});
            $( "#datepicker123-13" ).datepicker("show");
            
     }; 
  })( jQuery );

});
$(document).ready(function() {
  (function($){
     $.fn.JqueryFunctionprop = function(scope, elem, test) {
     	 
          $( "#"+test ).datepicker({format: 'dd-MM-yyyy',autoclose: true});
            $( "#"+test ).datepicker("show");
            
     }; 
  })( jQuery );

});

	

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
		apiKey: "AIzaSyCR720Fl1Q6UIuvyy_0U980Z8y1mLschsI",
		authDomain: "vcancy-5e3b4.firebaseapp.com",
		databaseURL: "https://vcancy-5e3b4.firebaseio.com",
		projectId: "vcancy-5e3b4",
		storageBucket: "vcancy-5e3b4.appspot.com",
		messagingSenderId: "330892868858"
	  };
	  var app = firebase.initializeApp(config);	 
	  
	  // var sailsBaseUrl = 'http://www.vcancy.ca/api/v1/';
	
	$urlRouterProvider.otherwise("/");
	$stateProvider	
		// Public Routes
	   /*.state ('login', {
			url: '/',
			controller: 'loginCtrl',
			controllerAs: 'lctrl',
			templateUrl: 'views/login.html',	
		}) */
	   .state ('login', {
			url: '/',
			controller: 'loginCtrl',
			controllerAs: 'lctrl',
			templateUrl: 'views/login.html',	
			resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'vcancyApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '../assets/pages/css/login-2.min.css',  
                            '../styles/cmsdev.css',                          
                            '../assets/pages/scripts/login.min.js',
                        ] 
                    });
                }]
            }
		}) 
		 .state ('register', {
			url: '/register',
			controller: 'loginCtrl',
			controllerAs: 'lctrl',
			templateUrl: 'views/register.html',
			 resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'vcancyApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '../assets/pages/css/login-5.min.css',                            
                            '../assets/global/plugins/backstretch/jquery.backstretch.min.js',
                            '../assets/pages/scripts/login-5.min.js',
                        ] 
                    });
                }]
            }	
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
		/*.state ('landlorddashboard', {
			url: '/landlorddboard',
			controller: 'landlorddboardlCtrl',
			controllerAs: 'ldboardctrl',
			templateUrl: 'views/landlord.html',
			resolve: { authenticate: authenticate }
		})  */
		.state ('landlorddashboard', {
			url: '/landlorddboard',
			controller: 'landlorddboardlCtrl',
			controllerAs: 'ldboardctrl',
			templateUrl: 'views/landlord.html',
			resolve: {authenticate: authenticate,
				deps: ['$ocLazyLoad', function($ocLazyLoad) {
	                    return $ocLazyLoad.load({
	                        name: 'vcancyApp',
	                        files: [
	                            '../assets/layouts/layout2/css/layout.min.css',
	                            '../assets/layouts/layout2/css/themes/blue.min.css',
	                            '../assets/layouts/layout2/css/custom.min.css',
	                            '../assets/global/plugins/moment.min.js',                            
	                            '../assets/global/plugins/fullcalendar/fullcalendar.min.js',
	                            '../assets/pages/scripts/dashboard.min.js',
	                        ] 
	                    });
	                }]
             }
		}) 
		/*.state('landordprofile', {
		    url: '/landordprofile',
		    controller: 'landlordProfilelCtrl',
		    controllerAs: 'ldProfilectrl',
		    templateUrl: 'views/landloardProfile.html',
		    resolve: { authenticate: authenticate }
		})*/
		.state('landordprofile', {
		    url: '/landordprofile',
		    controller: 'landlordProfilelCtrl',
		    controllerAs: 'ldProfilectrl',
		    templateUrl: 'views/landloardProfile.html',
		    resolve: { authenticate: authenticate,
		   			 deps: ['$ocLazyLoad', function($ocLazyLoad) {
	                    return $ocLazyLoad.load({
	                        name: 'vcancyApp',
	                        files: [
	                            '../assets/pages/css/profile-2.min.css',
	                            '../assets/layouts/layout2/css/layout.min.css',
	                            '../assets/layouts/layout2/css/themes/blue.min.css',
	                            '../assets/layouts/layout2/css/custom.min.css',
	                            '../assets/layouts/layout2/scripts/layout.min.js',
	                            '../assets/layouts/global/scripts/quick-nav.min.js',
	                            '../styles/cmsdev.css',
	                        ] 
	                    });
	                }]

	        }
		})
		.state ('viewprop', {
			url: '/myprop',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/viewproperties.html',
			resolve: { authenticate: authenticate }
		}) 
		.state('addunits', {
			 url: '/addunits/{propId}',
			 templateUrl:'views/units.html',
			 controller:'propertyCtrl',
			 controllerAs: 'propctrl',
			 
		})
		.state('viewunits', {
			 url: '/viewunits/{propId}',
			 templateUrl:'views/viewunits.html',
			 controller:'propertyCtrl',
			 controllerAs: 'propctrl',
			 
		})
		/*.state ('editprop', {
			url: '/editprop/{propId}',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/editproperty.html',
			resolve: { authenticate: authenticate }
		})*/
		.state ('editprop', {
			url: '/editprop/{propId}',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/editproperty.html',
			resolve: { authenticate: authenticate }
		})
		
		.state ('customemailhandler', {
			url: '/auth?{mode}&{oobCode}&{apiKey}',
			controller: 'emailhandlerCtrl',
			controllerAs: 'ehandlectrl',
			templateUrl: 'views/customhandler.html',
		})
		
		/* .state ('addprop', {
			url: '/addprop',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/addproperties.html',
			resolve: { authenticate: authenticate }
		})*/
		 /*.state ('addprop', {
			url: '/addprop',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/addproperties.html',
			resolve: { authenticate: authenticate }
		})*/
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
			templateUrl: 'views/peoples.html',
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
			resolve: { tenantauthenticate: tenantauthenticate,
						deps: ['$ocLazyLoad', function($ocLazyLoad) {
				                    return $ocLazyLoad.load({
				                        name: 'vcancyApp',
				                        files: [
				                            '../assets/layouts/layout2/css/layout.min.css',
				                            '../assets/layouts/layout2/css/themes/blue.min.css',
				                            '../assets/layouts/layout2/css/custom.min.css',
				                            '../assets/global/plugins/moment.min.js',                            
				                            '../assets/global/plugins/fullcalendar/fullcalendar.min.js',
				                            '../assets/pages/scripts/dashboard.min.js',
				                        ] 
				                    });
				                }]
	        }
		})
		.state('tenantprofile', {
		    url: '/tenantprofile',
		    controller: 'tenantProfilelCtrl',
		    controllerAs: 'tdProfilectrl',
		    templateUrl: 'views/tenantProfile.html',
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
