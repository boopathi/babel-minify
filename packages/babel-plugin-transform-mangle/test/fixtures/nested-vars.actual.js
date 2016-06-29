(function() {
  var longName = 1;
  let something = longName;
  const zero = something - 1;
  {
    var long2Name = 2;
    let something = long2Name;
    const zero = something - 1;
  }
})();
