const mongoose = require("mongoose");
const { Schema } = mongoose;

const BlogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    blog_feature_img: {
      data: Buffer,
      contentType: String,
    },
    author: {
      type: String,
    },
    author_profile: {
      data: Buffer,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("blog", BlogSchema);
