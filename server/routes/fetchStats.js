import express from "express";
import User from "../../models/user.js";
import codeforcesFetcher from "../../services/codeforcesFetcher.js";
import leetcodeFetcher from "../../services/leetcodeFetcher.js";
import codechefFetcher from "../../services/codechefFetcher.js";
import wrapAsync from "../../utils/wrapAsync.js";
import customError from "../../utils/customError.js";

const router = express.Router();
router.get("/all/:username",wrapAsync(async (req,res)=>{
    const {username}=req.params;
    const user = await User.findOne({ username });
    if (!user) throw new customError("user not found",404);
    //update codeforces data 
    const codeforcesURL=user.profiles.codeforces;
    const cf_handle=codeforcesURL.split("/").pop();
    const cfData=await codeforcesFetcher(cf_handle);
    user.platformStats.Codeforces =cfData;
    //update leetcode data
    const leetcodeURL=user.profiles.leetcode;
    let splittedData=leetcodeURL.split("/");
    splittedData.pop();
    const lc_handle=splittedData.pop();
    const lcData=await leetcodeFetcher(lc_handle);
    user.platformStats.LeetCode =lcData;
    //update codechef data
    const codechefURL=user.profiles.codechef;
    const cc_handle=codechefURL.split("/").pop();
    const ccData=await codechefFetcher(cc_handle);
    user.platformStats.CodeChef =ccData;
    //pdate the fetched time and save and return the updated data
    const now=new Date();
    user.lastFetchedAt=now;
    await user.save();
    res.send(user);
}))


// router.get("/codeforces/:username",async(req , res)=>{
//     const {username}=req.params;

//     const user = await User.findOne({ username });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const codeforcesURL=user.profiles.codeforces;
//     const cf_handle=codeforcesURL.split("/").pop();
//     const cfData=await codeforcesFetcher(cf_handle);
//     user.platformStats.Codeforces =cfData;
//     await user.save();

//     res.json(cfData);
// })
// router.get("/leetcode/:username",async(req , res)=>{
//     const {username}=req.params;

//     const user = await User.findOne({ username });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const leetcodeURL=user.profiles.leetcode;
//     let splittedData=leetcodeURL.split("/");
//     splittedData.pop();
//     const lc_handle=splittedData.pop();

//     const lcData=await leetcodeFetcher(lc_handle);

//     user.platformStats.LeetCode =lcData;
//     await user.save();

//     res.json(lcData);
// })
// router.get("/codechef/:username",async(req , res)=>{
//     const {username}=req.params;

//     const user = await User.findOne({ username });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const codechefURL=user.profiles.codechef;
//     const cc_handle=codechefURL.split("/").pop();

//     const ccData=await codechefFetcher(cc_handle);

//     user.platformStats.CodeChef =ccData;
//     await user.save();

//     res.json(ccData);
// })
export default router;