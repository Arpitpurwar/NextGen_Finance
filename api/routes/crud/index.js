const express = require("express");
const router = express.Router();
const middleware = require("../../middleware");
const { validationResult } = require('express-validator');
const validation=require('../../common/validate');

/**
 * @swagger
 * /getUsers:
 *   get:
 *     summary: Get Information of Users
 *     tags:
 *       - User
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successful Operation
 *       500:
 *         description: Server Error
 * 
 * /insertRORDetails:
 *    post:
 *       summary: Insert all ROR Details
 *       tags:
 *          - ROR_Operation
 *       consumes:
 *          - application/json
 *       produces:
 *          - application/json
 *       parameters:
 *          - name: body
 *            in: body
 *            required: true
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                    type: number
 *                    required: true
 *                name:
 *                    type: string
 *                    required: true
 *                role:
 *                    type: string
 *                    required: true
 *                email:
 *                    type: string
 *                    required: true
 *       responses:
 *         200:
 *            description: Successful Operation
 *         500:
 *            description: Server Error
 *         422: 
 *            description: User has not given proper input parameter 
 * /updateUser:
 *    put:
 *       summary: Update the User Data
 *       tags:
 *          - User
 *       consumes:
 *          - application/json
 *       produces:
 *          - application/json
 *       parameters:
 *          - name: body
 *            in: body
 *            required: true
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                    type: number
 *                    required: true
 *                name:
 *                    type: string
 *                    required: true
 *                role:
 *                    type: string
 *                    required: true
 *                email:
 *                    type: string
 *                    required: true
 *       responses:
 *         200:
 *            description: Successful Operation
 *         500:
 *            description: Server Error
 *         400: 
 *            description: User has not given proper input parameter 
* /deleteUser:
 *    delete:
 *       summary: Delete the User Data
 *       tags:
 *          - User
 *       consumes:
 *          - application/json
 *       produces:
 *          - application/json
 *       parameters:
 *          - name: body
 *            in: body
 *            required: true
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                    type: number
 *                    required: true
 *       responses:
 *         200:
 *            description: Successful Operation
 *         500:
 *            description: Server Error
 *         422: 
 *            description: User has not given proper input parameter 
 */


router.post('/insertRORDetails',
validation.validate('insertRORDetails'),
(req,res)=>{  
  const errors = validationResult(req);  
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(),success:false });
  }
  middleware.initiateRORInsert(req.body).then(data => res.send(data)).catch(err =>res.send(err))
})


/**
 * Insert all ROR data which will have same structure as insertion of single ROR.
 * Now All ROR will come in Array.
 * To DO Validation Pending
 */
router.post('/insertRORColleaction',
(req,res)=>{ 
  middleware.insertBulkROR(req.body).then(data => res.send(data)).catch(err =>res.send(err))
})



router.get('/getRORDetails',(req,res)=>{  
    middleware.getRORDetails(req.query).then(data => 
      res.send(data)         
      )
      .catch(err =>res.send(err))
})


router.get('/getROR/:id',(req,res)=>{
  middleware.getROR(req.params.id).then(result=>{
  res.send(result);
  }).catch((err)=>{
    res.status(500).send(err);
  })
})


router.put('/updateRORDetails',
(req,res)=>{
  middleware.updateRORDetails(req.body).then(result=>{
    res.send(result);
    }).catch((err)=>{
      res.status(500).send({success:false,message:err});
    })
})

router.get('/masterData',(req,res)=>{
  middleware.masterData().then(result => res.send(result)).catch(e => res.send(e));
})

router.get('/exportROR',(req,res)=>{   
  middleware.exportROR().then((path)=>{ 
    res.download(path);
  }
)
.catch(e => res.send({"err":e}));
})



module.exports = router;