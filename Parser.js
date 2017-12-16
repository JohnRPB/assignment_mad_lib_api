let wordReplacement = {
    noun: "{{noun}}",
    verb: "{{verb}}",
    adjective: "{{adjective}}",
    adverb: "{{adverb}}"
};

var Sentencer = require("sentencer");
var WordPOS = require('wordpos'),
    wordpos = new WordPOS();


Sentencer.configure({
  verbArr,
  adverbArr, 
  actions: {
    verb: function() {
      return verbArr[Math.floor(Math.random() * 1000) + 1];
    },
    adverb: function() {
      return adverbArr[Math.floor(Math.random() * 1000) + 1];
    }
  }
});

const replaceWord = async (word) => {
   let isAdjective = await wordpos.isAdjective(word);
   if (isAdjective) return wordReplacement.adjective;

   let isNoun = await wordpos.isNoun(word);
   if (isNoun) return wordReplacement.noun;

   let isVerb = await wordpos.isVerb(word);
   if (isVerb) return wordReplacement.verb;

   let isAdverb = await wordpos.isAdverb(word);
   if (isAdverb) return wordReplacement.adverb;

   return word;
 };

const replaceSentence = (string) {
  let stringArr = string.split(" ");
  return stringArr.map(word => replaceWord(word)).join(" ");
}


replaceWord("run").then((replacement) => console.log(replacement));

module.exports = {
  replaceWord
}
