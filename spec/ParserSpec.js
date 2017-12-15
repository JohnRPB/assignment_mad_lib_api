let Parser = require("./Parser");

describe("Parser", () => {
  describe("replaceWord()", () => {
    it("replaces adjective with {{adjective}}", done => {
      expect(replaceWord("little")).toEqual("{{adjective}}");
      done();
    });

    it("replaces noun with {{noun}}", done => {
      expect(replaceWord("John")).toEqual("{{noun}}");
      done();
    });

    it("replaces adverb with {{adverb}}", done => {
      expect(replaceWord("quickly")).toEqual("{{adverb}}");
      done();
    });

    it("replaces verb with {{verb}}", done => {
      expect(replaceWord("run")).toEqual("{{verb}}");
      done();
    });
  });
});
