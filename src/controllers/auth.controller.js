import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { emailVerificationMailContent, sendEmail } from "../utils/mail.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.accessToken = accessToken;

    await user.save({ validateBeforeSave: false });
    //validateBeforeSave: false BCZ --> we dont want to validate other User field

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Access and Refresh Token generation failed");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //receive the data
  const { email, username, password, role } = req.body;

  //validate user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email already exist", []);
  }

  //it is like: emai: email, password: password, i.e
  //take eamil value and save in the DB with similar field-name
  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  //Now generate TEMPORARY_TOKEN to sent to the user
  //user = actual document to be store in the MongoDB, So
  //userSchema.methods.generateTemporaryToken = function() {}
  //it specify that every DOCUMENTS created for 'User' using the userSchema can use the generateTemporaryToken
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();
  //return { unHashedToken, hashedToken, tokenExpiry };
  // these are returned when run generateTemporaryToken()

  //Store the HASHED TOKEN
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  //send an email so that SAME TOKEN CAN BE SENT TO THE USER
  await sendEmail({
    email: user?.email,
    subject: "Verify your mail",
    mailGenContent: emailVerificationMailContent(
      user.username,
      `${req.prototype}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry -",
    //field with ‘-’ will be ignored
  );

  if (!createdUser) {
    throw new ApiError(500, " Problem in registering user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "SignUp successfully. Verification mail sent on your mail",
      ),
    );
});

export { registerUser };
