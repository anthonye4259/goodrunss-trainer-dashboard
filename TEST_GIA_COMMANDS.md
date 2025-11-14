# 🧪 TEST GIA COMMANDS

Quick reference for testing GIA's AI agent capabilities.

---

## 🚀 HOW TO TEST

### **Option 1: Via Browser Console (easiest)**

1. Start dev server: `npm run dev`
2. Open dashboard in browser
3. Open browser console (F12)
4. Paste commands below

### **Option 2: Via curl**

```bash
# Make sure server is running
npm run dev

# Then use curl commands below
```

---

## 📋 TEST COMMANDS

### **1. Calendar Management**

```javascript
// View today's schedule
await fetch('/api/gia/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What's on my schedule today?"
  })
}).then(r => r.json()).then(console.log)

// Find available slots
await fetch('/api/gia/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "When am I free tomorrow?"
  })
}).then(r => r.json()).then(console.log)

// Add a session (will prompt to create client if not exists)
await fetch('/api/gia/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Add a session with John tomorrow at 2pm"
  })
}).then(r => r.json()).then(console.log)
```

---

### **2. Client Management**

```javascript
// Create a new client
await fetch('/api/gia/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Add a new client named Mike Johnson, email mike@test.com"
  })
}).then(r => r.json()).then(console.log)

// Search for clients
await fetch('/api/gia/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Search for John"
  })
}).then(r => r.json()).then(console.log)

// List all clients
await fetch('/api/gia/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "How many clients do I have?"
  })
}).then(r => r.json()).then(console.log)
```

---

### **3. Revenue & Payments**

```javascript
// Check revenue for the week
await fetch('/api/gia/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "How much did I make this week?"
  })
}).then(r => r.json()).then(console.log)

// Create an invoice
await fetch('/api/gia/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Send an invoice to Mike for $75"
  })
}).then(r => r.json()).then(console.log)
```

---

### **4. AI Persona Earnings**

```javascript
// Check AI Persona earnings
await fetch('/api/gia/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "How much have I earned from my AI Persona this month?"
  })
}).then(r => r.json()).then(console.log)
```

---

### **5. Messaging**

```javascript
// Send a message to a client
await fetch('/api/gia/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Send a message to Mike: Great session today!"
  })
}).then(r => r.json()).then(console.log)
```

---

### **6. Multi-Step Conversation**

```javascript
// Start conversation
const conv1 = await fetch('/api/gia/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What's my schedule tomorrow?"
  })
}).then(r => r.json())

console.log(conv1)
const convId = conv1.conversationId

// Continue conversation (GIA remembers context)
const conv2 = await fetch('/api/gia/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "When am I free?",
    conversationId: convId
  })
}).then(r => r.json())

console.log(conv2)
```

---

## 🔧 CURL COMMANDS

```bash
# View schedule
curl -X POST http://localhost:3000/api/gia/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is on my schedule today?"}'

# Create client
curl -X POST http://localhost:3000/api/gia/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Add client Mike Johnson, email mike@test.com"}'

# Check revenue
curl -X POST http://localhost:3000/api/gia/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How much did I make this month?"}'

# AI Persona earnings
curl -X POST http://localhost:3000/api/gia/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me AI Persona earnings for this week"}'
```

---

## ✅ EXPECTED RESULTS

### **Successful Response:**

```json
{
  "success": true,
  "response": "✅ Done! Session created with Mike on 2025-11-11 at 14:00. Confirmation email sent.",
  "conversationId": "cm...",
  "functionCalls": [
    {
      "function": "create_calendar_event",
      "params": {
        "clientName": "Mike",
        "date": "2025-11-11",
        "time": "14:00"
      },
      "result": {
        "success": true,
        "message": "✅ Session created!",
        "data": { ... }
      }
    }
  ]
}
```

### **Error Response (Client not found):**

```json
{
  "success": true,
  "response": "Client 'John' not found. Would you like to create them first?",
  "conversationId": "cm...",
  "functionCalls": [
    {
      "function": "create_calendar_event",
      "params": { ... },
      "result": {
        "success": false,
        "error": "Client not found"
      }
    }
  ]
}
```

---

## 🎯 WHAT TO LOOK FOR

1. ✅ **Function calls happen automatically** - Check `functionCalls` array
2. ✅ **Natural language parsed** - "tomorrow" becomes actual date
3. ✅ **Conversation context preserved** - Use same `conversationId`
4. ✅ **Graceful errors** - GIA explains what went wrong
5. ✅ **Actions completed** - Check database for created bookings/clients

---

## 🐛 TROUBLESHOOTING

### **"Unauthorized" Error:**
- Make sure you're logged in with Clerk
- Check cookies are enabled

### **"Anthropic API Error":**
- Verify `ANTHROPIC_API_KEY` in `.env`
- Check API key is valid

### **"Client not found":**
- This is expected if client doesn't exist
- GIA will ask if you want to create them

### **No function calls happening:**
- Check console for Claude's response
- Verify `giaFunctions` are loaded
- Check if message is clear enough

---

## 📝 NOTES

- GIA needs at least 1 client in your database to schedule sessions
- Some functions are stubs (marked with TODO) and will return "not yet implemented"
- Conversation IDs are required to maintain context
- All actions require Clerk authentication

---

**Ready to test? Start with the simple commands and work your way up!** 🚀

