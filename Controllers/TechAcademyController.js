const { db } = require('../firebaseAdmin'); 
const TechAcademy = require('../Models/TechAcademyModel');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const techAcademyCollection = db.collection('techAcademy');

exports.registerUserTechAcademy = async (req, res, next) => {
  try {

    console.log(req.body);  
    
    if (!req.body.password) {  
      return res.status(400).json({ error: 'Password is required' });
    }


    const hashedPassword = await bcrypt.hash(req.body.password, 2); // 

   
    const user = new TechAcademy(
      null, 
      req.body.name,
      req.body.phone,
      hashedPassword,
      req.body.nationalId,
      req.body.email,
      req.body.age,
      req.body.englishLevel,
      req.body.birthDate,
      req.body.nationality,
      req.body.province,
      req.body.district,
      req.body.area,
      req.body.academicDegree,
      req.body.children,
      req.body.organization,
      'TechAcademy'
      
    );

    const userPlainObject = {
      name: user.name,
      phone: user.phone,
      password: user.password,
      nationalId: user.nationalId,
      email: user.email,
      age: user.age,
      englishLevel: user.englishLevel,
      birthDate: user.birthDate,
      nationality: user.nationality,
      province: user.province,
      district: user.district,
      area: user.area,
      academicDegree: user.academicDegree,
      children: user.children,
      organization: user.organization,
      access: user.access
    
    };

   
    const savedUserRef = await techAcademyCollection.add(userPlainObject);


    const token = jwt.sign(
      {
        Id: savedUserRef.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.access
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.loginUserTechAcademy = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userQuerySnapshot = await techAcademyCollection.where('email', '==', email).limit(1).get();

  
    if (userQuerySnapshot.empty) {
      return res.status(401).json({ error: 'Authentication failed: User not found' });
    }

   
    const userDoc = userQuerySnapshot.docs[0];
    const userData = userDoc.data(); 
    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Authentication failed: Incorrect password' });
    }


    if (req.headers['authorization']) {
      authenticateToken(req, res, async () => {
        const token = jwt.sign(
          { Id: userDoc.id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: '1h' }
        );
        res.status(200).json({ token });
      });
    } else {
      
      const token = jwt.sign(
        {
          Id: userDoc.id,
          userRole: userData.access,
          userName: userData.name,
          userEmail: userData.email,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );
      res.status(200).json({ token });
    }

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
};



exports.createUserTechAcademy = async (req, res, next) => {
  try {
    const data = req.body;
    await techAcademyCollection.add(data);
    res.status(200).send('UserTechAcademy created successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};



exports.getAllUsersTechAcademy = async (req, res, next) => {
  try {
    const techAcademy = await techAcademyCollection.get();
    const techAcademyArray = [];

    if (techAcademy.empty) {
      res.status(400).send('No Users found');
    } else {
      techAcademy.forEach((doc) => {
        const techAcademy = new TechAcademy(
          doc.id,
          doc.data().name,
          doc.data().phone,
          doc.data().nationalId,
          doc.data().email,
          doc.data().age,
          doc.data().englishLevel,
          doc.data().birthDate,
          doc.data().nationality,
          doc.data().province,
          doc.data().district,
          doc.data().area,
          doc.data().academicDegree,
          doc.data().children,
          doc.data().organization,
          doc.data().access
        );
        techAcademyArray.push(techAcademy);
      });

      res.status(200).send(techAcademyArray);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.getUserTechAcademy = async (req, res, next) => {
  try {
    const id = req.params.id;
    const techAcademyDoc = techAcademyCollection.doc(id);
    const data = await techAcademyDoc.get();
    if (data.exists) {
      res.status(200).send(data.data());
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.updateUserTechAcademy = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const techAcademyDoc = techAcademyCollection.doc(id);
    await techAcademyDoc.update(data);
    res.status(200).send('User updated successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.deleteUserTechAcademy = async (req, res, next) => {
  try {
    const id = req.params.id;
    await techAcademyCollection.doc(id).delete();
    res.status(200).send('User deleted successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};
