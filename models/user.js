import mongoose from "mongoose";
import passportLocalMongoose from 'passport-local-mongoose'
const { Schema } = mongoose;

const ratingHistorySchema = new Schema({
  date: String,
  rating: Number,
  contest: String
}, { _id: false });

const heatmapSchema = new Schema({
  date: String,
  count: Number
}, { _id: false });

const platformStatsSchema = new Schema({
  currentRating: Number,
  currentRank: String,
  maxRating: Number,
  problemsSolved: Number,
  contests: Number,
  ratingHistory: [ratingHistorySchema],
  heatmap: [heatmapSchema]
}, { _id: false });

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, match: /^\S+$/},
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/ // simple email format validation
  },
  profilePic: {
    type: String,
    default: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
  },
  friendcount:{
    type: Number,
    default:0
  },
  institute: String,
  profiles: {
    codechef: String,
    codeforces: String,
    leetcode: String
  },
  platformStats: {
    Codeforces: platformStatsSchema,
    CodeChef: platformStatsSchema,
    LeetCode: platformStatsSchema
  },
  friends:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  }],
  lastFetchedAt:{
    type: Date,
    default:null,
  }
});

userSchema.plugin(passportLocalMongoose,{
  usernameField:'email'
});

const User = mongoose.model("User", userSchema);
export default User;
