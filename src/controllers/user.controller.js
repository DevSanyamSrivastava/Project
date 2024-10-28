import {asyncHandler} from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        Message: "Hey! This is api testing"
    })
})


export {registerUser}
