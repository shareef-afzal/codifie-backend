import express from "express";
import User from "../../models/user.js";
import wrapAsync from "../../utils/wrapAsync.js";
import customError from "../../utils/customError.js";
const router = express.Router();


//create Route
router.post("/signup",async (req,res)=>{
    try{
        let {username,email,password,institute,codeforces,leetcode,codechef}=req.body;
        const newUser=new User({
          username,
          email,
          institute,
          profiles:{codeforces,leetcode,codechef}
        });
        let registeredUser=await User.register(newUser,password);
        req.login(registeredUser,(err) => {
          if (err) {
              return next(err);
          }
          res.status(201).json({
            success:true,
            message: "Signup successful",
            user:registeredUser
          });
        })
    }
    catch (err){
        res.status(400).json({error:err.message});
    }
})
router.get("/logout",(req,res,next)=>{
  if(req.isAuthenticated()) {
        console.log("req recieved");
         req.logout((err) => {
            if (err) {
                return next(err);
            }
            res.status(200).json({message:"logged out successfully"});
        });
    }
    else{
      console.log("user is already logged out")
       res.status(401).json({message:"user is already logged out"});
    }
})
//login
import passport from "passport";
router.post("/login", passport.authenticate("local"), (req, res) => {
  console.log(req.user);
  res.status(200).json({ message: "Login successful", user: req.user });
});
router.get("/isloggedin",(req,res)=>{
  if(req.isAuthenticated()){
    res.json({isLoggedIn:true,user:req.user});
  }
  else{
    res.json({isLoggedIn:false});
  }
})
//Read Route
router.get("/fetchUsers", async (req, res) => {
  try {
    const users = await User.find();
    if (req.user) {
      return res.json(
        users
          .filter(user => user._id.toString() !== req.user._id.toString())
          .map(user => user.username)
      );
    }
    res.json(users.map(user => user.username));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:username/updatefriends",async (req,res)=>{
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "You must be logged in to update a profile" });
  }
  try {
    const user=await User.findOne({username:req.params.username});
    if (!user) return res.status(404).json({ error: "User not found" });
    const friendUser = await User.findOne({ username: req.body.friendUser });
    if (!friendUser) return res.status(400).json({ error: "Friend user not found" });
    const friendIdRecieved = friendUser._id;

    let alreadyFriend = false;
    let friends_ids=[];
    user.friends=user.friends||[];
    let friends = [];
    for (const friendId of user.friends) {
      if (!friendId.equals(friendIdRecieved)) {
        const friend = await User.findById(friendId);
        friends_ids.push(friendId);
        if (friend?.username) friends.push(friend.username);
      } else {
        alreadyFriend = true;
      }
    }

    if(!alreadyFriend){
      friends.push(req.body.friendUser);
      friends_ids.push(friendIdRecieved);
    }
    if(alreadyFriend){
      friendUser.friendcount-=1;
    }
    else{
      friendUser.friendcount+=1;
    }
    await User.findOneAndUpdate(
      { username: req.params.username },
      {friends:friends_ids},
      { new: true }
    );
    await User.findOneAndUpdate(
      { username: friendUser.username },
      {friendcount:friendUser.friendcount},
      { new: true }
    );
    res.json({friends});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})
router.get("/:username",wrapAsync(async(req,res)=>{
    const user=await User.findOne({username:req.params.username});
    if(!user){
        throw new customError("user not found",404);
    }
    res.json(user);
}))
//Update Route
router.put("/:username", async (req, res) => {
    if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "You must be logged in to update a profile" });
  }

  // Step 2: Check if user is authorized (i.e., updating own profile)
  if (req.user.username !== req.params.username) {
    return res.status(403).json({ error: "You are not allowed to update this profile" });
  }
  try {
    req.body.lastFetchedAt=null;
    if(req.body.profiles.codeforces){
      req.body.profiles.codeforces=`https://codeforces.com/profile/${req.body.profiles.codeforces}`;
    }
    if(req.body.profiles.codechef){
      req.body.profiles.codechef=`https://www.codechef.com/users/${req.body.profiles.codechef}`;
    }
    if(req.body.profiles.leetcode){
      req.body.profiles.leetcode=`https://leetcode.com/u/${req.body.profiles.leetcode}/`;
    }
    const updated = await User.findOneAndUpdate(
      { username: req.params.username },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Delete Route
router.delete("/:username", async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({ username: req.params.username });
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//username availiable route
router.get("/check-username/:username",async (req,res)=>{
  const user= await User.findOne({username:req.params.username});
  res.json({availiable:!user});
})
//user data for edit page
router.get("/:username/getdata",async (req,res)=>{
  try{
    const username=req.params.username;
    const user= await User.findOne({username:req.params.username});
    const institute=user.institute;
    const getHandle= (url)=>{
      const cleanUrl=url.endsWith("/")?url.slice(0,-1):url;
      return cleanUrl.split("/").pop();
    }
    let codeforces=getHandle(user.profiles.codeforces);
    let codechef=getHandle(user.profiles.codechef);
    let leetcode=getHandle(user.profiles.leetcode);
    res.json({username,institute,codeforces,codechef,leetcode});
  }
  catch (err){
    res.status(500).json({ error: err.message });
  }
})
router.get("/:username/getfriends", async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });
    if (!user || !user.friends || user.friends.length === 0) {
      return res.json({ friends: [] });
    }
    const friends = await Promise.all(
      user.friends.map(async (friendId) => {
        const friend = await User.findById(friendId);
        return friend?.username; 
      })
    );
    res.json({ friends });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;