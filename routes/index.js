var express = require("express");
var router = express.Router();
const passport = require("passport");
const localStrategy = require("passport-local");
const userModel = require("./users");
const postModel = require("./posts");
const storyModel = require("./story");
const commentModel= require("./comment");
// const userprofileModel = require("./userprofile");
passport.use(new localStrategy(userModel.authenticate()));
const upload = require("./multer");
const utils = require("../utils/utils");


// GET
router.get("/index", function (req, res) {
  res.render("index", { footer: false });
});

// router.get("/home", function (req, res) {
//   res.render("home", { footer: false });
// });
//changes start
// router.get("/home", isLoggedIn, async function (req, res) {
//   let user = await userModel
//     .findOne({ username: req.session.passport.user })
//     .populate("posts");

//   let stories = await storyModel.find({ user: { $ne: user._id } })
//     .populate("user");

//   var uniq = {};
//   var filtered = stories.filter(item => {
//     if (!uniq[item.user.id]) {
//       uniq[item.user.id] = " ";
//       return true;
//     }
//     else return false;
//   })

//   let posts = await postModel.find().populate("user");

//   res.render("home", {
//     footer: true,
//     user,
//     posts,
//     stories: filtered,
//     dater: utils.formatRelativeTime,
//   });
// });


//chang end
router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/like/:postid", async function (req, res) {
  const post = await postModel.findOne({ _id: req.params.postid });
  const user = await userModel.findOne({ username: req.session.passport.user });
  if (post.like.indexOf(user._id) === -1) {
    post.like.push(user._id);
  } else {
    post.like.splice(post.like.indexOf(user._id), 1);
  }
  await post.save();
  res.json(post);
});
// router.get("/like/post/:id", async function (req, res) {
//   const user = await userModel.findOne({ username: req.session.passport.user });
//   const post = await postModel.findOne({ _id: req.params.id });
//   if (post.likes.indexOf(user._id) === -1) {
//     post.likes.push(user._id);
//   } else {
//     post.likes.splice(post.likes.indexOf(user._id), 1);
//   }
//   await post.save();
//   res.redirect("/feed");
// });

// followers router
// router.get('/follow/:id', isLoggedIn, async function (req, res) {
//   try {
//     let user = await user.findById(req.params.id); // Changed 'user' to 'User'
//     if (req.user.id === req.params.id) {
//       req.flash('error', 'You cannot add yourself');
//       res.redirect('back');
//     } else {
//       user.followers.addToSet(req.user._id); // Removed { _id: ... }
//       await user.save(); // Await for the save operation

//       req.flash('success', 'Successfully followed ' + user.local.username + '!');
//       res.redirect('back');
//     }
//   } catch (err) {
//     req.flash('error', err.message);
//     res.redirect('back');
//   }
// });

// follow delete
// router.delete('/follow/:id', isLoggedIn, async function (req, res) {
//   try {
//     let user = await user.findById(req.params.id); // Changed 'user' to 'User'
//     user.followers.pull(req.user._id); // Changed req.user.id to req.user._id
//     await user.save(); // Await for the save operation

//     req.flash('success', 'Successfully unfollowed ' + user.local.username + '!');
//     res.redirect('back');
//   } catch (err) {
//     req.flash('error', err.message);
//     res.redirect('back');
//   }
// });

router.get("/feed", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");

  let stories = await storyModel.find({ user: { $ne: user._id } })
    .populate("user");

  var uniq = {};
  var filtered = stories.filter(item => {
    if (!uniq[item.user.id]) {
      uniq[item.user.id] = " ";
      return true;
    }
    else return false;
  })

  let posts = await postModel.find().populate("user");

  res.render("feed", {
    footer: true,
    user,
    posts,
    stories: filtered,
    dater: utils.formatRelativeTime,
  });
});
router.get("/feed", isLoggedIn,async function(req,res){
  const user= await userModel.findOne({ username: req.session.passport.user});
  const posts= await postModel.find().populate("user");
  res.render("feed",{ footer: true, posts, user});
});
// router.get("/profile", isLoggedIn, async function(req,res){
//   const user= await userModel.findOne({ username: req.session.passport.user});
//   res.render("profile", {footer: true, user});
// });

router.get("/profile", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user }).populate("posts").populate("saved");
  console.log(user);

  res.render("profile", { footer: true, user });
});

// router.get("/userprofile/:user", isLoggedIn, async function (req, res) {

//   let userprofile = await userModel.findOne({ username: req.session.passport.user }).populate("posts").populate("saved");
//   console.log(userprofile);

//   res.render("userprofile", { footer: true, userprofile });
// });

router.get("/profile/:user", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user })

  if (user.username === req.params.user) {
    res.redirect("/profile");
  }

  let userprofile = await userModel.findOne({ username: req.params.user }).populate("posts");
  

  res.render("userprofile", { footer: true, userprofile, user });
});

// NEW
// router.get("/userprofile/:user", isLoggedIn, async (req, res) => {
//   try {
//     const loggedInUser = await userModel.findOne({ username: req.session.passport.user });

//     if (!loggedInUser) {
//       return res.redirect("/login");
//     }

//     const userProfile = await userModel.findOne({ username: req.params.user }).populate("posts");

//     if (!userProfile) {
//       return res.status(404).send("User not found");
//     }

//     if (loggedInUser.username === req.params.user) {
//       return res.redirect("/profile");
//     }

//     res.render("userprofile", { footer: true, userprofile: userProfile, user: loggedInUser });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// });

// router.get("/userprofile", isLoggedIn, async function (req, res) {
//   const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts").populate("saved");
//   console.log(user);
//   co
//   res.render("userprofile", { footer: true, user });
// });
// router.get("/userprofile", async, function (req, res){
//   const user = await userModel.findOne({ username: req.session.passport.user });
//   // Assuming you have a way to fetch userprofile data, e.g., from a database
//   const userprofile =await getUserProfile(); // This function would need to be defined
//   res.render("userprofile",{footer: true, userprofile, user });
// });

// router.get("/profile/:user", isLoggedIn, async function (req, res) {
//   let currentUser = await userModel.findOne({ username: req.session.passport.user });
  
//   let userprofile = await userModel.findOne({ username: req.params.user }).populate("posts");

//   if (!userprofile) {
//     // Handle user not found error
//     return res.status(404).send("User not found");
//   }

//   res.render("userprofile", { footer: true, userprofile, user: currentUser });
// });

// router.get("/profile/:user", isLoggedIn, async function (req, res) {
//   try {
//     const loggedInUser = await userModel.findOne({ username: req.session.passport.user });
//     const userprofile = await userModel.findOne({ username: req.params.username }).populate("posts");

//     if (!userprofile) {
//       return res.status(404).send("User not found");
//     }

//     if (loggedInUser.username === userprofile.username) {
//       return res.redirect("/profile");
//     }

//     res.render("userprofile", { footer: true, userprofile, user: loggedInUser });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server Error");
//   }
// });
// router.get("/profile/user/:username", isLoggedIn, async function (req, res) {
//   try {
//     let user = await userModel.findOne({ username: req.params.username });

//     if (!user) {
//       // Handle case where user is not found
//       res.status(404).send("User not found");
//       return;
//     }

//     let currentUser = await userModel.findOne({ username: req.session.passport.user });

//     res.render("userprofile", { footer: true, userprofile: user, user: currentUser });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// });

// router.get("/profile/:username", async (req, res) => {
//   try {
//     const userprofile = await userModel.findOne({ username: req.params.username }).populate('posts');
//     if (!userprofile) {
//       return res.status(404).send("User not found");
//     }

//     res.render("userprofile", { userprofile });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// });


router.get("/followers/user/:id", isLoggedIn, async function (req, res) {
  try {
    const currentUser = await userModel.findOne({ username: req.session.passport.user });
    const userToFollow = await userModel.findById(req.params.id);

    if (!currentUser || !userToFollow) {
      return res.status(404).send("User not found");
    }

    if (currentUser.following.includes(userToFollow._id)) {
      // Unfollow user
      const index = currentUser.following.indexOf(userToFollow._id);
      currentUser.following.splice(index, 1);

      const followerIndex = userToFollow.followers.indexOf(currentUser._id);
      userToFollow.followers.splice(followerIndex, 1);
    } else {
      // Follow user
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.redirect("/feed");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});



// Unfollow a user
router.post("/unfollow/:userid", async (req, res) => {
  try {
    const user = req.user; // Assuming you're using Passport for authentication
    const userToUnfollow = await userModel.findById(req.params.userid);

    if (!userToUnfollow) {
      return res.status(404).send("User not found");
    }

    const followingIndex = user.following.indexOf(req.params.userid);
    if (followingIndex !== -1) {
      user.following.splice(followingIndex, 1);
      await user.save();

      const followerIndex = userToUnfollow.followers.indexOf(user._id);
      userToUnfollow.followers.splice(followerIndex, 1);
      await userToUnfollow.save();

      res.redirect("back"); // Redirect to the previous page
    } else {
      res.status(400).send("You are not following this user");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
})

router.get("/search", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });
  res.render("search", { footer: true, user });
});

router.get("/",async function (req, res) {
  // let user = await userModel.findOne({ username: req.session.passport.user });
  res.render("main", { footer: true});
});

router.get("/tandc", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });
  res.render("tandc", { footer: true, user });
});

router.get("/story/:id", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });
  const stories= await storyModel.find().populate("user");
  res.render("story", { footer: true, stories, user });
});

router.get("/features", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });
  res.render("features", { footer: true, user });
});

router.get("/save/:postid", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });

  if (user.saved.indexOf(req.params.postid) === -1) {
    user.saved.push(req.params.postid);
  } else {
    var index = user.saved.indexOf(req.params.postid);
    user.saved.splice(index, 1);
  }
  await user.save();
  res.json(user);
});



router.get("/edit", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("edit", { footer: true, user });
});

// router.get("/search/:user", isLoggedIn, async function (req, res) {
//   const searchTerm = `^${req.params.user}`;
//   const regex = new RegExp(searchTerm);

//   let users = await userModel.find({ username: { $regex: regex } });

//   res.json(users);
// });

router.get("/username/:username", isLoggedIn, async function (req, res) {
  const regex = new RegExp(`^${req.params.username}`, 'i');
  const users = await userModel.find({ username: regex });
  res.json(users);
});


router.get("/upload", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });
  res.render("upload", { footer: true, user });
});

router.get("/setting", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });
  res.render("setting", { footer: true, user });
});

router.post("/update", isLoggedIn, async function (req, res) {
  const user = await userModel.findOneAndUpdate(
    { username: req.session.passport.user },
    { username: req.body.username, name: req.body.name, bio: req.body.bio },
    { new: true }
  );

  if (req.file) {
    user.profileImage = req.file.fieldname;
  }
  await user.save();
  res.redirect("/profile");

  // req.login(user, function (err) {
  //   if (err) throw err;
  //   res.redirect("/profile");
  // });
});

// router.post("/post", isLoggedIn, upload.single("image"), async function (req, res) {
//   const user = await userModel.findOne({
//     username: req.session.passport.user,
//   });

//   if (req.body.category === "post") {
//     const post = await postModel.create({
//       user: user._id,
//       caption: req.body.caption,
//       picture: req.file.filename,
//     });
//     user.posts.push(post._id);
//   } else if (req.body.category === "story") {
//     let story = await storyModel.create({
//       story: req.file.filename,
//       user: user._id,
//     });
//     user.stories.push(story._id);
//   } else {
//     res.send("tez mat chalo");
//     // return res.status(400).send("Invalid category");
//   }

//   await user.save();
//   res.redirect("/feed");
// }
// );

//NEW CODE
router.post("/post", isLoggedIn, upload.single("image"), async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });

    if (req.body.category === "post") {
      const post = await postModel.create({
        user: user._id,
        caption: req.body.caption,
        picture: req.file.filename,
        comment: req.body.comment,
      });
      user.posts.push(post._id);
    } else if (req.body.category === "story") {
      const story = await storyModel.create({
        user: user._id,
        story: req.file.filename,
      });
      user.stories.push(story._id);
    } else {
      return res.status(400).send("Invalid category");
    }

    await user.save();
    res.redirect("/feed");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//NEW CODE END

router.post("/upload", isLoggedIn, upload.single("image"), async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  user.picture = req.file.filename;
  await user.save();
  res.redirect("/edit");
}
);

// delete start

// delete post (User)

router.delete("/delete/:id", async function (req, res) {
  try {
    await postModel.findByIdAndDelete(req.params.id);
    // Optionally, you can remove the post ID from the user's posts array
    await userModel.findByIdAndUpdate(req.user._id, { $pull: { posts: req.params.id } });
    res.status(200).send("Post deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//Delete User (Admin-Panel)

router.delete('/delete/:userId', async (req, res) => {
  const userId = await userModel.findById(req.params.userId);

  try {
    const deletedUser = await user.deleteOne({ _id: userId });

    if (deletedUser.deletedCount === 1) {
      res.json({ message: 'User deleted successfully' });
    } else {
      // res.status(404).json({ message: 'User not found' });
      res.json({ message: "User could not be found" });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// router.delete("/delete/:userId", async function (req, res) {
//   try {
//     await userModel.findByIdAndDelete(req.params.id);
//     // Optionally, you can remove the post ID from the user's posts array
//     await userModel.findByIdAndUpdate(req.user._id, { $pull: { posts: req.params.id } });
//     res.status(200).send("Post deleted successfully");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server Error");
//   }
// });


// router.post("/delete/:id", isLoggedIn, async function (req, res) {
//   try {
//     const post = await postModel.findById(req.params.id);
//     if (!post) {
//       return res.status(404).send("Post not found");
//     }

//     // Check if the logged-in user is the author of the post
//     if (post.user.toString() !== req.user._id.toString()) {
//       return res.status(403).send("Unauthorized");
//     }

//     await postModel.findByIdAndDelete(req.params.id);
//     await userModel.findByIdAndUpdate(req.user._id, { $pull: { posts: req.params.id } });
//     res.redirect("/feed");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server Error");
//   }
// });





router.get("/admin", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const admin= await postModel.find().populate("user");
  res.render("admin", { footer: true, user ,admin });
});

// delete start end



router.get("/userprofile", isLoggedIn,async function(req,res){
  const user= await userModel.findOne({username:req.session.passport.user});
  res.render("userprofile",{footer: true, user});
});

// POST

router.post("/register", function (req, res) {
  const user = new userModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
  });

  userModel.register(user, req.body.password).then(function (registereduser) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/feed",
  failureRedirect: "/login",

}),
  function (req, res) { }
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
