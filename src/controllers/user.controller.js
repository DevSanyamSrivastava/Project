import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {


    //get user details from frontend
    const { fullName, email, username, password } = req.body
    console.log("email: ", email)

    //Validation --- not empty
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(404, "All field are required")
    }

    //Cheack if already exists: userName , email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with this name or email already exists")
    }

    // Get file paths from multer
    const avatarFilePath = req.files?.avatar?.[0]?.path;
    const coverImageFilePath = req.files?.coverImage?.[0]?.path;

    // Check if avatar file is present
    if (!avatarFilePath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Try uploading files to Cloudinary
    let avatar, coverImage;
    try {
        avatar = await uploadOnCloudinary(avatarFilePath);
        console.log("Avatar uploaded to Cloudinary:", avatar);
    } catch (error) {
        console.error("Error uploading avatar to Cloudinary:", error);
        throw new ApiError(500, "Failed to upload avatar to Cloudinary");
    }

    if (coverImageFilePath) {
        try {
            coverImage = await uploadOnCloudinary(coverImageFilePath);
            console.log("Cover image uploaded to Cloudinary:", coverImage);
        } catch (error) {
            console.error("Error uploading cover image to Cloudinary:", error);
            throw new ApiError(500, "Failed to upload cover image to Cloudinary");
        }
    }

    // Proceed to create the user with avatar and cover image URLs
    const user = await User.create({
        fullName: req.body.fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email: req.body.email,
        password: req.body.password,
        username: req.body.username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    const { email, username, password } = req.body
    console.log(email);

    // username or email
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    //find the user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User not find")
    }

    //password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    //access and referesh token
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //send cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})  

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})



export {
    registerUser,
    loginUser,
    logoutUser
};

