/*
let wordReplacement = {
    nouns: "{{aNoun}}",
    verbs: "{{}}",
    adjectives: [ 'little', 'angry', 'frightened' ],
    adverbs: [ 'little' ],
    rest: [ 'the' ]
  };

  //Take a sentence
  //Split into words
  //Pass it into a function in wordpos
*/

var Sentencer = require("sentencer");
var faker = require("faker");
let verbArr = Array(1000).map(elem => {
  faker.hacker.verb();
});
Sentencer.configure({
  verbArr,
  actions: {
    verb: function() {
      let rand = Math.floor(Math.random() * 1000) + 1;
    }
  }
});

let replaceWord = function(word) {};
