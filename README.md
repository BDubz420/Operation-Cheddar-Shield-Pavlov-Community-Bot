# O.C.S Discord Bot

Operational community management and training platform built for Discord military / tactical gaming communities.

Designed around persistent systems, live training coordination, server telemetry, moderation utilities, and structured operational workflows.

---

# Features

## Core Systems

* Modular command/event architecture
* TypeScript + Discord.js v14
* Prisma ORM integration
* Persistent SQLite database
* PM2 deployment support
* Persistent interaction handling
* Dynamic button + regex interaction system

---

# Pavlov Server Integration

* BattlEye UDP integration
* Multi-server support
* Live server status boards
* Server registration/removal commands
* Persistent telemetry tracking
* RCON command dispatching
* Auto-updating server panels

---

# Training System

## Trainer Requests

Users can:

* Request training by branch
* Join active sessions
* Leave sessions
* Track live training states

Trainers can:

* Claim requests
* Start sessions
* End sessions
* Review trainees
* Certify or fail recruits

---

# Session Lifecycle

Training sessions move through structured states:

WAITING
→ ACTIVE
→ CERTIFICATION
→ COMPLETED

---

# Certification System

* Persistent certification records
* Pass / fail / no-show tracking
* Branch-based certification roles
* Instructor attribution
* Session audit history
* `/certs` command
* Trainer statistics system

---

# Training Logs

* Dedicated training log channels
* Automatic session summaries
* Certification reporting
* Instructor analytics
* Recruit progression tracking

---

# Moderation Systems

* Lockdown tools
* Moderation utilities
* Notification systems
* Rules management
* Persistent rule panels
* Configurable embeds/panels

---

# DEFCON System

* DEFCON status management
* Live operational status boards
* Tactical embed styling
* Alert escalation support

---

# Planned Systems

* Promotion framework
* Qualification requirements
* Instructor leaderboards
* Advanced telemetry parsing
* Persistent progression profiles
* Web dashboard/API layer
* Multi-guild scaling improvements

---

# Stack

* Node.js
* TypeScript
* Discord.js v14
* Prisma ORM
* SQLite
* PM2
* BattlEye UDP

---

# Installation

```bash
git clone <repo>
cd discord_ocs

npm install
```

---

# Environment

Create a `.env` file:

```env
DISCORD_TOKEN=
CLIENT_ID=
DATABASE_URL="file:./dev.db"
```

---

# Prisma

```bash
npx prisma generate
npx prisma db push
```

---

# Development

```bash
npm run dev
```

---

# Deploy Slash Commands

```bash
npm run deploy
```

---

# PM2 Production

```bash
pm2 start npm --name "ocs-bot" -- run dev
pm2 save
```

---

# Project Structure

```txt
src/
├── commands/
├── events/
├── handlers/
├── interactions/
├── services/
├── structures/
└── scripts/
```

---

# Notes

This project is actively developed and structured around operational scalability rather than simple utility commands. Most systems are database-backed and designed for persistent state tracking.

The training and certification framework is intended to support long-term progression systems and operational community management.

---

# License

Private project / internal use unless otherwise specified.
