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
	'firebase'
  ]);
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
	  firebase.initializeApp(config);
	  
	  
	$urlRouterProvider.otherwise("/login");
	$stateProvider			
	   .state ('login', {
			url: '/login',
			controller: 'loginCtrl',
			controllerAs: 'lctrl',
			templateUrl: 'views/login.html',	
		}) 
		.state ('emailverification', {
			url: '/emailverification',
			templateUrl: 'views/emailverification.html',
		})
		.state ('landlorddashboard', {
			url: '/landlorddboard',
			controller: 'dboardCtrl',
			templateUrl: 'views/landlord.html'
		})
		.state ('faq', {
			url: '/faq',
			templateUrl: 'views/faq.html',
		}) 
		.state ('contact', {
			url: '/contact',
			templateUrl: 'views/contact.html',
		}) 
		.state ('security', {
			url: '/security',
			templateUrl: 'views/security.html',
		}) 
		.state ('terms', {
			url: '/terms',
			templateUrl: 'views/terms.html',
		});
  });
