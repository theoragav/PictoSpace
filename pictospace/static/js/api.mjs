function sendFiles(method, url, data, callback) {
  const formdata = new FormData();
  Object.keys(data).forEach(function (key) {
    const value = data[key];
    formdata.append(key, value);
  });
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status !== 200)
      callback("[" + xhr.status + "]" + xhr.responseText, null);
    else callback(null, JSON.parse(xhr.responseText));
  };
  xhr.open(method, url, true);
  xhr.send(formdata);
}

function send(method, url, data, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status !== 200)
      callback("[" + xhr.status + "]" + xhr.responseText, null);
    else callback(null, JSON.parse(xhr.responseText));
  };
  xhr.open(method, url, true);
  if (!data) xhr.send();
  else {
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
  }
}

export function getUsername() {
  let username = document.cookie.split("username=")[1];
  if (!username) return null;
  return username;
}

export function signin(username, password, callback) {
  send("POST", "/signin/", { username, password }, callback);
}

export function signup(username, password, callback) {
  send("POST", "/signup/", { username, password }, callback);
}

export function signout(callback) {
  send("GET", "/signout/", null, callback);
}

export function addImage(title, file, callback) {
    sendFiles(
        "POST",
        "/api/images/",
        { title: title, picture: file },
        function (err, res) {
            if (err) return callback(err);
            return callback(null);
        },
    );
}

export function getMemberImages(page, callback) {
  send("GET", "/api/membergallery/page=" + page + "/", null, callback);
}

export function getImage(index, callback) {
  send("GET", "/api/image/" + index + "/", null, callback);
}

export function getUserImage(user, index, callback) {
  send("GET", "/api/images/" + user + "/" + index + "/", null, callback);
}

export function deleteImage(imageId, callback) {
    send("DELETE", "/api/images/" + imageId + "/", null, function (err, res) {
      if (err) return callback(err);
      else return callback(null);
    });
}

export function addComment(imageId, content, callback) {
    send(
        "POST",
        "/api/comments/",
        { image_id: imageId, content: content },
        function (err, res) {
            if (err) return callback(err);
            else return callback(null);
        },
    );
}

export function getImageCommentsPage(imageId, page, callback) {
  send("GET", "/api/comments/" + imageId + "/page=" + page + "/", null, callback);
}

export function deleteComment(commentId, callback) {
  send("DELETE", "/api/comments/" + commentId + "/", null, function (err, res) {
    if (err) return callback(err);
    else return callback(null);
  });
}