# TrackFlow Database Schema

## Overview
TrackFlow uses a MySQL database with Sequelize ORM for data persistence. The schema is normalized to ensure data integrity and efficient queries.

## Entity Relationship Diagram

```
Users (1) ----< (N) Projects
Users (1) ----< (N) Issues (as assignee)
Users (1) ----< (N) Issues (as reporter)
Users (1) ----< (N) Comments
Users (1) ----< (N) ActivityLogs

Projects (1) ----< (N) Issues
Projects (1) ----< (N) ActivityLogs

Issues (1) ----< (N) Comments
Issues (1) ----< (N) ActivityLogs
```

## Tables

### users

Stores user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| username | VARCHAR(50) | NOT NULL, UNIQUE | User's display name |
| email | VARCHAR(100) | NOT NULL, UNIQUE | User's email address |
| password | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| avatar | VARCHAR(50) | DEFAULT '👤' | Emoji avatar |
| createdAt | DATETIME | NOT NULL | Account creation timestamp |
| updatedAt | DATETIME | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY on `id`
- UNIQUE on `username`
- UNIQUE on `email`

**Relationships:**
- Has many Projects (as owner)
- Has many Issues (as assignee)
- Has many Issues (as reporter)
- Has many Comments
- Has many ActivityLogs

---

### projects

Stores project information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Project name |
| description | TEXT | NULLABLE | Project description |
| ownerId | INT | NOT NULL, FOREIGN KEY | User who owns the project |
| createdAt | DATETIME | NOT NULL | Creation timestamp |
| updatedAt | DATETIME | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY on `id`
- FOREIGN KEY on `ownerId` references `users(id)`

**Relationships:**
- Belongs to User (as owner)
- Has many Issues
- Has many ActivityLogs

**Cascading Deletes:**
- When a project is deleted, all associated issues are deleted (CASCADE)

---

### issues

Stores issue/task information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR(200) | NOT NULL | Issue title |
| description | TEXT | NULLABLE | Issue description |
| priority | ENUM | NOT NULL, DEFAULT 'Medium' | Priority level |
| status | ENUM | NOT NULL, DEFAULT 'Open' | Workflow status |
| dueDate | DATE | NULLABLE | Due date for the issue |
| projectId | INT | NOT NULL, FOREIGN KEY | Associated project |
| assigneeId | INT | NULLABLE, FOREIGN KEY | User assigned to the issue |
| reporterId | INT | NOT NULL, FOREIGN KEY | User who reported the issue |
| createdAt | DATETIME | NOT NULL | Creation timestamp |
| updatedAt | DATETIME | NOT NULL | Last update timestamp |

**ENUM Values:**
- priority: 'Low', 'Medium', 'High', 'Critical'
- status: 'Open', 'In Progress', 'Review', 'Done'

**Indexes:**
- PRIMARY on `id`
- FOREIGN KEY on `projectId` references `projects(id)`
- FOREIGN KEY on `assigneeId` references `users(id)`
- FOREIGN KEY on `reporterId` references `users(id)`

**Relationships:**
- Belongs to Project
- Belongs to User (as assignee)
- Belongs to User (as reporter)
- Has many Comments
- Has many ActivityLogs

**Cascading Deletes:**
- When an issue is deleted, all associated comments are deleted (CASCADE)

---

### comments

Stores comments on issues.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| content | TEXT | NOT NULL | Comment content |
| issueId | INT | NOT NULL, FOREIGN KEY | Associated issue |
| userId | INT | NOT NULL, FOREIGN KEY | User who wrote the comment |
| createdAt | DATETIME | NOT NULL | Creation timestamp |
| updatedAt | DATETIME | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY on `id`
- FOREIGN KEY on `issueId` references `issues(id)`
- FOREIGN KEY on `userId` references `users(id)`

**Relationships:**
- Belongs to Issue
- Belongs to User

---

### activity_logs

Stores activity history for audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| action | VARCHAR(50) | NOT NULL | Action performed |
| description | TEXT | NULLABLE | Human-readable description |
| entityType | VARCHAR(50) | NOT NULL | Type of entity (issue, project) |
| entityId | INT | NOT NULL | ID of the entity |
| projectId | INT | NULLABLE, FOREIGN KEY | Related project (optional) |
| issueId | INT | NULLABLE, FOREIGN KEY | Related issue (optional) |
| userId | INT | NOT NULL, FOREIGN KEY | User who performed the action |
| createdAt | DATETIME | NOT NULL | Creation timestamp |
| updatedAt | DATETIME | NOT NULL | Last update timestamp |

**Action Types:**
- created
- updated
- deleted
- status_changed
- priority_changed
- assigned
- comment_added

**Entity Types:**
- project
- issue

**Indexes:**
- PRIMARY on `id`
- FOREIGN KEY on `projectId` references `projects(id)`
- FOREIGN KEY on `issueId` references `issues(id)`
- FOREIGN KEY on `userId` references `users(id)`

**Relationships:**
- Belongs to Project (optional)
- Belongs to Issue (optional)
- Belongs to User

---

## SQL Schema

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(50) DEFAULT '👤',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    ownerId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ownerId) REFERENCES users(id)
);

CREATE TABLE issues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
    status ENUM('Open', 'In Progress', 'Review', 'Done') NOT NULL DEFAULT 'Open',
    dueDate DATE,
    projectId INT NOT NULL,
    assigneeId INT,
    reporterId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigneeId) REFERENCES users(id),
    FOREIGN KEY (reporterId) REFERENCES users(id)
);

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    issueId INT NOT NULL,
    userId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (issueId) REFERENCES issues(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    entityType VARCHAR(50) NOT NULL,
    entityId INT NOT NULL,
    projectId INT,
    issueId INT,
    userId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id),
    FOREIGN KEY (issueId) REFERENCES issues(id),
    FOREIGN KEY (userId) REFERENCES users(id)
);
```

## Data Integrity

### Foreign Key Constraints
- All foreign keys ensure referential integrity
- Cascading deletes are used where appropriate (issues → comments)

### Unique Constraints
- User emails must be unique
- User usernames must be unique

### Not Null Constraints
- Essential fields are marked as NOT NULL to prevent incomplete data

### Default Values
- Avatar defaults to '👤'
- Priority defaults to 'Medium'
- Status defaults to 'Open'
- Timestamps default to current time

## Performance Considerations

### Indexes
- Primary keys are automatically indexed
- Foreign keys are indexed for faster joins
- Unique constraints create indexes

### Query Optimization
- Use Sequelize's eager loading (include) to avoid N+1 queries
- Implement pagination for large datasets
- Use indexed columns in WHERE clauses

### Data Types
- VARCHAR lengths are appropriate for the expected data
- TEXT is used for potentially long descriptions
- ENUM is used for fixed sets of values (priority, status)

## Security

### Password Storage
- Passwords are hashed using bcrypt before storage
- Plain text passwords are never stored

### Access Control
- Application-level ownership checks ensure users can only access their own data
- JWT tokens are used for authentication

### SQL Injection Prevention
- Sequelize ORM parameterizes all queries
- Raw SQL is avoided in favor of ORM methods
