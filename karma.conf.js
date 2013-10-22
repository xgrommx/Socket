module.exports = function(config){
    config.set({
    basePath : '',

    files : [
      'src/lib/angular/angular.js',
      'src/lib/angular/angular-*.js',
      'src/lib/*.js',
      'test/lib/angular/angular-mocks.js',
      'src/*.js',
      'test/*.js'
    ],

    exclude: [
      'src/lib/angular/angular-loader.js',
      'src/lib/angular/angular-loader.min.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'       
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

})}
