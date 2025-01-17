import { readFileSync } from "fs";
import chai from "chai";
import chaiHttp from "chai-http";

import { server, createTestDb, deleteTestDb, getUsers, getImages, getComments } from "../app.mjs";

const expect = chai.expect;
chai.use(chaiHttp);

describe("Testing Static Files", () => {
  after(function () {
    server.close();
  });

  it("it should get index.html", function (done) {
    chai
      .request(server)
      .get("/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.text).to.be.equal(
          readFileSync("./static/index.html", "utf-8"),
        );
        done();
      });
  });
});

describe("Testing API", () => {
  let agent;

  const testData = [
    { title: "Test Title Name" },
    { title: "Test Title Name 2" },
    { content: "Test Comment Content 2", author: "Test Comment Author Name 2" },
    { username: "testUser", password: "123456"},
    { username: "testUser2", password: "789012"},
    { title: "Test Title Name 3" },
  ];

  before(function () {
    agent = chai.request.agent(server);
    createTestDb();
  });

  after(function () {
    deleteTestDb();
    agent.close();
    server.close();
  });

  it("it should fail add an image because not authenticated", function (done) {
    chai
      .request(server)
      .post("/api/images/")
      .set("content-type", "multipart/form-data")
      .field("title", testData[0].title )
      .attach("picture", './test/test.jpg', 'test.jpg')
      .end(function (err, res) {
        getImages(function (err, images) {
          if (err) return done(err);
          expect(images).to.have.length(0);
          done();
        });
      });
  });

  it("it should signup a user", function (done) {
    agent
      .post("/signup/")
      .send({ username: testData[3].username, password: testData[3].password })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getUsers(function (err, users) {
          if (err) return done(err);
          expect(users).to.have.length(1);
          expect(users[0]).to.have.property("_id", testData[3].username);
          done();
        });
      });
  });

  it("it should sign in a user", function (done) {
    agent
      .post("/signin/")
      .send({ username: testData[3].username, password: testData[3].password })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });

  let testImageId0; 
  it("it should add an image", function (done) {
    agent
      .post("/api/images/")
      .set("content-type", "multipart/form-data")
      .field("title", testData[0].title )
      .attach("picture", './test/test.jpg', 'test.jpg')
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("title", testData[0].title);
        expect(res.body).to.have.property("author", testData[3].username);
        getImages(function (err, images) {
          if (err) return done(err);
          testImageId0 = images[0]._id;
          expect(images).to.have.length(1);
          expect(images[0]).to.have.property("title", testData[0].title);
          expect(images[0]).to.have.property("author", testData[3].username);
          done();
        });
      });
  });

  let testImageId1;
  it("it should add another image", function (done) {
    agent
      .post("/api/images/")
      .set("content-type", "multipart/form-data")
      .field("title", testData[1].title )
      .attach("picture", './test/test.jpg', 'test.jpg')
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("title", testData[1].title);
        expect(res.body).to.have.property("author", testData[3].username);
        getImages(function (err, images) {
          if (err) return done(err);
          testImageId1 = images[1]._id;
          expect(images).to.have.length(2);
          expect(images[1]).to.have.property("title", testData[1].title);
          expect(images[1]).to.have.property("author", testData[3].username);
          done();
        });
      });
  });

  it("it should get the first image", function (done) {
    agent
      .get("/api/image/0/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("total", 2);
        expect(res.body.image).to.have.property("title", testData[1].title);
        expect(res.body.image).to.have.property("author", testData[3].username);
        done();
      });
  });

  it("it should get the second image", function (done) {
    agent
      .get("/api/image/1/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("total", 2);
        expect(res.body.image).to.have.property("title", testData[0].title);
        expect(res.body.image).to.have.property("author", testData[3].username);
        done();
      });
  });

  it("it should fail delete an image due to id not found", function (done) {
    agent
      .delete("/api/images/" + testImageId0 + "X/")
      .end(function (err, res) {
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal("Image id: " + testImageId0 + "X does not exists");
        done();
      });
  }); 

  it("it should delete an image", function (done) {
    agent
      .delete("/api/images/" + testImageId0 + "/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("_id", testImageId0);
        expect(res.body).to.have.property("title", testData[0].title);
        expect(res.body).to.have.property("author", testData[3].username);
        done();
      });
  });

  it("it should get the rest of the images", function (done) {
    agent
      .get("/api/images/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.length(1);
        expect(res.body[0]).to.have.property("_id", testImageId1);
        expect(res.body[0]).to.have.property("title", testData[1].title);
        expect(res.body[0]).to.have.property("author", testData[3].username);
        done();
      });
  });

  it("it should get image of a specific image id", function (done) {
    agent
      .get("/api/images/" + testImageId1 + "/image/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("it should fail get image of specific image id due to image id not found", function (done) {
    agent
      .get("/api/images/" + testImageId1 + "X/image/")
      .end(function (err, res) {
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal("Image id: " + testImageId1 + "X does not exists");
        done();
      });
  });

  let testCommentId;
  it("it should add a comment", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: testData[2].content })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("image_id", testImageId1);
        expect(res.body).to.have.property("content", testData[2].content);
        expect(res.body).to.have.property("author", testData[3].username);
        getComments(function (err, comments) {
          if (err) return done(err);
          testCommentId = comments[0]._id;
          expect(comments).to.have.length(1);
          expect(comments[0]).to.have.property("image_id", testImageId1);
          expect(comments[0]).to.have.property("content", testData[2].content);
          expect(comments[0]).to.have.property("author", testData[3].username);
          done();
        });
      });
  });

  it("it should fail delete a comment due to id not found", function (done) {
    agent
      .delete("/api/comments/" + testCommentId + "X/")
      .end(function (err, res) {
        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal("Comment id: " + testCommentId + "X does not exists");
        done();
      });
  });

  it("it should delete a comment", function (done) {
    agent
      .delete("/api/comments/" + testCommentId + "/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("_id", testCommentId);
        expect(res.body).to.have.property("image_id", testImageId1);
        expect(res.body).to.have.property("content", testData[2].content);
        expect(res.body).to.have.property("author", testData[3].username);
        getComments(function (err, comments) {
          if (err) return done(err);
          expect(comments).to.have.length(0);
          done();
        });
      });
  });

  it("it should add an image", function (done) {
    agent
      .post("/api/images/")
      .set("content-type", "multipart/form-data")
      .field("title", testData[0].title )
      .attach("picture", './test/test.jpg', 'test.jpg')
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getImages(function (err, images) {
          if (err) return done(err);
          testImageId0 = images[1]._id;
          expect(images).to.have.length(2);
          expect(images[1]).to.have.property("title", testData[0].title);
          expect(images[1]).to.have.property("author", testData[3].username);
          done();
        });
      });
  });

  it("it should add 1/12 comment to new image", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: "1" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getComments(function (err, comments) {
          if (err) return done(err);
          expect(comments).to.have.length(1);
          done();
        });
      });
  });
  it("it should add 2/12 comment to new image", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: "2" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getComments(function (err, comments) {
          if (err) return done(err);
          expect(comments).to.have.length(2);
          done();
        });
      });
  });
  it("it should add 3/12 comment to new image", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: "3" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getComments(function (err, comments) {
          if (err) return done(err);
          expect(comments).to.have.length(3);
          done();
        });
      });
  });
  it("it should add 4/12 comment to new image", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: "4" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getComments(function (err, comments) {
          if (err) return done(err);
          expect(comments).to.have.length(4);
          done();
        });
      });
  });
  it("it should add 5/12 comment to new image", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: "5" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getComments(function (err, comments) {
          if (err) return done(err);
          expect(comments).to.have.length(5);
          done();
        });
      });
  });
  it("it should add 6/12 comment to new image", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: "6" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getComments(function (err, comments) {
          if (err) return done(err);
          expect(comments).to.have.length(6);
          done();
        });
      });
  });
  it("it should add 7/12 comment to new image", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: "7" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getComments(function (err, comments) {
          if (err) return done(err);
          expect(comments).to.have.length(7);
          done();
        });
      });
  });
  it("it should add 8/12 comment to new image", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: "8" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getComments(function (err, comments) {
          if (err) return done(err);
          expect(comments).to.have.length(8);
          done();
        });
      });
  });
  it("it should add 9/12 comment to new image", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: "9" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getComments(function (err, comments) {
          if (err) return done(err);
          expect(comments).to.have.length(9);
          done();
        });
      });
  });
  it("it should add 10/12 comment to new image", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: "10" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getComments(function (err, comments) {
          if (err) return done(err);
          testCommentId = comments[9]._id;
          expect(comments).to.have.length(10);
          done();
        });
      });
  });

  it("it should get the first page of comments of new image", function (done) {
    agent
      .get("/api/comments/" + testImageId1 + "/page=0/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("total", 10);
        expect(res.body.comments).to.have.length(10);
        done();
      });
  });

  it("it should sign out a user", function (done) {
    agent
      .get("/signout/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
    });
  });

  it("it should not get all images because not authenticated", function (done) {
    agent
      .get("/api/images/")
      .end(function (err, res) {
        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal("access denied, you are not authenticated");
        done();
      });
  });

  it("it should not get any comments because not authenticated", function (done) {
    agent
      .get("/api/comments/" + testImageId1 + "/page=0/")
      .end(function (err, res) {
        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal("access denied, you are not authenticated");
        done();
      });
  });

  it("it should signup another user", function (done) {
    agent
      .post("/signup/")
      .send({ username: testData[4].username, password: testData[4].password })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getUsers(function (err, users) {
          if (err) return done(err);
          expect(users).to.have.length(2);
          expect(users[1]).to.have.property("_id", testData[4].username);
          done();
        });
      });
  });

  it("it should sign in the newly added user", function (done) {
    agent
      .post("/signin/")
      .send({ username: testData[4].username, password: testData[4].password })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("it should not delete an image of another author's", function (done) {
    agent
      .delete("/api/images/" + testImageId1 + "/")
      .end(function (err, res) {
        expect(res).to.have.status(403);
        expect(res.body).to.deep.equal("forbidden, you are not the author");
        done();
      });
  });

  it("it should not delete a comment of another author's", function (done) {
    agent
      .delete("/api/comments/" + testCommentId + "/")
      .end(function (err, res) {
        expect(res).to.have.status(403);
        expect(res.body).to.deep.equal("forbidden, you are not the author");
        done();
      });
  });

  it("it should add 11/12 comment to image of first user", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: "11" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getComments(function (err, comments) {
          if (err) return done(err);
          testCommentId = comments[10]._id;
          expect(comments).to.have.length(11);
          done();
        });
      });
  });

  let testCommentId2;
  it("it should add 12/12 comment to image of first user", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: "12" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getComments(function (err, comments) {
          if (err) return done(err);
          testCommentId2 = comments[11]._id;
          expect(comments).to.have.length(12);
          done();
        });
      });
  });

  it("it should delete my comment on another user's post", function (done) {
    agent
      .delete("/api/comments/" + testCommentId + "/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("_id", testCommentId);
        expect(res.body).to.have.property("image_id", testImageId1);
        expect(res.body).to.have.property("content", "11");
        expect(res.body).to.have.property("author", testData[4].username);
        getComments(function (err, comments) {
          if (err) return done(err);
          expect(comments).to.have.length(11);
          done();
        });
      });
  });

  it("it should add an image", function (done) {
    agent
      .post("/api/images/")
      .set("content-type", "multipart/form-data")
      .field("title", testData[5].title )
      .attach("picture", './test/test.jpg', 'test.jpg')
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("title", testData[5].title);
        expect(res.body).to.have.property("author", testData[4].username);
        getImages(function (err, images) {
          if (err) return done(err);
          expect(images).to.have.length(3);
          expect(images[2]).to.have.property("title", testData[5].title);
          expect(images[2]).to.have.property("author", testData[4].username);
          done();
        });
      });
  });

  it("it should get all images of all users sorted by most recent first", function (done) {
    agent
      .get("/api/images/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.length(3);
        expect(res.body[0]).to.have.property("title", testData[5].title);
        expect(res.body[0]).to.have.property("author", testData[4].username);
        expect(res.body[1]).to.have.property("title", testData[0].title);
        expect(res.body[1]).to.have.property("author", testData[3].username);
        expect(res.body[2]).to.have.property("title", testData[1].title);
        expect(res.body[2]).to.have.property("author", testData[3].username);
        done();
      });
  });

  it("it should sign out a user", function (done) {
    agent
      .get("/signout/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
    });
  });

  it("it should sign in a user", function (done) {
    agent
      .post("/signin/")
      .send({ username: testData[3].username, password: testData[3].password })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("it should delete another author's comment on my image", function (done) {
    agent
      .delete("/api/comments/" + testCommentId2 + "/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("_id", testCommentId2);
        expect(res.body).to.have.property("image_id", testImageId1);
        expect(res.body).to.have.property("content", "12");
        expect(res.body).to.have.property("author", testData[4].username);
        getComments(function (err, comments) {
          if (err) return done(err);
          expect(comments).to.have.length(10);
          done();
        });
      });
  });

  it("it should add 11th comment on my image", function (done) {
    agent
      .post("/api/comments/")
      .set("content-type", "application/json")
      .send({ image_id: testImageId1, content: "11" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        getComments(function (err, comments) {
          if (err) return done(err);
          testCommentId = comments[10]._id;
          expect(comments).to.have.length(11);
          done();
        });
      });
  });

  it("it should get the second page of comments of prev image", function (done) {
    agent
      .get("/api/comments/" + testImageId1 + "/page=1/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("total", 11);
        expect(res.body.comments).to.have.length(1);
        expect(res.body.comments[0]).to.have.property("content", "1");
        done();
      });
  });

  it("it should get the latest image of first user", function (done) {
    agent
      .get("/api/images/" + testData[3].username + "/0/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("total", 2);
        expect(res.body.image).to.have.property("title", testData[0].title);
        expect(res.body.image).to.have.property("author", testData[3].username);
        done();
      });
  });

  it("it should get the latest image of second user", function (done) {
    agent
      .get("/api/images/" + testData[4].username + "/0/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("total", 1);
        expect(res.body.image).to.have.property("title", testData[5].title);
        expect(res.body.image).to.have.property("author", testData[4].username);
        done();
      });
  });

  it("it should delete the prev image and all of that image's comments", function (done) {
    agent
      .delete("/api/images/" + testImageId1 + "/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("_id", testImageId1);
        expect(res.body).to.have.property("title", testData[1].title);
        expect(res.body).to.have.property("author", testData[3].username);
        getImages(function (err, images) {
          if (err) return done(err);
          expect(images).to.have.length(2);
        });
        getComments(function (err, comments) {
          if (err) return done(err);
          expect(comments).to.have.length(0);
          done();
        });
      });
  });
});