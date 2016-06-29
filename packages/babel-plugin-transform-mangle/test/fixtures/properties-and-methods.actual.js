(function() {
  var longName = "something";
  var object = {
    method1() {},
    method2: function method2() {
      longName += "somethingElse"
    }
  };
})();
