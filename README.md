# USSD Emulator (React + Next.js)

This project is a **USSD interface emulator** designed to test USSD APIs locally via a user-friendly mobile-style interface. It simulates a real user interacting with a USSD server (`POST /api/ussd`) by providing a numeric keypad, session handling, and display screen.

## 🚀 Quick Demo

<img src="https://github.com/didiamuri/ussd-emulator/ussd-simulator-preview.png" alt="USSD Emulator Preview" width="400"/>

---

## ✨ Features

- Mobile-style keypad interface
- Session management using `sessionId`
- Displays USSD responses (`CON` or `END`)
- Works with any local or remote USSD API
- Session reset, backspace, and send buttons
- Customizable USSD API URL

---

## 📦 Installation

1. **Clone the repository**:

```bash
git clone https://github.com/didiamuri/ussd-emulator.git
cd ussd-emulator
```

2. **Install dependencies**:
```bash
bun install
```

3. **Start the development server**:
```bash
bun run dev 
```
---

# 🔧 API Endpoint
Inside the emulator interface, you can change the USSD API URL to test. By default, it points to:


```bash
http://localhost:3000/api/ussd
```
Make sure you have this file in your project: app/api/ussd/route.ts

Example route.ts
```ts
// src/app/api/ussd/route.ts
import { NextResponse } from 'next/server';

// Interface for the incoming request data
interface UssdRequest {
  sessionId: string;
  phoneNumber: string;
  serviceCode: string;
  text: string;
}

// A map to store the session state (simulated)
const sessions = new Map<string, 'menu' | 'balance' | 'buy_data'>();

// The POST function that handles all USSD requests
export async function POST(req: Request) {
  const { sessionId, serviceCode, text }: UssdRequest = await req.json();
  let responseMessage = '';
  let status = 'CON';

  let currentStep = sessions.get(sessionId) || 'menu';

  if (serviceCode === '*123#') {
    // Initial case (first request) or return to the main menu
    if (text === '' || text === '0') {
      responseMessage = 'Welcome!\n1. Check my balance\n2. Buy a data plan\n0. Back';
      sessions.set(sessionId, 'menu');
    }
    // Case of the user's response
    else {
      if (currentStep === 'menu') {
        switch (text) {
          case '1':
            responseMessage = 'Your balance is 15.50 USD.\n0. Back';
            sessions.set(sessionId, 'balance');
            break;
          case '2':
            responseMessage = 'Data plans:\n1. 1 GB - 5 USD\n2. 5 GB - 15 USD\n0. Back';
            sessions.set(sessionId, 'buy_data');
            break;
          default:
            responseMessage = 'Invalid choice. Please try again.\n1. Check my balance\n2. Buy a data plan\n0. Back';
            sessions.set(sessionId, 'menu');
            break;
        }
      } else if (currentStep === 'buy_data') {
        switch (text) {
          case '1':
          case '2':
            responseMessage = 'Purchase successful! Your plan will be activated shortly. Thank you!\n'
            status = 'END';
            sessions.delete(sessionId);
            break;
          default:
            responseMessage = 'Invalid choice. Please try again.\n1. 1 GB - 5 USD\n2. 5 GB - 15 USD\n0. Back';
            break;
        }
      } else if (currentStep === 'balance') {
        responseMessage = 'Your balance is 15.50 USD.\n0. Back';
      }
    }
  } else {
    // If the service code is incorrect
    responseMessage = 'Unknown USSD service.';
    status = 'END';
    sessions.delete(sessionId);
  }

  // If the session ends, we clear the state
  if (status === 'END') {
    sessions.delete(sessionId);
  }

  // API response with the correct status
  const apiResponse = {
    status: status,
    message: responseMessage,
  };

  return NextResponse.json(apiResponse);
}
```
---

# 📤 API Request Example
```json
{
  "sessionId": "a1b2c3d4-uuid",
  "phoneNumber": "243810000000",
  "serviceCode": "*123#",
  "text": "1*2"
}
---

# 📥 Expected API Response
```json
{
  "status": "CON",
  "message": "Main menu\n1. Balance\n2. Transfer"
}
```

* status: "CON" to continue session, "END" to terminate
* message: text to be shown on the emulator screen

---

# 🛠️ Built With
* Next.js 13+ (App Router)
* React / TypeScript
* TailwindCSS
* lucide-react (icons)
* uuid (session management)

---

# 🤝 Contributing
Pull requests are welcome! Feel free to fork and improve.