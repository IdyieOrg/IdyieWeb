# 📘 IdyieWeb – Technical Documentation

## 1. Introduction

### Project name
**IdyieWeb**

### Description
Frontend for Idyie, a web application that allows users to interact with a database using natural language prompts. It interprets user input, generates SQL queries, executes them, and formats the results for display.
<!-- **Target audience**: Developers, DevOps, internal contributors.   -->

### Main technologies
- Ruby on Rails
- MariaDB
- Docker / Docker Compose
<!-- - Continuous Integration (CI)
- Environment Variables -->

## 2. ⚙️ Requirements

### Supported environments
- macOS, Linux recommended (Windows with WSL2 supported)
- Terminal access with `bash`/`zsh`

### Required software
- Docker & Docker Compose
- Git
- (Optional) Ruby / Rails / Node.js if not fully containerized

### Used ports
| Service     | Port |
|-------------|------|
| Rails (web) | 3030 |

## 3. 🚀 Installation & Launch

### 3.1 Clone the project
```bash
git clone git@github.com:IdyieOrg/IdyieWeb.git
cd IdyieWeb
```
### 3.2 Configure the environment
```bash
cp .env.example .env
```
### 3.3 Launch the application locally
```bash
docker compose build
docker compose up -d; docker attach idyie-web-application
```

## 4. 🏗 Project Structure
### 4.1 Simplified tree
```
.
├── app
│   ├── assets/
│   ├── channels/
│   ├── controllers/
│   ├── helpers/
│   ├── javascript/
│   ├── jobs/
│   ├── mailers/
│   ├── models/
│   ├── services/
│   └── views/
├── bin/
├── config/
├── config.ru
├── db
│   └── seeds.rb
├── docker
│   └── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── Gemfile
├── Gemfile.lock
├── .gitattributes
├── .github
│   └── workflows/
├── .gitignore
├── lib/
├── log/
├── .overcommit.yml
├── public/
├── Rakefile
├── README.md
├── .rubocop.yml
├── .ruby-version
├── spec
│   ├── models
│   ├── rails_helper.rb
│   ├── requests
│   └── spec_helper.rb
├── storage/
├── tmp/
└── vendor/
```

### 4.2 Main gems
- `httparty`: HTTP client for API requests
- `rubocop`: Ruby linter
- `sassc-rails`: CSS preprocessor for styles

##  5. 🔐 Environment Variables

A ```.env.example``` file is provided to configure the required variables:
```bash
# Application
IDYIE_API_URL=
PORT=
RAILS_ENV=
SECRET_KEY_BASE=

# Database
MYSQL_USER=
MYSQL_ROOT_PASSWORD=
MYSQL_PASSWORD=
MYSQL_DATABASE=
```
The variables are used to configure the Docker containers and database connection.

## 6. 🧪 Tests & Code Quality
Tool used:
- `rubocop`: Ruby linter

Useful commands:
```bash
docker exec -it idyie-web-application sh
bundle exec rubocop
```

## 7. 🔄 Continuous Integration / Continuous Delivery (CI/CD)
### CI Pipeline

GitHub Actions (or GitLab CI) is used to:
- Check code quality with RuboCop
- Build and push Docker images
<!-- - Run tests -->

### CI Configuration
The CI is run on every push to the `main` branch and on pull requests. The configuration is in the `.github/workflows/ci.yml` file.

### CD Pipeline
GitHub Actions (or GitLab CI) is used to deploy the application to production or staging environments. The deployment is triggered by merging to the `prod` branch.

### CD Configuration
The CD configuration is in the `.github/workflows/cd.yml` file. It builds the Docker image and deploys it to the production server and on the [Idyie site](https://idyie.site/).

## 8. 📚 Appendices
### Glossary
- CI: Continuous Integration
- CD: Continuous Delivery

### Useful links
- [GitHub Repository](https://github.com/IdyieOrg/IdyieAPI)
- [Github Organization](https://github.com/IdyieOrg)
- [CI/CD Dashboard](https://github.com/IdyieOrg/IdyieAPI/actions/)
- [Idyie site](https://idyie.site/)
<!-- - Swagger API Documentation (if available) -->

### Conventions
- Ruby style: official guidelines + Rubocop
