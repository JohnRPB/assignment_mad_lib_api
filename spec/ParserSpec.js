let Parser = require("../Parser");
let replaceWord = Parser.replaceWord;

describe("Parser", () => {
  describe("replaceWord()", () => {
    it("replaces adjective with {{adjective}}", async () => {
      let replacement = await replaceWord("little");
      expect(replacement).toEqual("{{adjective}}");
    });

    it("replaces noun with {{noun}}", async () => {
      let replacement = await replaceWord("John");
      expect(replacement).toEqual("{{noun}}");
    });

    it("replaces adverb with {{adverb}}", async () => {
      let replacement = await replaceWord("quickly");
      expect(replacement).toEqual("{{adverb}}");
    });

    it("replaces verb with {{verb}}", async () => {
      let replacement = await replaceWord("eat");
      expect(replacement).toEqual("{{verb}}");
    });
  });
});

