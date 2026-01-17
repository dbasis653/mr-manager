import { body } from "express-validator";

//userRegisterValidator() does NOT send errors.
//It only defines validation rules.
const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in LOWERCASE")
      .isLength({ min: 3 })
      .withMessage("Username must be atleast 3 characters"),
    body("password").trim().notEmpty().withMessage("Password cannot be EMPTY"),
    body("fullname").optional().trim(),
  ];
};

const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Email Invalid"),
    body("password").trim().notEmpty().withMessage("Provide valid password"),
  ];
};

export { userRegisterValidator, userLoginValidator };
