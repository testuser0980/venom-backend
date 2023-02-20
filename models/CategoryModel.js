const mongoose = require("mongoose");
const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
    },
    blog_id: {
      type: Schema.Types.ObjectId
    },
    cat_name: {
      type: String,
      required: true,
      default: "Uncategorized",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("categorie", CategorySchema);
