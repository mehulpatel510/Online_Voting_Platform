/* eslint-disable no-undef */
const request = require("supertest");
//const csrf = require("tiny-csrf")
const db = require("../models/index");
const app = require("../app");
const cheerio = require("cheerio");
const { Election, Question, Option } = require("../models");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  if ($("[name=_csrf]").val() != undefined)
    return $("[name=_csrf]").val();
  if ($("[name=csrf-token]").val() != undefined)
    return $("[name=csrf-token]").val();

}

describe("Online Voting Application Sign in", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => { });
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  let login = async (agent, username, password) => {
    let res = await agent.get("/login");
    const csrfToken = extractCsrfToken(res);
    // console.log("CSRF Token - Log in:" + csrfToken);
    res = await agent.post("/session").send({
      voterId: username,
      password: password,
      _csrf: csrfToken
    });
    return res;
  }

  test("Sign up for Admin", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    console.log("CSRF Token - Sign up:" + csrfToken);
    res = await agent.post("/users").send({
      firstName: "admin",
      lastName: "admin",
      email: "admin@test.com",
      password: "123456",
      _csrf: csrfToken
    })
    expect(res.statusCode).toBe(302);
  });

  test("Login for Admin", async () => {
    const agent = request.agent(server);
    let res = await login(agent, "admin@test.com", "123456");
    // let csrfToken = extractCsrfToken(res);
    res = await agent.get("/elections");

    // csrfToken = extractCsrfToken(res);
    // console.log("CSRF Token - Admin Sign in:" + csrfToken);

    expect(res.statusCode).toBe(200);
  });

  test("Sign Out for Admin", async () => {
    const agent = request.agent(server);
    let res = await login(agent, "admin@test.com", "123456");
    //let csrfToken = extractCsrfToken(res);
    //console.log("CSRF Token - Before Sign out:" + csrfToken);
    res = await agent.get("/elections");
    csrfToken = extractCsrfToken(res);
    //console.log("CSRF Token - After Sign out:" + csrfToken);
    res = await agent.get("/signout").send({
      _csrf: csrfToken
    })
    expect(res.statusCode).toBe(302);
  })

  test("Add new election", async () => {
    const agent = request.agent(server);
    let res = await login(agent, "admin@test.com", "123456");
    //let csrfToken = extractCsrfToken(res);
    //console.log("CSRF Token after login:" + csrfToken);
    res = await agent.get("/elections/new");
    csrfToken = extractCsrfToken(res);
    //console.log("CSRF Token before adding:" + csrfToken);
    res = await agent.post("/elections/new").send({
      electionName: "2023 Elections",
      _csrf: csrfToken
    })
    //console.log(res);
    expect(res.statusCode).toBe(302);
  });

  test("Launch election", async () => {
    const agent = request.agent(server);
    let res = await login(agent, "admin@test.com", "123456");
    //let csrfToken = extractCsrfToken(res);
    //console.log("CSRF Token after login:" + csrfToken);
    res = await agent.get("/elections/new");
    csrfToken = extractCsrfToken(res);
    //console.log("CSRF Token before adding:" + csrfToken);
    res = await agent.post("/elections/new").send({
      electionName: "2023 Elections",
      _csrf: csrfToken
    })
    // console.log(res);

    const allElections = await Election.getElections();
    console.log("Election Count:", allElections.length);

    const election = allElections[allElections.length - 1]

    //res = await agent.get("/elections/" + election.id);
    //csrfToken = await extractCsrfToken(res);

    res = await agent.get("/elections/new");
    csrfToken = extractCsrfToken(res);


    console.log("CSRF Token before launch:" + csrfToken);

    res = await agent.put("/elections/" + election.id + "/launch").send({
      launched: true,
      _csrf: csrfToken
    })
    expect(res.statusCode).toBe(200);
    console.log(JSON.parse(res["text"])["launched"])
    const updatedStatus = JSON.parse(res["text"])["launched"];
    expect(updatedStatus).toBe(true);
  });

  test("Add Question", async () => {

    const agent = request.agent(server);
    await login(agent, "admin@test.com", "123456");


    const allElections = await Election.getElections();
    console.log("Election Count:", allElections.length);

    const election = allElections[allElections.length - 1]


    let res = await agent.get("/elections/" + election.id + "/questions/new");
    const csrfToken = extractCsrfToken(res);
    console.log("CSRF Token - Sign up:" + csrfToken);
    res = await agent.post("/elections/" + election.id + "/questions/new").send({
      questionText: "Test case added",
      description: "Test case added",
      _csrf: csrfToken
    })
    expect(res.statusCode).toBe(302);
  });

  test("Add Options", async () => {

    const agent = request.agent(server);
    await login(agent, "admin@test.com", "123456");

    const allElections = await Election.getElections();
    console.log("Election Count:", allElections.length);

    const election = allElections[allElections.length - 1]


    await agent.get("/elections/" + election.id + "/questions/new");
    
    const questions = await Question.findAll();
    const question = questions[questions.length - 1]

    let res = await agent.get("/questions/" + question.id);
    let csrfToken = extractCsrfToken(res);
    console.log("CSRF Token - Sign up:" + csrfToken);

    res = await agent.post("/questions/" + question.id).send({
      optionText: "Option 1",
      _csrf: csrfToken
    })
    expect(res.statusCode).toBe(302);

    res = await agent.get("/questions/" + question.id);
    csrfToken = extractCsrfToken(res);
    console.log("CSRF Token - Sign up:" + csrfToken);
    
    res = await agent.post("/questions/" + question.id).send({
      optionText: "Option 2",
      _csrf: csrfToken
    })
    
    expect(res.statusCode).toBe(302);
  });

  test("Add Voter", async () => {

    const agent = request.agent(server);
    await login(agent, "admin@test.com", "123456");


    const allElections = await Election.getElections();
    console.log("Election Count:", allElections.length);

    const election = allElections[allElections.length - 1]


    let res = await agent.get("/elections/" + election.id + "/voters");
    const csrfToken = extractCsrfToken(res);
    console.log("CSRF Token - Sign up:" + csrfToken);
    res = await agent.post("/elections/" + election.id + "/voters").send({
      voterId: "ABCD11",
      password: "ABCD11",
      _csrf: csrfToken
    })
    expect(res.statusCode).toBe(302);
  });

  test("Login for Voter", async () => {
    const agent = request.agent(server);
    let res = await login(agent, "ABCD11", "ABCD11");

    expect(res.statusCode).toBe(302);
  });


  test("vote given by voter", async () => {

    const agent = request.agent(server);
    await login(agent, "ABCD11", "ABCD11");


    const allElections = await Election.getElections();
    console.log("Election Count:", allElections.length);

    const election = allElections[allElections.length - 1]

    const questions = await Question.findAll();
    console.log("Questions Length:" + questions.length)
    const question = questions[questions.length - 1]

    const options = await Option.findAll();
    console.log("Length:" + options.length)
    const option = options[options.length - 1];
    console.log("Option ID:" + option.Id)
    let res = await agent.get("/elections/" + election.id + "/vote");
    const csrfToken = extractCsrfToken(res);
    console.log("CSRF Token - Sign up:" + csrfToken);
    res = await agent.post("/elections/" + election.id + "/vote").send({
      questionId: question.Id,
      optionId: option.Id,
      _csrf: csrfToken
    })
    expect(res.statusCode).toBe(302);
  });

  test("review result", async () => {

    const agent = request.agent(server);
    await login(agent, "ABCD11", "ABCD11");


    const allElections = await Election.getElections();
    console.log("Election Count:", allElections.length);

    const election = allElections[allElections.length - 1]

    let res = await agent.get("/elections/" + election.id + "/preview");
    const csrfToken = extractCsrfToken(res);
    console.log("CSRF Token - Sign up:" + csrfToken);

    // res = await agent.post("/elections/" + election.id + "/vote").send({
    //   questionId: question.Id,
    //   optionId: option.Id,
    //   _csrf: csrfToken
    // })
    expect(res.statusCode).toBe(200);
  });

});
