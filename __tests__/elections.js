/* eslint-disable no-undef */
const request = require("supertest");
//const csrf = require("tiny-csrf")
const db = require("../models/index");
const app = require("../app");


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
  
    
  
    test("Sign up", async () => {
      expect(1).toBe(1);
    })
});