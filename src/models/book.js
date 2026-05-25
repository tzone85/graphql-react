import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    genre: { type: String, required: true, trim: true, maxlength: 60 },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "Author", required: true },
  },
  { timestamps: true },
);

bookSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export function buildBookModel(connection = mongoose) {
  return connection.models.Book || connection.model("Book", bookSchema);
}
