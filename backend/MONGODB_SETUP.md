# MongoDB Installation Required

MongoDB is not installed on your system. You have two options:

## Option 1: Install MongoDB Locally (Recommended for Development)

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service (recommended)
5. Verify installation:
   ```bash
   mongod --version
   ```

### Mac (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu):
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 2: Use MongoDB Atlas (Cloud - No Installation)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string
5. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/livemart
   ```

## After Installation

Start the backend server:
```bash
cd backend
npm run dev
```

The server will create the database and collections automatically on first run.
