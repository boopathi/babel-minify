function function1() {
  function function2() {
    function function3() {
      function function4() {
        function function5() {
          function function6() {
            function function7() {
              var longName = 'somethingelse';
              something();
            }
          }
        }
      }
    }
  }
}
class Hello {}
class World extends Hello {}

var foo = function hello_world() {};
var bar = {
  foo: function baz() {},
  foo1() {}
};

class MyComponent extends React.Component {
  render() {
    return React.createElement('div');
  }
}

let Something = class A {}
