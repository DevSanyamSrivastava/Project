import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse }  from "../utils/ApiResponse.js"



// const registerUser = asyncHandler(async (req, res) => {
//     //get user details from frontend
//     const { fullName, email, username, password } = req.body
//     console.log("email: ", email)

//     //Validation --- not empty
//     if (
//         [fullName, email, username, password].some((field) =>
//             field?.trim() === "")
//     ) {
//         throw new ApiError(404, "All field are required")
//     }

//     //Cheack if already exists: userName , email
//     const existedUser = await User.findOne({
//         $or: [{ username }, { email }]
//     })
//     if (existedUser) {
//         throw new ApiError(409, "User with this name or email already exists")
//     }


//     //Cheack for images Cheack of avatar
//     const avatarFile = req.files?.avatar?.[0];
//     const coverImageLocalPath = req.files?.coverImage[0].path

//     if (!avatarLocalPath) {
//         throw new ApiError(400, "Avatar file is required")
//     }

//     //upload them on Cloudinary
//     const avatar = await uploadOnCloudinary(avatarLocalPath)
//     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

//     if (!avatar) {
//         throw new ApiError(400, "Avatar file is required")
//     }

//     //CREATE user Object -- create entry in DB  
//     const user = await User.create({
//         fullName,
//         avatar: avatar.url,
//         coverImage: coverImage?.url || "",
//         email,
//         password,
//         username: username.toLowerCase()
//     })

//     //remove passsword and refresh token field
//     const createdUser= await User.findById(user._id).select(
//         "-password -refreshToken"
//     )

//     //cheack for user creation
//     if(!createdUser){
//         throw new ApiError(500, "Something went wrong while ragistering the user")
//     }
//     // return res.
//     return res.status(201).json()
//         new ApiResponse(200, createdUser, "User Ragister sucessfully")
// })


// export { registerUser }
// const registerUser = asyncHandler(async (req, res) => {
//     // Get file paths from multer
//     const avatarFilePath = req.files?.avatar?.[0]?.path;
//     const coverImageFilePath = req.files?.coverImage?.[0]?.path;

//     // Check if avatar file is present
//     if (!avatarFilePath) {
//         throw new ApiError(400, "Avatar file is required");
//     }

//     // Try uploading files to Cloudinary
//     let avatar, coverImage;
//     try {
//         avatar = await uploadOnCloudinary(avatarFilePath);
//         console.log("Avatar uploaded to Cloudinary:", avatar);
//     } catch (error) {
//         console.error("Error uploading avatar to Cloudinary:", error);
//         throw new ApiError(500, "Failed to upload avatar to Cloudinary");
//     }

//     if (coverImageFilePath) {
//         try {
//             coverImage = await uploadOnCloudinary(coverImageFilePath);
//             console.log("Cover image uploaded to Cloudinary:", coverImage);
//         } catch (error) {
//             console.error("Error uploading cover image to Cloudinary:", error);
//             throw new ApiError(500, "Failed to upload cover image to Cloudinary");
//         }
//     }

//     // Proceed to create the user with avatar and cover image URLs
//     const user = await User.create({
//         fullName: req.body.fullName,
//         avatar: avatar.url,
//         coverImage: coverImage?.url || "",
//         email: req.body.email,
//         password: req.body.password,
//         username: req.body.username.toLowerCase()
//     });

//     const createdUser = await User.findById(user._id).select("-password -refreshToken");

//     if (!createdUser) {
//         throw new ApiError(500, "Something went wrong while registering the user");
//     }

//     return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
// });
// export { registerUser }

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

export { registerUser };

