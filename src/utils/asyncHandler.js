const asyncHandler = (requestHandler) =>{
    return (req, res, next)=>{
        Promise
        .resolve(requestHandler(req, res, next))
        .catch((error)=>next(error));
    }
}
export {asyncHandler}

// first way to do  fuc=> fun => {}

// const asyncHandle=(fn)=>async(req, res, next) => { // high order function it can accept a function as well 

//      try {
//         await fn(req, res, next)
//      } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message,
//         });
//      }
// }