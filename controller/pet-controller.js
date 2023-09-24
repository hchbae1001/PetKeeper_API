const petService = require('../service/pet-service');
const {uploadImg,deleteImg} = require('../routes/middle/aws-s3');
const {permissionCheck,handleErrorResponse} = require('../util/error');
const sharp = require('sharp');

async function getPet(req,res){
  const {USER_AUTH, USER_ID} = res.locals.userInfo;
  const {id} = req.params;
  try{
    const pet = await petService.getPetById(id);
    if(permissionCheck(USER_AUTH,USER_ID,pet.USER_ID)){
      return res.status(200).json(pet).end();
    }
  }catch(err){
    handleErrorResponse(err, res);
  }
}
async function getPets(req,res){
  try{
    const data = await petService.getPets()
    return res.status(200).json(data).end();
  }catch(err){
    handleErrorResponse(err, res);
  }
}

async function deletePetImg(req,res){
  const {USER_AUTH, USER_ID} = res.locals.userInfo;
  const {id} = req.params;
  try{
    const pet = await petService.getPetById(id);
    if(permissionCheck(USER_AUTH,USER_ID,pet.USER_ID)){
      const target = pet.PET_IMAGE.split('/')[3]+"/"+pet.PET_IMAGE.split('/')[4];
      if(target !== 'pet-profile/default-img'){
        await deleteImg(target);
        await petService.deletePetImg(id);
      }
      return res.status(200).json({
        success: true,
        message: 'delete success'
      }).end();
    }
  }catch(err){
    handleErrorResponse(err, res);
  }
}

async function uploadPetImg(req,res){
  const image = req.file;
  const {USER_AUTH, USER_ID} = res.locals.userInfo;
  const {id} = req.params;
  const key = 'pet-profile/' + `${id}_${Date.now()}`
  const url = 'https://'+process.env.s3_bucket+'.s3.'+process.env.s3_region+'.amazonaws.com/'+key;
  try{
    if(!image){
      throw new Error('No File');
    }
    const pet = await petService.getPetById(id);
    if(permissionCheck(USER_AUTH,USER_ID,pet.USER_ID)){
      if(pet.PET_IMAGE !== null){
        const target = pet.PET_IMAGE.split('/')[3]+"/"+pet.PET_IMAGE.split('/')[4];
        await deleteImg(target);
      }
      const buffer = await sharp(image.buffer).resize({width:640,height:640}).withMetadata().toBuffer();
      await uploadImg(buffer,key,image.mimetype);
      await petService.uploadPetImg(id,url);
      return res.status(200).json(url).end();;
    }
  }catch(err){
    handleErrorResponse(err, res);
  }
}

async function addPet(req,res){
  const {USER_ID} = res.locals.userInfo;
  let pet = req.body;
  try{
    if(!pet){
      throw new Error('No pet');
    }
    const addedPet = await petService.addPet(pet,USER_ID);
    return res.status(200).json(addedPet).end();
  }catch(err){
    handleErrorResponse(err, res);
  }
}

async function updatePet(req,res){
  const {USER_AUTH, USER_ID} = res.locals.userInfo;
  let pet = req.body;
  const {id} = req.params;
  try{
    if(!pet){
      throw new Error('No pet');
    }
    const petInfo = await petService.getPetById(id);
    if(permissionCheck(USER_AUTH,USER_ID,petInfo.USER_ID)){
      const data = await petService.updatePet(pet,id);
      return res.status(200).json(pet).end();
    }
  }catch(err){
    handleErrorResponse(err, res);
  }
}
async function deletePet(req,res){
  const {USER_AUTH, USER_ID} = res.locals.userInfo;
  const {PET_ID} = req.params;
  try{
    const petInfo = await petService.getPetById(PET_ID);
    if(permissionCheck(USER_AUTH,USER_ID,petInfo.USER_ID)){
      const data = await petService.deletePet(PET_ID);
      return res.status(200).json(data).end();;
    }
  }catch(err){
    handleErrorResponse(err, res);
  }
}

async function addPetVaccination(req,res){
  const {USER_AUTH, USER_ID} = res.locals.userInfo;
  let vaccination = req.body;
  const {PET_ID} = req.params;
  try{
    if(!vaccination){
      throw new Error('No vaccination');
    }
    const petInfo = await petService.getPetById(PET_ID);
    if(permissionCheck(USER_AUTH,USER_ID,petInfo.USER_ID)){
      const data = await petService.addPetVaccination(vaccination,PET_ID);
      return res.status(200).json(vaccination).end();;
    }
  }catch(err){
    handleErrorResponse(err, res);
  }
}
async function deletePetVaccination(req,res){
  const {USER_AUTH, USER_ID} = res.locals.userInfo;
  const {PET_VACCINATION_ID} = req.params;
  try{
    const petInfo = await petService.getPetVaccinationById(PET_VACCINATION_ID);
    const owner_user_Id = petInfo.PET.USER_ID;
    if(permissionCheck(USER_AUTH,USER_ID,owner_user_Id)){
      const data = await petService.deletePetVaccination(PET_VACCINATION_ID);
      return res.status(200).json(data).end();;
    }
  }catch(err){
    handleErrorResponse(err, res);
  }
}

async function updatePetVaccination(req,res){
  const {USER_AUTH, USER_ID} = res.locals.userInfo;
  let vaccination = req.body;
  const {PET_VACCINATION_ID} = req.params;
  try{
    if(!vaccination){
      throw new Error('No vaccination');
    }
    const petInfo = await petService.getPetVaccinationById(PET_VACCINATION_ID);
    const owner_user_Id = petInfo.PET.USER_ID;
    if(permissionCheck(USER_AUTH,USER_ID,owner_user_Id)){
      const data = await petService.updatePetVaccination(vaccination,PET_VACCINATION_ID);
      return res.status(200).json(vaccination).end();;
    }
  }catch(err){
    handleErrorResponse(err, res);
  }
}

async function addPetWeight(req,res){
  const {USER_AUTH, USER_ID} = res.locals.userInfo;
  let weight = req.body;
  const {PET_ID} = req.params;
  try{
    if(!weight){
      throw new Error('No weight');
    }
    const petInfo = await petService.getPetById(PET_ID);
    if(permissionCheck(USER_AUTH,USER_ID,petInfo.USER_ID)){
      const data = await petService.addPetWeight(weight,PET_ID);
      return res.status(200).json(data).end();;
    }
  }catch(err){
    handleErrorResponse(err, res);
  }
}

async function deletePetWeight(req,res){
  const {USER_AUTH, USER_ID} = res.locals.userInfo;
  const {PET_WEIGHT_ID} = req.params;
  try{
    const weightInfo = await petService.getPetWeightById(PET_WEIGHT_ID);
    const owner_user_Id = weightInfo.PET.USER_ID
    if(permissionCheck(USER_AUTH,USER_ID,owner_user_Id)){
      const data = await petService.deletePetWeight(PET_WEIGHT_ID);
      return res.status(200).json(data).end();;
    }
  }catch(err){
    handleErrorResponse(err, res);
  }
}

async function updatePetWeight(req,res){
  const {USER_AUTH, USER_ID} = res.locals.userInfo;
  let weight = req.body;
  const {PET_WEIGHT_ID} = req.params;
  try{
    if(!weight){
      throw new Error('No weight');
    }
    const weightInfo = await petService.getPetWeightById(PET_WEIGHT_ID);
    const owner_user_Id = weightInfo.PET.USER_ID
    if(permissionCheck(USER_AUTH,USER_ID,owner_user_Id)){
      const data = await petService.updatePetWeight(weight,PET_WEIGHT_ID);
      return res.status(200).json(weight).end();;
    }
  }catch(err){
    handleErrorResponse(err, res);
  }
}

module.exports ={
  getPet,
  getPets,
  addPet,
  updatePet,
  deletePet,
  uploadPetImg,
  deletePetImg,

  addPetVaccination,
  deletePetVaccination,
  updatePetVaccination,

  addPetWeight,
  deletePetWeight,
  updatePetWeight,
}