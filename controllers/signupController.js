import SignUp from "../models/SignUp.js"
import User from "../models/User.js";
import Company from "../models/Company.js";
import bcrypt from "bcryptjs"

export const signup = async (req, res) => {
    console.log("i am getting hit")
    const { firstName, lastName, email, phone, companyId, jobTitle, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !phone || !companyId || !jobTitle || !password || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        })
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Passwords do not match',
        });
    }
    try {
    // 3. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // 4. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // salt rounds = 10

    // 5. Create and save the user
    const newUser = new SignUp({
      firstName,
      lastName,
      email,
      phone,
      company: companyId, 
      jobTitle,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      newUser
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
    });
  }


} 

export const createCompany = async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Company name is required',
    });
  }

  try {
    // Check for duplicate
    const existing = await Company.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Company already exists',
      });
    }

    const newCompany = new Company({ name: name.trim() });
    await newCompany.save();

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company: {
        _id: newCompany._id,
        name: newCompany.name,
      },
    });
  } catch (error) {
    console.error('❌ Error creating company:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating company',
    });
  }
};


export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}, '_id name').sort({ name: 1 });

    res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    console.error('❌ Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
    });
  }
}; 