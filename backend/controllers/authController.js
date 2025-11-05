const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Génération du token JWT
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Signup
const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Utilisateur déjà existant' });

    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur création utilisateur', error });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log('\n🔐 [LOGIN] Tentative de connexion:', { email, password: password ? '***' : 'missing' });
  
  // Validation des données
  if (!email || !password) {
    console.log('❌ [LOGIN] Email ou mot de passe manquant');
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ [LOGIN] Utilisateur non trouvé: ${email}`);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    console.log(`✅ [LOGIN] Utilisateur trouvé: ${user.name} (${user.role})`);
    
    const isPasswordValid = await user.matchPassword(password);
    
    if (!isPasswordValid) {
      console.log(`❌ [LOGIN] Mot de passe incorrect pour: ${email}`);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    console.log(`✅ [LOGIN] Mot de passe correct pour: ${email}`);
    
    // Vérifier que JWT_SECRET est défini
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET n\'est pas défini dans .env');
      return res.status(500).json({ message: 'Erreur de configuration serveur' });
    }
    
    const token = generateToken(user._id);
    console.log(`✅ [LOGIN] Token généré avec succès pour: ${email}`);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token
    });
  } catch (error) {
    console.error('❌ [LOGIN] Erreur:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
};

// GET tous les utilisateurs (admin seulement)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // ne pas renvoyer le password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération utilisateurs', error });
  }
};

module.exports = { signup, login, getUsers };
