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