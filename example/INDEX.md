# 📚 Example Documentation Index

Welcome to the complete example for `express-swagger-autogen`! This directory contains a full working application demonstrating all features of the library.

## 📖 Documentation Files

### 🚀 [QUICKSTART.md](./QUICKSTART.md)
**Start here!** Get the example running in 3 minutes.
- Installation steps
- Running the server
- Testing authentication
- Quick tips

### 📘 [README.md](./README.md)
**Complete guide** to the example project.
- Project structure
- Detailed feature explanations
- API endpoint reference
- Troubleshooting guide
- Tips for your own project

### 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)
**Deep dive** into how everything works.
- Request flow diagrams
- Component architecture
- Middleware detection process
- Auto-detection internals
- Performance considerations

## 🎯 Choose Your Path

### I want to run it NOW!
→ Go to [QUICKSTART.md](./QUICKSTART.md)

### I want to understand how it works
→ Go to [README.md](./README.md)

### I want to see the technical details
→ Go to [ARCHITECTURE.md](./ARCHITECTURE.md)

### I want to see the code
→ Start with [server.js](./server.js)

## 📁 Project Files

```
example/
├── 📚 Documentation
│   ├── INDEX.md (this file)
│   ├── QUICKSTART.md
│   ├── README.md
│   └── ARCHITECTURE.md
│
├── 🚀 Application
│   ├── server.js              # Main entry point
│   ├── package.json           # Dependencies
│   └── .env.example           # Environment template
│
├── 🛣️ Routes
│   ├── routes/index.js        # Main router
│   ├── routes/auth.routes.js  # Auth endpoints
│   └── routes/users.routes.js # User endpoints
│
├── 🎮 Controllers
│   ├── controllers/auth.controller.js
│   └── controllers/users.controller.js
│
├── 🔒 Middleware
│   └── middleware/verifyToken.js
│
└── 📋 Swagger Configuration
    └── swagger/
        ├── README.md              # Manual schemas guide
        ├── QUICK_REFERENCE.md     # Quick reference card
        └── manualSchemas.js       # Schema definitions
```

## 🎓 Learning Path

### Beginner
1. Read [QUICKSTART.md](./QUICKSTART.md)
2. Run the example
3. Try the API in Swagger UI
4. Look at [server.js](./server.js)

### Intermediate
1. Read [README.md](./README.md)
2. Explore the route files
3. Check out the middleware
4. Modify the example

### Advanced
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Study the library source code
3. Understand the detection algorithms
4. Contribute improvements

## 💡 Key Concepts

### 1. Minimal Configuration
The library works with minimal setup - just call `initSwagger()` after registering routes.

### 2. Automatic Detection
Routes, middleware, and parameters are automatically discovered and documented.

### 3. Smart Analysis
Middleware is analyzed by name and code patterns to determine its purpose.

### 4. Manual Override
Complex schemas can be manually defined when auto-detection isn't enough.

## 🔗 Quick Links

- [Main Library README](../README.md)
- [npm Package](https://www.npmjs.com/package/@artonramadani/express-swagger-autogen)
- [GitHub Repository](https://github.com/ArtonRamadani/express-swagger-autogen)

## ❓ Common Questions

### Q: Do I need to modify my existing code?
**A:** No! The library works with your existing Express app. Just add `initSwagger()` after your routes.

### Q: Will it work with my authentication?
**A:** Yes! It automatically detects JWT and other auth middleware by analyzing function names and code patterns.

### Q: What about complex request bodies?
**A:** Use manual schemas for arrays, nested objects, or complex validation. See the example in [server.js](./server.js).

### Q: Can I customize the documentation?
**A:** Yes! You can customize titles, descriptions, servers, security schemes, and more. See [Configuration Options](../README.md#configuration-options).

### Q: Does it work with TypeScript?
**A:** Yes! The library works with both JavaScript and TypeScript projects.

## 🤝 Contributing

Found an issue or have a suggestion?
- Open an issue on GitHub
- Submit a pull request
- Share your use case

## 📄 License

MIT - See [LICENSE](../LICENSE)

---

**Ready to get started?** → [QUICKSTART.md](./QUICKSTART.md)

**Need help?** → [README.md#troubleshooting](./README.md#-troubleshooting)
