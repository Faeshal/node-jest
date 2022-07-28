require("dotenv").config();
process.env.NODE_ENV = "test";
const server = require("../server");
const incomeService = require("../services/income");
const request = require("supertest");
const toBeType = require("jest-tobetype");
const log = require("log4js").getLogger("test:income");
log.level = "debug";
expect.extend(toBeType);

describe("Income API", () => {
  afterEach(async () => {
    await server.close();
  });

  // ** GET /api/v1/incomes
  describe("GET /api/v1/incomes", () => {
    it("It should GET all the income", async () => {
      const res = await request(server).get("/api/v1/incomes");
      expect(res.statusCode).toBe(200);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(typeof res.body).toBe("object");
      // * for some reason using typeOf can't dig inside object (res.body.data)
      // so i install 3rd party library to check data type more cleaner
      expect(res.body.data).toBeType("array");
    });

    it("It should NOT GET all the income", async () => {
      const res = await request(server).get("/api/v1/income");
      expect(res.statusCode).toBe(404);
    });
  });

  // ** POST /api/v1/incomes
  describe("POST /api/v1/incomes", () => {
    it("it should POST an income ", async () => {
      let body = {
        name: "sell cocacola",
        value: Math.floor(Math.random() * 101),
      };
      const res = await request(server).post("/api/v1/incomes").send(body);
      expect(res.statusCode).toBe(201);
      expect(typeof res.body).toBe("object");
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message");
    });

    it("it should not POST an income without value field", async () => {
      let body = {
        name: "buy cocacola",
      };
      const res = await request(server).post("/api/v1/incomes").send(body);
      expect(res.statusCode).toBe(400);
      expect(typeof res.body).toBe("object");
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message");
    });
  });

  // ** GET /api/v1/incomes/:id
  describe("GET /api/v1/incomes/:id", () => {
    it("it should GET an income by id", async () => {
      const id = 6;
      const res = await request(server).get(`/api/v1/incomes/${id}`);
      expect(res.statusCode).toBe(200);
      expect(typeof res.body).toBe("object");
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
    });

    it("it should not GET an income by id without numeric params", async () => {
      const id = "x";
      const res = await request(server).get(`/api/v1/incomes/${id}`);
      expect(res.statusCode).toBe(400);
      expect(typeof res.body).toBe("object");
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message");
    });
  });

  // ** PUT /api/v1/incomes/:id
  describe("PUT /api/v1/incomes/:id", () => {
    it("it should PUT an income", async () => {
      // create the data first
      const result = await incomeService.add({
        name: "income property",
        value: Math.floor(Math.random() * 101),
      });
      const { id } = result.dataValues;
      // then update with new data
      const body = {
        name: "passive income property",
        value: Math.floor(Math.random() * 101),
      };
      const res = await request(server).put(`/api/v1/incomes/${id}`).send(body);
      expect(res.statusCode).toBe(200);
      expect(typeof res.body).toBe("object");
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message");
    });

    it("it should NOT PUT an income with non numeric value field", async () => {
      // create the data first
      const result = await incomeService.add({
        name: "sell ticket",
        value: Math.floor(Math.random() * 101),
      });
      const { id } = result.dataValues;
      // update with wrong data value
      const body = {
        name: "buy cocacola",
        value: "$900",
      };
      const res = await request(server).put(`/api/v1/incomes/${id}`).send(body);
      expect(res.statusCode).toBe(400);
      expect(typeof res.body).toBe("object");
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message");
    });
  });

  // ** DELETE /api/v1/incomes/:id
  describe("DELETE /api/v1/incomes/:id", () => {
    it("it should DElETE an income", async function () {
      // create the data first
      const result = await incomeService.add({
        name: "passive income property",
        value: Math.floor(Math.random() * 101),
      });
      const { id } = result.dataValues;
      // than delete
      const res = await request(server).delete(`/api/v1/incomes/${id}`);
      expect(res.statusCode).toBe(200);
      expect(typeof res.body).toBe("object");
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message");
    });

    it("it should NOT DELETE an income with invalid id", async () => {
      const id = 0;
      const res = await request(server).delete(`/api/v1/incomes/${id}`);
      expect(res.statusCode).toBe(400);
      expect(typeof res.body).toBe("object");
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message");
    });
  });
});
