// https://github.com/boopathi/babel-minify/issues/7
(function() {
  {
    var x = 1;
    function a() {}
  }
  var x = 2;
})();
