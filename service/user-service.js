const sequelize = require('../models').sequelize;
let initModels = require('../models/init-models');
let {p_pet,p_user} = initModels(sequelize);
const { Op } = require('sequelize');
async function getUsers() {
  const users = await p_user.findAll({
    attributes: {
      exclude: ['USER_PASSWORD', 'USER_ACCESSTOKEN', 'IS_DELETED', 'createdAt', 'updatedAt']
    },
    include: {
      model: p_pet,
      as: 'p_pets',
      where: { IS_DELETED: 0 },
      attributes: { exclude: ['createdAt', 'updatedAt', 'IS_DELETED'] }
    }
  });
  
  if (!users.length) {
    throw new Error('Users not found');
  }
  
  return users;
}

async function deleteUserImg(USER_ID) {
  const defaultImg = `https://${process.env.s3_bucket}.s3.${process.env.s3_region}.amazonaws.com/user-profile/default-img`;
  const [numOfAffectedRows] = await p_user.update(
    { USER_IMAGE: defaultImg },
    { where: { USER_ID: USER_ID } }
  );
  
  if (numOfAffectedRows === 0) {
    throw new Error('User not found');
  }
  
  return numOfAffectedRows;
}

async function uploadUserImg(USER_ID, key) {
  const [numOfAffectedRows] = await p_user.update(
    { USER_IMAGE: key },
    { where: { USER_ID: USER_ID } }
  );
  
  if (numOfAffectedRows === 0) {
    throw new Error('User not found');
  }
  
  return numOfAffectedRows;
}

async function getUserById(id) {
  const user = await p_user.findOne({
    attributes: {
      exclude: ['USER_PASSWORD', 'USER_ACCESSTOKEN', 'IS_DELETED', 'createdAt', 'updatedAt']
    },
    where: { USER_ID: id },
    include: {
      model: p_pet,
      as: 'p_pets',
      attributes: { exclude: ['createdAt', 'updatedAt', 'IS_DELETED'] },
    },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

async function getUserByEmail(email) {
  const user = await p_user.findOne({
    attributes: {
      exclude: ['IS_DELETED', 'createdAt', 'updatedAt']
    },
    where: { USER_EMAIL: email }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

async function getUserByPhone(phone) {
  const user = await p_user.findOne({
    attributes: {
      exclude: ['USER_PASSWORD', 'USER_ACCESSTOKEN', 'IS_DELETED', 'createdAt', 'updatedAt']
    },
    where: { USER_PHONE: phone }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}


async function getUserByToken(token) {
  const user = await p_user.findOne({
    attributes: {
      exclude: ['USER_PASSWORD', 'USER_ACCESSTOKEN', 'IS_DELETED', 'createdAt', 'updatedAt']
    },
    where: { USER_ACCESSTOKEN: token },
    include: {
      model: p_pet,
      attributes: { exclude: ['createdAt', 'updatedAt', 'IS_DELETED'] },
      as: 'p_pets'
    }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}


async function addUser(user) {
  const existingUser = await p_user.findOne({
    where: {
      [Op.or]: [
        { USER_EMAIL: user.USER_EMAIL },
        { USER_PHONE: user.USER_PHONE }
      ]
    }
  });
  
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  const createdUser = await p_user.create(user);
  
  if (!createdUser) {
    throw new Error('User not created');
  }
  
  return createdUser;
}


async function updateUser(user,id) {
  const checkUser = await p_user.findOne({
    where: { USER_ID: id }
  });
  
  if (!checkUser) {
    throw new Error('User not found');
  }
  
  const checkEmail = await p_user.findOne({
    where: {
      USER_EMAIL: user.USER_EMAIL,
      USER_ID: { [Op.not]: id }
    }
  });
  
  if (checkEmail) {
    throw new Error('Email already exists');
  }
  
  const checkPhone = await p_user.findOne({
    where: {
      USER_PHONE: user.USER_PHONE,
      USER_ID: { [Op.not]: id }
    }
  });
  
  if (checkPhone) {
    throw new Error('Phone already exists');
  }
  
  const [numOfAffectedRows] = await p_user.update(user, {
    where: { USER_ID: id }
  });
  
  if (numOfAffectedRows === 0) {
    throw new Error('User not updated');
  }
  
  return user;
}


async function deleteUser(id) {
  const existingUser = await p_user.findOne({ where: { USER_ID: id } });
  
  if (!existingUser) {
    throw new Error('User not found');
  }
  
  const numOfAffectedRows = await p_user.destroy({
    where: { USER_ID: id },
  });

  
  return numOfAffectedRows;
}



module.exports ={
  getUsers,
  getUserById,
  getUserByEmail,
  getUserByPhone,
  getUserByToken,
  addUser,
  updateUser,
  deleteUser,
  uploadUserImg,
  deleteUserImg,
}