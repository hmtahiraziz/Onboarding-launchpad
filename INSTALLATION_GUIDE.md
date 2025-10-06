# Paramount Launchpad - Complete Installation Guide 🚀

This comprehensive guide covers installation and setup for all components of the Paramount Launchpad system.

## 📋 System Requirements

### Minimum Requirements
- **OS**: Linux, macOS, or Windows 10+
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **CPU**: 4 cores minimum, 8 cores recommended

### Required Software
- **Node.js**: 21.7.0+ (for backend and frontend)
- **Python**: 3.11+ (for curation service)
- **PostgreSQL**: 15+ (for database)
- **Docker**: 20.10+ (recommended)
- **Docker Compose**: 2.0+ (recommended)
- **Git**: 2.30+ (for cloning)

## 🚀 Quick Installation (Recommended)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd hackathon
```

### Step 2: Start with Docker
```bash
# Start all services
docker compose up -d

# Check status
docker compose ps
```

### Step 3: Setup Backend
```bash
cd backend
npm install
cp env.example .env
npm run migrate
npm run dev
```

### Step 4: Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### Step 5: Verify Installation
```bash
# Check all services
curl http://localhost:3000/health  # Backend
curl http://localhost:8000/health  # Curation
open http://localhost:5173         # Frontend
```

## 🔧 Detailed Installation

### Backend Setup
See [backend/README.md](backend/README.md) for complete backend documentation.

### Curation Service Setup
See [curation-service/README.md](curation-service/README.md) for complete curation service documentation.

### Frontend Setup
See [frontend/README.md](frontend/README.md) for complete frontend documentation.

## 🐛 Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in .env files
2. **Database connection**: Check PostgreSQL is running
3. **Memory issues**: Increase Docker memory limits
4. **Permission errors**: Check file permissions

### Getting Help
- Check individual service README files
- Review logs: `docker compose logs [service]`
- Run health checks for each service

## ✅ Success Criteria

Installation is successful when:
- [ ] All services start without errors
- [ ] Health checks return 200 OK
- [ ] Frontend loads in browser
- [ ] Product curation API responds
- [ ] Database migrations complete

---

**Need help?** Check the individual README files for each service or review the main project README.
