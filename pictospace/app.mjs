import { createServer } from "http";
import express from "express";
import Datastore from "nedb";
import multer from "multer";
import { resolve } from "path";
import { rmSync } from "fs";
import { serialize } from "cookie";
import { compare, genSalt, hash } from "bcrypt";
import session from "express-session";
import validator from "validator";

const PORT = 3000;
const saltRounds = 10;

const app = express();
const upload = multer({ dest: resolve("uploads") });
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("static"));

let users = new Datastore({
  filename: 'db/users.db',
  autoload: true,
  timestampData : true
})

let images = new Datastore({
  filename: 'db/images.db',
  autoload: true,
  timestampData : true
})

let comments = new Datastore({
  filename: 'db/comments.db',
  autoload: true,
  timestampData : true
})

app.use(
  session({
    secret: "secret secret secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  const username = req.session.user ? req.session.user._id : "";
  req.username = (username)? username : null;
  res.setHeader('Set-Cookie', serialize('username', username, {
    path : '/', 
    maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
  }));
  console.log("HTTP request", req.username, req.method, req.url, req.body);
  next();
});

function isAuthenticated(req, res, next) {
  if (!req.session.user) return res.status(401).json("access denied, you are not authenticated");
  next();
}

const checkUsername = function(req, res, next) {
  if (!validator.isAlphanumeric(req.body.username)) return res.status(400).end("username must contain alphanumeric characters only");
  next();
};


// Authentication
app.post("/signup/", checkUsername, function (req, res, next) {
  if (!("username" in req.body))
    return res.status(400).json("username is missing");
  if (!("password" in req.body))
    return res.status(400).json("password is missing");
  const username = req.body.username;
  const password = req.body.password;
  users.findOne({ _id: username }, function (err, user) {
    if (err) return res.status(500).end(err);
    if (user)
      return res.status(409).end("username " + username + " already exists");
    genSalt(saltRounds, function (err, salt) {
      hash(password, salt, function (err, hash) {
        users.update(
          { _id: username },
          { _id: username, hash: hash },
          { upsert: true },
          function (err) {
            if (err) return res.status(500).end(err);
            users.findOne({ _id: username }, function (err, user) {
              if (err) return res.status(500).end(err);
              if (!user) return res.status(401).end("access denied");
              compare(password, user.hash, function (err, valid) {
                if (err) return res.status(500).end(err);
                if (!valid) return res.status(401).end("access denied");
                // start a session
                req.session.user = user;
                // initialize cookie
                res.setHeader(
                  "Set-Cookie",
                  serialize("username", username, {
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7,
                  }),
                );
                return res.json(username);
              });
            });
          },
        );
      })
    });
  });
});

app.post("/signin/", checkUsername, function (req, res, next) {
  if (!("username" in req.body))
    return res.status(400).json("username is missing");
  if (!("password" in req.body))
    return res.status(400).json("password is missing");
  const username = req.body.username;
  const password = req.body.password;
  // retrieve user from the database
  users.findOne({ _id: username }, function (err, user) {
    if (err) return res.status(500).end(err);
    if (!user) return res.status(401).end("access denied");
    compare(password, user.hash, function (err, valid) {
      if (err) return res.status(500).end(err);
      if (!valid) return res.status(401).end("access denied");
      // start a session
      req.session.user = user;
      // initialize cookie
      res.setHeader(
        "Set-Cookie",
        serialize("username", username, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        }),
      );
      return res.json(username);
    });
  });
});

app.get("/signout/", function (req, res, next) {
  req.session.destroy();
  res.setHeader(
    "Set-Cookie",
    serialize("username", "", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
    }),
  );
  res.redirect("/");
});

// Create
app.post("/api/images/", isAuthenticated, upload.single("picture"), function (req, res, next) {
  images.insert({ title: req.body.title, author: req.session.user._id, file : req.file }, function (err, image) {
      if (err) return res.status(500).end(err);
      return res.json(image);
    });
});

app.post("/api/comments/", isAuthenticated, function (req, res, next) {
  const comment = { image_id: req.body.image_id, author: req.session.user._id, content: req.body.content };
  comments.insert(comment, function (err, comment) {
    if (err) return res.status(500).end(err);
    return res.json(comment);
  });
});


// Read
app.get("/api/images/", isAuthenticated, function (req, res, next) {
  images
    .find({})
    .sort({ createdAt: -1 })
    .exec(function (err, images) {
      if (err) return res.status(500).end(err);
      return res.json(images);
    });
});

app.get("/api/membergallery/page=:page/", isAuthenticated, function (req, res, next) {
  images
    .find()
    .sort({ createdAt: -1 })
    .exec(function (err, images) {
      if (err) return res.status(500).end(err);

      let galleryImages = [];
      let galleryAuthors = [];
      images.forEach(function (image) {
        if ((image.author !== req.session.user._id) && (!galleryAuthors.includes(image.author))) {
          galleryImages.push(image);
          galleryAuthors.push(image.author);
        }
      });
      return res.json({ total: galleryImages.length, images: galleryImages.slice(req.params.page * 9, req.params.page * 9 + 9) });
    });
});

app.get('/api/images/:id/image/', isAuthenticated, function (req, res, next) {
  images.findOne({ _id : req.params.id }, function (err, image) {
    if (err) return res.status(500).end(err);
    if (!image)
      return res
        .status(404)
        .json("Image id: " + req.params.id + " does not exists");
    else {
      const img = image.file; 
      res.setHeader('Content-Type', img.mimetype);
      res.sendFile(img.path);
    }
  });
});

app.get("/api/images/:user/:index/", isAuthenticated, function (req, res, next) {
  images
    .find({ author : req.params.user })
    .sort({ createdAt: -1 })
    .exec(function (err, images) {
      if (err) return res.status(500).end(err);
      return res.json({ total: images.length, image: images[req.params.index] });
    });
});

app.get("/api/image/:index/", isAuthenticated, function (req, res, next) {
  images
    .find({})
    .sort({ createdAt: -1 })
    .exec(function (err, images) {
      if (err) return res.status(500).end(err);
      return res.json({ total: images.length, image: images[req.params.index] });
    });
});

app.get("/api/comments/:id/page=:page/", isAuthenticated, function (req, res, next) {
  comments
    .find({ image_id : req.params.id })
    .sort({ createdAt: -1 })
    .exec(function (err, comments) {
      if (err) return res.status(500).end(err);
      return res.json({ total: comments.length, comments: comments.slice(req.params.page * 10, req.params.page * 10 + 10) });
    });
});

// Delete
app.delete("/api/images/:id/", isAuthenticated, function (req, res, next) {
  images.findOne({ _id: req.params.id }, function (err, image) {
    if (err) return res.status(500).end(err);
    if (!image)
      return res
        .status(404)
        .json("Image id: " + req.params.id + " does not exists");

    // if logged in user is not the author, don't let delete happen! 
    if (image.author !== req.session.user._id)
      return res.status(403).json("forbidden, you are not the author");

    // delete all the comments corresponding to this image id if there's one
    comments.findOne({ image_id: image._id }, function (err, comment) {
      if (err) return res.status(500).end(err);
      if (comment) {
        comments.remove({ image_id: image._id }, { multi: true }, function (err, num) {
        });
      }
    });
    // then delete the image 
    images.remove({ _id: image._id }, { multi: false }, function (err, num) {
      res.json(image);
    });
  });
});

app.delete("/api/comments/:id/", isAuthenticated, function (req, res, next) {
  comments.findOne({ _id: req.params.id }, function (err, comment) {
    if (err) return res.status(500).end(err);
    if (!comment)
      return res
        .status(404)
        .json("Comment id: " + req.params.id + " does not exists");
    
    images.findOne({ _id: comment.image_id }, function (err, image) {
      if (err) return res.status(500).end(err);
      // if logged in user is not the author of the comment
      if (comment.author !== req.session.user._id) {
        // and if logged in user is not the owner of the image, don't let delete happen!
        if (image.author !== req.session.user._id)
          return res.status(403).json("forbidden, you are not the author");
      }
      // else logged in user is the author of the comment and/or the owner of the image, so delete 
      comments.remove({ _id: comment._id }, { multi: false }, function (err, num) {
        res.json(comment);
      });
    });
  });
});

// This is for testing purpose only
export function createTestDb(db) {
  users = new Datastore({
    filename: 'testdb/users.db',
    autoload: true,
    timestampData : true
  })

  images = new Datastore({
    filename: 'testdb/images.db',
    autoload: true,
    timestampData : true
  })

  comments = new Datastore({
    filename: 'testdb/comments.db',
    autoload: true,
    timestampData : true
  })
}

export function deleteTestDb(db) {
  rmSync("testdb", { recursive: true, force: true });
}

export function getUsers(callback) {
  return users
    .find({})
    .sort({ createdAt: -1 })
    .exec(function (err, users) {
      if (err) return callback(err, null);
      return callback(err, users.reverse());
    });
}

export function getImages(callback) {
    return images
      .find({})
      .sort({ createdAt: -1 })
      .exec(function (err, images) {
        if (err) return callback(err, null);
        return callback(err, images.reverse());
    });
}

export function getComments(callback) {
  return comments
    .find({})
    .sort({ createdAt: -1 })
    .exec(function (err, comments) {
      if (err) return callback(err, null);
      return callback(err, comments.reverse());
  });
}
// End of testing purposes only

export const server = createServer(app).listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
