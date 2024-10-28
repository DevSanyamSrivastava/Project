import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse }  from "../utils/ApiResponse.js"



const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    const { fullname, email, username, password } = req.body
    console.log("email: ", email)

    //Validation --- not empty
    if (
        [fullname, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(404, "All field are required")
    }

    //Cheack if already exists: userName , email
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with this name or email already exists")
    }


    //Cheack for images Cheack of avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0].path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    //upload them on Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    //CREATE user Object -- create entry in DB  
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowercase()
    })

    //remove passsword and refresh token field
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //cheack for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while ragistering the user")
    }
    // return res.
    return res.status(201).json()
        new ApiResponse(200, createdUser, "User Ragister sucessfully")
})


export { registerUser }
