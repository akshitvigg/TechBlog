const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function hashLegacyPasswords(Model) {
  const accounts = await Model.find({
    password: { $not: /^\$2[aby]\$\d{2}\$/ },
  });
  for (const account of accounts) {
    account.password = await bcrypt.hash(String(account.password), 12);
    await account.save();
  }
  return accounts.length;
}

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/techblog")
  .then(async () => {
    const Admin = require("../models/Admin");
    const User = require("../models/User");
    const Category = require("../models/Category");
    const migratedAdmins = await hashLegacyPasswords(Admin);
    const migratedUsers = await hashLegacyPasswords(User);
    if (migratedAdmins + migratedUsers > 0) {
      console.log(
        `Hashed passwords for ${migratedAdmins + migratedUsers} existing account(s)`,
      );
    }
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      await Category.insertMany([
        { cat_name: "Programming" },
        { cat_name: "Web Development" },
        { cat_name: "Databases" },
        { cat_name: "Software Engineering" },
      ]);
      console.log("Default categories created");
    }
    console.log("MongoDB connected");
  })
  .catch((err) => console.log(err.message));

module.exports = mongoose;
