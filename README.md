# Database Manager

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v14%2B-green.svg)

**Database Manager** est une interface web légère et performante pour gérer vos bases de données MySQL. Conçu comme une alternative simple à phpMyAdmin, cet outil vous permet de surveiller, d'explorer et d'interagir avec vos données directement depuis votre navigateur.

---

## ✨ Fonctionnalités Principales

- **🔌 Connexion Simplifiée** : Connectez-vous à n'importe quelle base de données MySQL locale ou distante avec vos identifiants habituels.
- **📊 Tableau de Bord Analytique** : Visualisez en un coup d'œil la santé de votre base de données :
  - Taille totale et moyenne des tables.
  - Nombre d'index, de clés primaires et étrangères.
  - Graphiques de répartition de l'espace.
- **file_cabinet Explorateur de Tables** :
  - Listez toutes les tables de votre base.
  - Consultez le schéma détaillé (colonnes, types, index).
  - Naviguez dans les données avec pagination et tri.
- **⚡ Exécuteur SQL** : Lancez des requêtes SQL brutes pour des besoins spécifiques et exportez les résultats.

## 🛠️ Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **[Node.js](https://nodejs.org/)** (version 12 ou supérieure)
- **[MySQL](https://www.mysql.com/)** (ou MariaDB) en cours d'exécution

## 🚀 Installation

1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-utilisateur/database-manager.git
   cd database-manager
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

## 🏁 Démarrage

1. **Lancer le serveur**
   ```bash
   node server.js
   ```

2. **Accéder à l'application**
   Ouvrez votre navigateur et allez à l'adresse :
   [http://localhost:3000](http://localhost:3000)

3. **Se connecter**
   Entrez les informations de votre base de données (Hôte, Utilisateur, Mot de passe, Nom de la BDD) pour commencer à gérer vos données.

## 📁 Structure du Projet

```
database-manager/
├── public/          # Fichiers Frontend (HTML, CSS, JS)
│   ├── css/         # Styles
│   ├── js/          # Logique client
│   └── *.html       # Pages de l'interface
├── server.js        # Serveur Backend (Express + MySQL)
├── package.json     # Configuration et dépendances Node.js
└── README.md        # Documentation
```

## 💻 Stack Technique

- **Backend** : Node.js, Express.js
- **Base de Données** : MySQL2 (Driver)
- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)

---

## 👨‍💻 Auteur

Ce projet a été développé par **Mohamed ZAHZOUH**.

- 🌍 **LinkedIn** : [Mohamed ZAHZOUH](https://www.linkedin.com/in/mohamed-zahzouh-1402a7318/)
- 📧 **Contact** : [mohamedzahzouh2006@gmail.com](mailto:mohamedzahzouh2006@gmail.com)

---

<center>
  <sub>Réalisé avec ❤️</sub>
</center>
