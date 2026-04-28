const bcrypt = require("bcryptjs");
const userModel = require("../models/user.model");

async function seedAdmin() {
    try {
        const adminEmail = "vishalkshirsagr4@gmail.com";
        const adminUsername = "Admin";

        const existingAdmin = await userModel.findOne({
            $or: [
                { email: adminEmail },
                { username: adminUsername }
            ]
        });

        if (existingAdmin) {
            console.log("Built-in admin already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash("Vishal@86601", 10);

        await userModel.create({
            username: adminUsername,
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            artistRequestStatus: "none",
            isEmailVerified: true,
        });

        console.log("Built-in admin created successfully.");
    } catch (error) {
        console.error("Error seeding admin:", error);
    }
}

module.exports = seedAdmin;

