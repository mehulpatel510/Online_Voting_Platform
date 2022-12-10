const app = require("./app");

// eslint-disable-next-line no-undef
var PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Started express server at port " + PORT);
});
