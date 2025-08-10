'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuidv4 } from 'uuid';
import { Phone, RefreshCw, Delete } from 'lucide-react';

// Make sure to install the required packages: bun add uuid lucide-react

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
  const [ussdUrl, setUssdUrl] = useState<string>('http://localhost:3000/api/ussd');
  const [display, setDisplay] = useState<string>('Welcome to the USSD emulator. Enter the USSD code to begin.');
  const [input, setInput] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  // Function to handle input from the virtual keypad
  const handleKeypadInput = (key: string) => {
    setInput((prevInput) => prevInput + key);
  };
  
  // Function to delete the last character
  const handleDeleteInput = () => {
    setInput((prevInput) => prevInput.slice(0, -1));
  };

  const handleSend = async () => {
    if (!ussdUrl || !input) {
      setDisplay('Please first enter the API URL and a USSD code or a response.');
      return;
    }

    setIsLoading(true);

    const isNewSession = !isSessionActive;
    const currentSessionId = isNewSession ? uuidv4() : sessionId;

    try {
      const requestBody: UssdApiRequest = {
        sessionId: currentSessionId,
        phoneNumber: '243812345678',
        serviceCode: isNewSession ? input : '*123#',
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Card className="max-w-sm overflow-hidden rounded-[40px] shadow-2xl border-4 border-gray-800 w-[350px] relative">
        <div className="absolute top-0 right-0 left-0 bg-gray-800 text-white text-center py-2 text-sm rounded-t-[40px]">
          USSD Emulator
        </div>
        <CardContent className="flex flex-col gap-4 p-0 mt-8">
          <div className="bg-gray-50 flex flex-col justify-end p-4 relative overflow-y-auto min-h-[12rem] max-h-[18rem]">
            <Textarea
              className="w-full h-full text-sm resize-none bg-transparent border-none focus:ring-0"
              readOnly
              value={display}
            />
          </div>
          <div className="bg-white p-4">
            {/* The user input display has been moved here */}
            <div className="mb-4 flex text-center items-center justify-center">
              <div>{input}</div>
            </div>

            <div className='flex items-center justify-center border-t p-4'>
              <div className="grid grid-cols-3 gap-6">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="h-12 w-12 text-xl"
                    onClick={() => handleKeypadInput(key)}
                    disabled={isLoading}
                  >
                    {key}
                  </Button>
                ))}
                {/* Bottom row of the keypad */}
                <Button
                  variant="outline"
                  className="h-12 w-12 text-xl"
                  onClick={() => handleKeypadInput('*')}
                  disabled={isLoading}
                >
                  *
                </Button>
                <Button
                  variant="outline"
                  className="h-12 w-12 text-xl"
                  onClick={() => handleKeypadInput('0')}
                  disabled={isLoading}
                >
                  0
                </Button>
                <Button
                  variant="outline"
                  className="h-12 w-12 text-xl"
                  onClick={() => handleKeypadInput('#')}
                  disabled={isLoading}
                >
                  #
                </Button>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <Button
                variant="outline"
                className="rounded-full h-16 w-16 bg-red-500 hover:bg-red-600 text-white"
                onClick={handleNewSession}
                disabled={isLoading}
              >
                <RefreshCw size={24} />
              </Button>
              <Button
                className="rounded-full h-16 w-16 bg-green-500 hover:bg-green-600"
                onClick={handleSend}
                disabled={!ussdUrl || !input || isLoading}
              >
                <Phone size={24} />
              </Button>
              <Button
                variant="outline"
                className="rounded-full h-16 w-16 bg-gray-200 hover:bg-gray-300 text-black"
                onClick={handleDeleteInput}
                disabled={isLoading}>
                <Delete size={24} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 w-full max-w-sm">
        <label htmlFor="ussd-url" className="text-sm font-medium">USSD API URL</label>
        <Input
          id="ussd-url"
          type="text"
          placeholder="https://your-api.com/ussd"
          value={ussdUrl}
          onChange={(e) => setUssdUrl(e.target.value)}
        />
      </div>
    </div>
  );
}