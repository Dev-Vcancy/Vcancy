vcancyApp.directive('fileUpload', function () {
    return {
        link: function (scope,element) {
            element.on('change', scope.uploadDetailsImages);
        },
        restrict:'A',
    };
});