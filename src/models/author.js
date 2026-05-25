import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    age: { type: Number, required: true, min: 0, max: 200 },
  },
  { timestamps: true },
);

authorSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export function buildAuthorModel(connection = mongoose) {
  return connection.models.Author || connection.model("Author", authorSchema);
}
