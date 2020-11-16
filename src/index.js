const expressbot = require("./expressbots");

const client = new expressbot({
  disableMentions: "everyone"
});

client.load().then(() => client.connect());
