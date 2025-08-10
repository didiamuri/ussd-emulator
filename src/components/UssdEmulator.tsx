'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuidv4 } from 'uuid'; // To generate a unique sessionId

// Don't forget to install uuid: bun add uuid

interface UssdApiRequest {
  sessionId: string;
  phoneNumber: string;
  serviceCode: string;
  text: string;
}

interface UssdApiResponse {
  status: 'CON' | 'END';
  message: string;
}

export function UssdEmulator() {
  const [ussdUrl, setUssdUrl] = useState<string>('');
  const [display, setDisplay] = useState<string>('Welcome to the USSD emulator. Enter your API URL and a USSD code to begin.');
  const [input, setInput] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  const handleSend = async () => {
    if (!ussdUrl || !input) {
      setDisplay('Please enter the API URL and a USSD code or a response first.');
      return;
    }

    setIsLoading(true);

    const isNewSession = !isSessionActive;
    const currentSessionId = isNewSession ? uuidv4() : sessionId;

    try {
      const requestBody: UssdApiRequest = {
        sessionId: currentSessionId,
        phoneNumber: '243812345678', // Test phone number
        serviceCode: isNewSession ? input : '*123#', // The serviceCode is typically the initial code
        text: isNewSession ? '' : input,
      };

      const response = await fetch(ussdUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data: UssdApiResponse = await response.json();
      setDisplay(data.message);
      setSessionId(currentSessionId);
      setIsSessionActive(data.status === 'CON');
      setInput('');

    } catch (error) {
      setDisplay(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setIsSessionActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    setDisplay('Welcome to the USSD emulator. Enter the USSD code to begin.');
    setInput('');
    setSessionId('');
    setIsSessionActive(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>USSD Emulator</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <label htmlFor="ussd-url" className="text-sm font-medium">USSD API URL</label>
            <Input
              id="ussd-url"
              type="text"
              placeholder="https://your-api.com/ussd"
              value={ussdUrl}
              onChange={(e) => setUssdUrl(e.target.value)}
            />
          </div>
          <div className="relative border rounded-lg p-4 h-64 bg-gray-50 flex flex-col justify-end">
            <Textarea
              className="absolute inset-0 w-full h-full p-2 text-sm resize-none bg-transparent border-none focus:ring-0"
              readOnly
              value={display}
            />
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={isSessionActive ? 'Your response...' : 'USSD code (e.g., *123#)'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!ussdUrl || isLoading}
            />
            <Button onClick={isSessionActive ? handleSend : handleSend} disabled={!ussdUrl || !input || isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
          {!isSessionActive && (
            <Button variant="outline" onClick={handleNewSession} className="mt-2">
              New session
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}