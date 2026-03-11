# iChores Backend

Node.js/Express.js + TypeScript + GraphQL Yoga + MongoDB

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the env file and fill in your values
cp .env.example .env

# 3. Start MongoDB locally (or use MongoDB Atlas free tier)
# If using Atlas: paste your connection string into MONGODB_URI in .env

# 4. Run in development mode (auto-restarts on file changes)
npm run dev
```

Open http://localhost:8080/graphql for the GraphiQL IDE.

---

## Project Structure

```
src/
├── app.ts                # Entry point — server setup
├── models/
│   ├── User.ts           # User schema + password hashing
│   ├── Household.ts      # Household + members
│   ├── Room.ts           # Floor plan rooms
│   └── Task.ts           # Tasks + auto-recurring logic
├── graphql/
│   ├── user.ts           # GraphQL user schema (the API contract) and resolvers
|   ├── household.ts      # GraphQL household schema and resolvers
│   ├── room.ts           # GraphQL room schema and resolvers
|   ├── task.ts           # GraphQLtask schema and resolvers
│   ├── index.ts          # The actual logic for each query/mutation
│   └── context.ts        # Auth helpers + JWT utilities
└── utils/
    └── connectDB.ts      # MongoDB connection
```

---

## Some Example GraphQL Operations

Paste these into GraphiQL to test your API.

### Sign Up
```graphql
mutation {
  signUp(input: {
    name: "Kazi"
    email: "kazi@example.com"
    password: "secret123"
  }) {
    token
    user {
      id
      name
      email
    }
  }
}
```

### Sign In
```graphql
mutation {
  signIn(input: {
    email: "kazi@example.com"
    password: "secret123"
  }) {
    token
    user { id name }
  }
}
```

> After signing in, copy the token. In GraphiQL, add a header:
> `Authorization: Bearer YOUR_TOKEN_HERE`

### Create Household
```graphql
mutation {
  createHousehold(input: { name: "Our Home" }) {
    id
    name
    members { name role }
  }
}
```

### Add a Household Member
```graphql
mutation {
  addMember(input: { name: "Wife" }) {
    members { name role }
  }
}
```

### Create a Room
```graphql
mutation {
  createRoom(input: {
    type: bathroom
    label: "Main Bath"
    icon: "🚿"
    color: "#081c28"
    position: { x: 260, y: 180, w: 80, h: 100 }
  }) {
    id
    label
    type
  }
}
```

### Create a Task
```graphql
mutation {
  createTask(input: {
    roomId: "PASTE_ROOM_ID_HERE"
    title: "Clean the toilet"
    dueDate: "2025-03-10T00:00:00.000Z"
    recur: weekly
    assigneeName: "Wife"
  }) {
    id
    title
    urgency
    dueDate
  }
}
```

### Get All Rooms with Their Tasks
```graphql
query {
  myRooms {
    id
    label
    icon
    position { x y w h }
    tasks {
      id
      title
      urgency
      assigneeName
      dueDate
    }
  }
}
```

### Complete a Task
```graphql
mutation {
  completeTask(input: {
    taskId: "PASTE_TASK_ID_HERE"
    completedBy: "Wife"
  })
}
```

---


**JWT Flow**
1. Sign up/in → get a token
2. Store token on client
3. Send as header: `Authorization: Bearer <token>`
4. Server decodes it → knows who you are
