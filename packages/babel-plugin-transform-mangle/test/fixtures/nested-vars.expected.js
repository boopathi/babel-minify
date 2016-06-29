(function() {
  var a = 1;
  let b = a;
  const c = b - 1;
  {
    var d = 2;
    let e = d;
    const f = e - 1;
  }
})();
