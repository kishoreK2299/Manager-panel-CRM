text
# 🎯 Manager Panel CRM

<div align="center">

![Globentix CRM](https://img.shields.io/badge/CRM-Manager%20Panel-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

**A comprehensive Customer Relationship Management system for sales teams and managers**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Overview

Globentix CRM Manager Panel is a full-featured customer relationship management system designed to streamline sales processes, manage customer interactions, and boost team productivity. Built with vanilla JavaScript for lightweight performance and easy deployment.

## ✨ Features

### 🎨 Core Modules

- **📊 Dashboard** - Real-time metrics, KPIs, and visual analytics
- **👥 Leads Management** - Capture, track, and nurture potential customers
- **🤝 Deals Pipeline** - Visual deal stages and sales forecasting
- **📇 Contacts** - Comprehensive contact database with interaction history
- **🏢 Accounts** - Manage company relationships and organizational hierarchies
- **✅ Tasks** - Task management with priorities, assignments, and deadlines
- **👨‍💼 Team Collaboration** - Team member management and performance tracking
- **📈 Reports & Analytics** - Generate insights from your CRM data
- **⚙️ Settings** - Customizable configurations and preferences

### 🚀 Key Capabilities

- ✅ **Zero Backend Required** - Fully client-side application
- 💾 **LocalStorage Persistence** - Data saved locally in browser
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔍 **Global Search** - Quick search across all entities
- 🔔 **Notifications** - Real-time alerts and reminders
- 📊 **Chart.js Integration** - Beautiful data visualizations
- 🎨 **Modern UI/UX** - Clean, intuitive interface with Font Awesome icons
- 🌐 **No Dependencies** - Pure vanilla JavaScript (ES6+)

## 🎥 Demo

Open `index.html` in your browser to see the CRM in action!

## 🛠️ Installation

### Quick Start

Clone the repository
git clone https://github.com/kishoreK2299/Manager-panel-CRM.git

Navigate to the project
cd Manager-panel-CRM/Manager\ Panel/src

Open in browser (choose one method)
Method 1: Direct file open
open index.html

Method 2: Using Python HTTP server
python -m http.server 8000

Method 3: Using Node.js
npx serve

Method 4: Using PHP
php -S localhost:8000

text

### Access the Application

Visit `http://localhost:8000` in your browser (if using a local server)

## 📂 Project Structure

Manager-panel-CRM/
└── Manager Panel/
└── src/
├── 📄 index.html # Main application entry
├── 🎨 style.css # Global styles and themes
├── ⚙️ main.js # Core application logic
├── 🧭 navigation.js # SPA routing system
├── 💾 storage.js # LocalStorage API wrapper
├── 📊 dashboard.js # Dashboard module
├── 👥 leads.js # Lead management
├── 🤝 deals.js # Deal pipeline
├── 📇 contacts.js # Contact management
├── 🏢 accounts.js # Account management
├── ✅ tasks.js # Task tracking
├── 👨‍💼 team.js # Team collaboration
├── 📈 report.js # Analytics & reporting
├── ⚙️ settings.js # Configuration panel
└── 📁 assets/ # Images & static files

text

## 💻 Usage

### Getting Started

1. **Initial Setup**
   - Open the application in your web browser
   - Navigate through the sidebar to explore different modules
   - Start by adding your first lead or contact

2. **Managing Data**
   - **Create**: Use the "+" or "Add New" buttons in each module
   - **Edit**: Click on any record to view/edit details
   - **Delete**: Use the delete option in record actions
   - **Search**: Use the global search bar in the header

3. **Data Persistence**
   - All data is automatically saved to browser LocalStorage
   - Data persists across browser sessions
   - Export your data regularly from Settings

### Key Workflows

#### Lead to Deal Conversion
Leads → Qualify → Convert to Contact → Create Deal → Close Won

text

#### Task Management
Create Task → Assign to Team Member → Set Priority → Track Progress → Complete

text

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure and semantics |
| **CSS3** | Styling and responsive design |
| **JavaScript (ES6+)** | Core application logic |
| **Chart.js** | Data visualization |
| **Font Awesome 6.4** | Icon library |
| **Google Fonts (Poppins)** | Typography |
| **LocalStorage API** | Client-side data persistence |

## 🌐 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | ✅ Latest |
| Firefox | ✅ Latest |
| Safari | ✅ Latest |
| Edge | ✅ Latest |

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## 🔐 Data Security

- All data stored locally in browser
- No external server communication
- Clear browser data to reset CRM
- Export feature for data backup

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

- Data limited by browser LocalStorage capacity (~5-10MB)
- No multi-user collaboration (single browser instance)
- Export format currently limited to JSON

## 🚀 Future Enhancements

- [ ] Backend API integration
- [ ] Real-time collaboration
- [ ] Email integration
- [ ] Calendar sync
- [ ] Mobile app version
- [ ] Advanced reporting dashboards
- [ ] Custom fields and workflows
- [ ] Import from CSV/Excel

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Kishore K**
- GitHub: [@kishoreK2299](https://github.com/kishoreK2299)
- Company: Globentix Technology Company

## 🙏 Acknowledgments

- Built as a learning project for full-stack CRM development
- Inspired by leading CRM platforms like HubSpot and Zoho
- Special thanks to the open-source community

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact through GitHub profile

---

<div align="center">

**Made with ❤️ by Kishore K**

⭐ Star this repo if you find it helpful!

</div>
