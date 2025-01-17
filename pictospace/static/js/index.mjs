import { signin, signup, getUsername, getMemberImages, getUserImage, addImage, deleteImage, addComment, getImageCommentsPage, deleteComment  } from "./api.mjs"

function onError(err) {
    console.error("[error]", err);
    let error_box = document.querySelector("#error_box");
    error_box.classList.add('container');
    error_box.innerHTML = `<div class="form_input_icon" id="error_icon"></div>`;
    error_box.innerHTML += `<div class="error_text">` + err + `</div>`;
    error_box.style.visibility = "visible";
}

const username = getUsername();
let memberUser;
let inMemberPage = false;
let inMyPage = true;
let currentImage;
let imageIndex = 0;
let commentPage = 0;
let memberPage = 0;

function update() {
    if (username) {
        loginForm.style.display = "none";
        signUpForm.style.display = "none";
        document.getElementById("navbar_loggedin").style.display = "flex";
        document.querySelector("#navbar_username").innerHTML = username;

        if (inMyPage) {
            document.getElementById("gallery").style.display = "flex";
            document.getElementById("add_image").style.display = "flex";    
            updateUserGallery(username, false);
        }
        if (inMemberPage) {
            if (memberUser) {
                updateUserGallery(memberUser, true);
            }
            else {
                getMemberImages(memberPage, function (err, images) {
                    if (err) return onError(err);

                    // Pagination
                    const membersLength = images.total;
                    const totalPages = parseInt((membersLength/9) + ((membersLength%9) != 0));

                    if (membersLength == 0 || memberPage == 0) {
                        document.querySelector("#prev_members").classList.remove('icon_btn', 'caret_icon');
                        document.querySelector("#prev_members").classList.add('disabled', 'caret_disabled_icon');
                    } else {
                        document.querySelector("#prev_members").classList.remove('disabled', 'caret_disabled_icon');
                        document.querySelector("#prev_members").classList.add('icon_btn', 'caret_icon');
                    }
                    if (membersLength == 0 || memberPage == totalPages - 1) {
                        document.querySelector("#next_members").classList.remove('icon_btn', 'caret_icon');
                        document.querySelector("#next_members").classList.add('disabled', 'caret_disabled_icon');
                    } else {
                        document.querySelector("#next_members").classList.remove('disabled', 'caret_disabled_icon');
                        document.querySelector("#next_members").classList.add('icon_btn', 'caret_icon');
                    }
                    document.querySelector("#prev_members").addEventListener("click", function (e) {
                        if (memberPage > 0) {
                            memberPage--; 
                            update();
                        }
                    });
                    document.querySelector("#next_members").addEventListener("click", function (e) {
                        if (memberPage < totalPages - 1) {
                            memberPage++; 
                            update();
                        }
                    });

                    // All Members Gallery
                    document.querySelector("#member_image_section").innerHTML = "";
                    images.images.forEach(function (image) {
                        const element = document.createElement("div");
                        element.className = "member_image";
                        element.innerHTML = `
                        <div class="element_description">
                            <div class="form_input_icon" id="author_icon"></div>
                            <div class="text_content">${image.author}</div>
                        </div>
                        <img id="current_image" src="/api/images/${image._id}/image/" alt="${image.title}"/>
                        <div class="element_description">
                            <div class="form_input_icon" id="date_icon"></div>
                            <div class="text_content">${formatDate(new Date (image.createdAt))}</div>
                        </div>
                        `;
                        element.querySelector("#current_image").addEventListener("click", function (e) {
                            document.getElementById("member_gallery").style.display = "none";
                            document.getElementById("gallery").style.display = "flex";
                            memberUser = image.author;
                            updateUserGallery(memberUser, true);
                        });
                        document.querySelector("#member_image_section").appendChild(element);
                    });
                });
            }
        }
    }
}

export function updateUserGallery(user, viewMember) {
    getUserImage(user, imageIndex, function (err, images) {
        if (err) return onError(err);
        if (viewMember) {
            document.querySelector("#gallery_heading").innerHTML = user + "'s Gallery";
        } else {
            document.querySelector("#gallery_heading").innerHTML = "My Gallery";
        }
        document.querySelector("#image_section").innerHTML = "";
        if (images.total > 0) {
            currentImage = images.image; 
            if (images.total == 1) imageIndex = 0;
            document.querySelector("#image_section").innerHTML = `
            <div class="element_description">
                <div class="form_input_icon" id="title_icon"></div>
                <div class="title_text_content">${images.image.title}</div>
            </div>
            <div class="display_container">
                <img id="current_image" src="/api/images/${images.image._id}/image/" alt="${images.image.title}"/>
            </div>
            <div class="image_desciption">
                <div class="inline_element_description">
                    <div class="element_description">
                        <div class="form_input_icon" id="author_icon"></div>
                        <div class="text_content">${images.image.author}</div>
                    </div>
                    <div class="element_description">
                        <div class="form_input_icon" id="date_icon"></div>
                        <div class="text_content">${formatDate(new Date (images.image.createdAt))}</div>
                    </div>
                </div>
            </div>
            <div class="image_options">
                <button class="icon_btn left_rotate caret_icon" id="prev_image" type="button"></button>
                <button class="icon_btn right_rotate caret_icon" id="next_image" type="button"></button>    
            </div>`;
            if (!viewMember) {
            document.querySelector("#image_section").innerHTML +=
            `<div class="form_buttons">
                <button class="icon_btn delete_icon" id="delete_image" type="button"></button>
            </div>
            `;
            }
            
            if (imageIndex == 0) {
                document.querySelector("#prev_image").classList.remove('icon_btn', 'caret_icon');
                document.querySelector("#prev_image").classList.add('disabled', 'caret_disabled_icon');
            }
            if (imageIndex == images.total - 1) {
                document.querySelector("#next_image").classList.remove('icon_btn', 'caret_icon');
                document.querySelector("#next_image").classList.add('disabled', 'caret_disabled_icon');
            }
            document.querySelector("#prev_image").addEventListener("click", function (e) {
                if (imageIndex > 0) {
                    imageIndex--; 
                    commentPage = 0;
                    update();
                }
            });
            document.querySelector("#next_image").addEventListener("click", function (e) {
                if (imageIndex < images.total - 1) {
                    imageIndex++; 
                    commentPage = 0;
                    update();
                }
            });
            if (!viewMember) {
                document.querySelector("#delete_image").addEventListener("click", function (e) {
                    deleteImage(images.image._id, function (err) {
                        if (err) return onError(err);
                        commentPage = 0;
                        if (images.total == 1) {
                            location.reload();
                        }
                        else if (imageIndex > 0) {
                            imageIndex--;
                        }
                        update();
                    });
                });
            }
            updateComments(viewMember);
        }
    });
}

export function updateComments(viewMember) {
    // show the comment form
    document.querySelector("#comment_form").innerHTML = `
        <div class="form_title">Add a Comment</div>
        <div class="form_element comment_form_element">
            <div class="form_input_icon" id="comment_icon"></div>
            <textarea class="form_input" id="comment_text" rows="4" placeholder="Comment" required></textarea>
        </div>
        <div class="form_buttons">
            <input class="btn" id="add_comment" type="submit" value="Add"/>
        </div>
    `;
    // comments
    getImageCommentsPage(currentImage._id, commentPage, function (err, comments) {
        if (err) return onError(err);
        document.querySelector("#comments").innerHTML = `
            <div class="comment">
                <div class="form_title">Comments</div>
                <div class="form_buttons">
                    <button class="icon_btn left_rotate caret_icon" id="prev_comments" type="button"></button>
                    <button class="icon_btn right_rotate caret_icon" id="next_comments" type="button"></button>
                </div>
            </div>
        `;
        const commentsLength = comments.total;
        const totalPages = parseInt((commentsLength/10) + ((commentsLength%10) != 0));
        if (commentsLength == 0 || commentPage == 0) {
            document.querySelector("#prev_comments").classList.remove('icon_btn', 'caret_icon');
            document.querySelector("#prev_comments").classList.add('disabled', 'caret_disabled_icon');
        }
        if (commentsLength == 0 || commentPage == totalPages - 1) {
            document.querySelector("#next_comments").classList.remove('icon_btn', 'caret_icon');
            document.querySelector("#next_comments").classList.add('disabled', 'caret_disabled_icon');
        }
        if (comments.comments.length > 0) {
            comments.comments.forEach(function (comment) {
                const element = document.createElement("div");
                element.className = "comment";
                element.innerHTML = `
                    <div class="left_section_comment">
                        <div class="form_input_icon" id="author_icon"></div>
                        <div class="comment_content">
                            <div class="comment_logistic">
                                <div class="comment_author">${comment.author}</div>
                                <div class="comment_date">${formatDate(new Date (comment.createdAt))}</div>  
                            </div>
                            <div class="comment_text">${comment.content}</div>
                        </div>
                    </div>
                `;
                if (!viewMember || (username == comment.author)) {
                    element.innerHTML += 
                    `<button class="icon_btn delete_icon" id="delete_comment" type="button"></button>`;
                    element.querySelector("#delete_comment").addEventListener("click", function (e) {
                        deleteComment(comment._id, function (err, comment) {
                            if (err) return onError(err);
                            if (comments.comments.length == 1 && commentPage > 0) {
                                commentPage--;
                            }
                        });
                        update();
                    });
                }
                document.querySelector("#comments").appendChild(element);
            });
            document.querySelector("#prev_comments").addEventListener("click", function (e) {
                console.log("LEFT");
                if (commentPage > 0) {
                    commentPage--;
                    update();
                }
            });
            document.querySelector("#next_comments").addEventListener("click", function (e) {
                console.log("RIGHT");
                if (commentPage < totalPages - 1 ) {
                    commentPage++;
                    update();
                }
            });
        }
    });
}

export function reset() {
    memberUser = null;
    currentImage = null;
    imageIndex = 0;
    commentPage = 0;
    memberPage = 0;
}

// A button to toggle (show/hide) the sign up / login form
const loginForm = document.getElementById("login");
const signUpForm = document.getElementById("sign_up");
document.getElementById("to_login").addEventListener("click", function (e) {
    loginForm.style.display = "flex";
    signUpForm.style.display = "none";
});
document.getElementById("to_signup").addEventListener("click", function (e) {
    loginForm.style.display = "none";
    signUpForm.style.display = "flex";
});

// Login Form
loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("login_username").value;
    const password = document.getElementById("login_password").value;
    signin(username, password, function (err, username) {
        if (err) return onError(err);
        window.location.href = "/";
    });
});

// Sign Up Form
signUpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("signup_username").value;
    const password = document.getElementById("signup_password").value;
    signup(username, password, function (err, username) {
        if (err) return onError(err);
        window.location.href = "/";
    });
});

// To navigate between Member Gallery page or My Gallery page
const memberGallery = document.getElementById("member_gallery");
const myGallery = document.getElementById("gallery");
const addImageForm = document.getElementById("add_image");

document.getElementById("to_membergallery").addEventListener("click", function (e) {
    inMemberPage = true;
    inMyPage = false;
    reset();
    memberGallery.style.display = "flex";
    myGallery.style.display = "none";
    addImageForm.style.display = "none";
    update();
});
document.getElementById("to_mygallery").addEventListener("click", function (e) {
    inMemberPage = false;
    inMyPage = true;
    reset();
    memberGallery.style.display = "none";
    myGallery.style.display = "flex";
    addImageForm.style.display = "flex";
    document.querySelector("#comment_form").innerHTML = "";
    document.querySelector("#comments").innerHTML = "";
    update();
});

// A button to toggle (show/hide) the add_image form
document.getElementById("toggle_show").addEventListener("click", function (e) {
    document.getElementById("add_image").style.display = "flex";
    toggle_show.style.display = "none";
});

document.getElementById("toggle_hide").addEventListener("click", function (e) {
    document.getElementById("add_image").style.display = "none";
    toggle_show.style.display = "flex";
});

// Adding images
document.getElementById("add_image").addEventListener("submit", function (e) {
    e.preventDefault();
    const title = document.getElementById("image_title").value;
    const file = document.getElementById("image_file").files[0];
    document.getElementById("add_image").reset();
    addImage(title, file, function (err) {
        if (err) return onError(err);
        imageIndex = 0;
        commentPage = 0;
        update();
    });
});

// Adding comments
document.getElementById("comment_form").addEventListener("submit", function (e) {
    e.preventDefault();
    const comment = document.getElementById("comment_text").value;
    document.getElementById("comment_form").reset();
    addComment(currentImage._id, comment, function (err) {
        if (err) return onError(err);
        commentPage = 0;
        update();
    });
});

// Formatting Date
export function formatDate(date) {
    const dateFormat = { year: 'numeric', month: 'long', day: '2-digit' };
    const formattedDate = date.toLocaleDateString('en-US', dateFormat);
    const hour = new Intl.NumberFormat('en-US', { minimumIntegerDigits: 2 }).format(date.getHours());
    const minute = new Intl.NumberFormat('en-US', { minimumIntegerDigits: 2 }).format(date.getMinutes());
    const formattedTime = `${hour}:${minute}`;
    return formattedDate + " " + formattedTime;
}

update();