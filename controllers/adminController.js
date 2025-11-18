// controllers/adminController.js
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';
import generatePassword from '../utils/generatePassword.js';
import sendEmail from '../utils/sendEmail.js';
import { roles } from '../models/User.js';

/**
 * Admin registers a single RMG for a company.
 * - Only one RMG allowed per company.
 * Body: { name, email, company }  // company = ObjectId (or string if you use string)
 */
export const registerRMG = asyncHandler(async (req, res, next) => {
  const { name, email, company } = req.body;

  if (!name || !email || !company) {
    return next(new ErrorResponse('Please provide name, email and company', 400));
  }

  // ensure role email unique
  const existing = await User.findOne({ email });
  if (existing) return next(new ErrorResponse('Email already registered', 400));

  // ensure only one RMG per company
  const existingRMG = await User.findOne({ role: 'RMG', company });
  if (existingRMG) return next(new ErrorResponse('An RMG already exists for this company', 400));

  // generate secure password
  const password = generatePassword();

  // create user in a transaction (safe)
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.create(
      [
        {
          name,
          email,
          password,
          role: 'RMG',
          company,
        },
      ],
      { session }
    );

    // send credentials email
    await sendEmail({
      to: email,
      subject: 'Your RMG account has been created',
      html: buildCredentialEmail(name, email, password, 'RMG'),
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, message: 'RMG created and email sent', data: { id: user[0]._id, email } });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(new ErrorResponse(err.message || 'Failed to create RMG', 500));
  }
});

/**
 * Admin registers an HR user (multiple allowed).
 * Body: { name, email, company }
 */
export const registerHR = asyncHandler(async (req, res, next) => {
  const { name, email, company } = req.body;
  if (!name || !email || !company) {
    return next(new ErrorResponse('Please provide name, email and company', 400));
  }

  const existing = await User.findOne({ email });
  if (existing) return next(new ErrorResponse('Email already registered', 400));

  const password = generatePassword();

  try {
    const user = await User.create({ name, email, password, role: 'HR', company });

    await sendEmail({
      to: email,
      subject: 'Your HR account has been created',
      html: buildCredentialEmail(name, email, password, 'HR'),
    });

    res.status(201).json({ success: true, message: 'HR created and email sent', data: { id: user._id, email } });
  } catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to create HR', 500));
  }
});

/* Helper to build HTML credential email */
const buildCredentialEmail = (name, email, password, role) => {
  const loginUrl = process.env.FRONTEND_URL || 'https://your-portal.example.com/login';
  const companyLine = `<p style="margin:0">Role: <strong>${role}</strong></p>`;

  return `
  <div style="font-family: Inter, Arial, sans-serif; color: #0f172a; line-height:1.5;">
    <div style="max-width:600px;margin:0 auto;border:1px solid #e6eef8;padding:28px;border-radius:8px;">
      <h2 style="margin-top:0;color:#0b5fff">Welcome to Recruiter Portal</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your account has been created by your Company Admin. Use the credentials below to sign in:</p>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px;border:1px solid #f1f5f9;width:30%">Email</td>
          <td style="padding:8px;border:1px solid #f1f5f9">${email}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #f1f5f9">Password</td>
          <td style="padding:8px;border:1px solid #f1f5f9">${password}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #f1f5f9">Role</td>
          <td style="padding:8px;border:1px solid #f1f5f9">${role}</td>
        </tr>
      </table>

      <p style="margin-top:18px">For security, please change your password after first login. You can login here:</p>

      <p style="text-align:center;margin:20px 0">
        <a href="${loginUrl}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:#0b5fff;color:#fff;text-decoration:none">Go to Login</a>
      </p>

      <hr style="border:none;border-top:1px solid #eef2ff;margin:18px 0"/>
      <p style="color:#475569;font-size:13px;margin:0">If you didn’t expect this email, please contact your company administrator.</p>
      <p style="color:#94a3b8;font-size:12px;margin:12px 0 0">© ${new Date().getFullYear()} Recruiter Portal</p>
    </div>
  </div>
  `;
};
